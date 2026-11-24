/**
 * The modules a source file pulls in at runtime, followed through every local module
 * (issue #123). Used by the bundle rule in `lib/errorCopy.test.ts`: a client component must
 * not reach zod or the content loaders, directly or through another module.
 *
 * A regular-expression scan, not a parser: enough for this codebase's import style, and the
 * tests pin down every form it has to recognise. Type-only imports are skipped, because
 * TypeScript erases them and they never reach the browser.
 */

const SPECIFIER =
  /^\s*(?:import|export)\s+(type\s+)?(?:([^;'"]*?)\s+from\s+)?['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)/gm;

/** Specifiers this source loads at runtime, in order of appearance. */
export function runtimeImports(source: string): string[] {
  const found: string[] = [];
  for (const match of source.matchAll(SPECIFIER)) {
    const [, typeOnly, clause, specifier, dynamic] = match;
    if (dynamic) {
      found.push(dynamic);
      continue;
    }
    if (typeOnly) continue;
    // `import { type A, type B } from` erases to nothing; one value specifier keeps it.
    const braces = clause?.trim().match(/^\{([\s\S]*)\}$/);
    if (braces) {
      const names = braces[1]
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
      if (names.length > 0 && names.every((name) => name.startsWith('type '))) continue;
    }
    found.push(specifier);
  }
  return found;
}

export type SourceTree = {
  /** The text of a file, or `undefined` if there is none at that path. */
  read: (path: string) => string | undefined;
  /** The file a local specifier points to, or `null` for a package. */
  resolve: (specifier: string, from: string) => string | null;
};

/**
 * Every package and local file reachable at runtime from `entry`, each with the chain that
 * reaches it (entry first), so a failing test can say how a module got in.
 */
export function reachable(entry: string, tree: SourceTree): Map<string, string[]> {
  const seen = new Map<string, string[]>([[entry, [entry]]]);
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.shift()!;
    const source = tree.read(file);
    if (source === undefined) continue;
    for (const specifier of runtimeImports(source)) {
      const target = tree.resolve(specifier, file) ?? specifier;
      if (seen.has(target)) continue;
      seen.set(target, [...seen.get(file)!, target]);
      if (target !== specifier) queue.push(target);
    }
  }
  return seen;
}
