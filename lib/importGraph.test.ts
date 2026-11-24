import { describe, expect, it } from 'vitest';
import { reachable, runtimeImports, type SourceTree } from './importGraph';

/** An in-memory project: local specifiers start with `./` and name a key of `files`, extension optional. */
function tree(files: Record<string, string>): SourceTree {
  return {
    read: (path) => files[path],
    resolve: (specifier) => {
      if (!specifier.startsWith('./')) return null;
      const base = specifier.slice(2);
      return ['.ts', '.tsx'].map((extension) => base + extension).find((path) => path in files) ?? base;
    },
  };
}

describe('runtimeImports', () => {
  it('finds default, named, namespace, side-effect, re-export and dynamic imports', () => {
    const source = [
      "import React from 'react';",
      "import { a, b } from './ab';",
      "import * as all from './all';",
      "import './styles.css';",
      "export { c } from './c';",
      "export * from './star';",
      "const Scene = dynamic(() => import('./scene'));",
    ].join('\n');
    expect(runtimeImports(source)).toEqual(['react', './ab', './all', './styles.css', './c', './star', './scene']);
  });

  it('skips type-only imports and keeps a mixed one', () => {
    const source = [
      "import type { A } from './a';",
      "export type { B } from './b';",
      "import { type C, type D } from './cd';",
      "import { type E, f } from './ef';",
    ].join('\n');
    expect(runtimeImports(source)).toEqual(['./ef']);
  });

  it('reads an import that spans several lines', () => {
    expect(runtimeImports("import {\n  a,\n  b,\n} from './ab';")).toEqual(['./ab']);
  });

  it('ignores a specifier mentioned in a string that is not an import', () => {
    expect(runtimeImports("const text = 'from zod';")).toEqual([]);
  });
});

describe('reachable', () => {
  it('follows local modules and reports the chain to a package two steps away', () => {
    const graph = reachable(
      'Client.tsx',
      tree({
        'Client.tsx': "import { parse } from './parse';",
        'parse.ts': "import { helper } from './helper';",
        'helper.ts': "import { z } from 'zod';",
      }),
    );
    expect(graph.get('zod')).toEqual(['Client.tsx', 'parse.ts', 'helper.ts', 'zod']);
  });

  it('does not follow a type-only import', () => {
    const graph = reachable(
      'Client.tsx',
      tree({ 'Client.tsx': "import type { Shape } from './schema';", 'schema.ts': "import { z } from 'zod';" }),
    );
    expect(graph.has('zod')).toBe(false);
    expect(graph.has('schema.ts')).toBe(false);
  });

  it('stops on a cycle and on a file it cannot read', () => {
    const graph = reachable(
      'a.ts',
      tree({ 'a.ts': "import './b';\nimport './missing';", 'b.ts': "import './a';\nimport 'react';" }),
    );
    expect([...graph.keys()].sort()).toEqual(['a.ts', 'b.ts', 'missing', 'react']);
  });
});
