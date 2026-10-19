import { buildFieldAttributes, FIELD_POINTS } from '@/lib/sceneField';
import type { FrameUniforms } from '@/lib/sceneSim';
import { FIELD_FRAGMENT, FIELD_VERTEX, VERTEX_PRELUDE } from './fieldShader';

type GL = WebGL2RenderingContext | WebGLRenderingContext;

/**
 * The whole GPU side of the field: one program, two static buffers, one draw call of points.
 * Plain WebGL instead of three.js: the scene never needed a scene graph, and three plus
 * react-three-fiber cost ~230 KB gzip and a long start-up task for this one draw (issue #64).
 *
 * Throws when WebGL is unavailable or the shaders do not compile, so the caller's error
 * boundary can drop the canvas and keep the page.
 */
export function createFieldRenderer(canvas: HTMLCanvasElement) {
  const options: WebGLContextAttributes = { alpha: true, antialias: false, depth: true, powerPreference: 'high-performance' };
  const gl: GL | null = canvas.getContext('webgl2', options) ?? canvas.getContext('webgl', options);
  if (!gl) throw new Error('WebGL is not available');

  const program = linkProgram(gl, VERTEX_PRELUDE + FIELD_VERTEX, FIELD_FRAGMENT);
  gl.useProgram(program);

  const { position, cell } = buildFieldAttributes();
  bindAttribute(gl, program, 'position', position, 3);
  bindAttribute(gl, program, 'aCell', cell, 2);

  const uniforms = new Map<string, WebGLUniformLocation | null>();
  const at = (name: string) => {
    if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(program, name));
    return uniforms.get(name)!;
  };

  // Same state three used for this material: depth test on, depth writes off, no blending.
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.depthMask(false);
  gl.disable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);

  return {
    /** Resizes the drawing buffer to the canvas size in CSS pixels times `dpr`. */
    resize(width: number, height: number, dpr: number) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },

    draw(u: FrameUniforms) {
      for (const name of [
        'uWave',
        'uFlow',
        'uHeat',
        'uRadius',
        'uAmplitude',
        'uFrequency',
        'uForce',
        'uPulse',
        'uGlowScale',
        'uSize',
        'uScale',
      ] as const) {
        gl.uniform1f(at(name), u[name]);
      }
      gl.uniform2fv(at('uPointer'), u.uPointer);
      gl.uniform3fv(at('uBase'), u.uBase);
      gl.uniform3fv(at('uInk'), u.uInk);
      gl.uniformMatrix4fv(at('modelViewMatrix'), false, u.modelViewMatrix);
      gl.uniformMatrix4fv(at('projectionMatrix'), false, u.projectionMatrix);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, FIELD_POINTS);
    },
  };
}

export type FieldRenderer = ReturnType<typeof createFieldRenderer>;

function linkProgram(gl: GL, vertexSource: string, fragmentSource: string): WebGLProgram {
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertexSource],
    [gl.FRAGMENT_SHADER, fragmentSource],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  // Checked once, after linking: asking for a compile status earlier would make the driver
  // finish each shader before moving on, instead of compiling them in parallel.
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Field shader failed to link: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

function bindAttribute(gl: GL, program: WebGLProgram, name: string, data: Float32Array, size: number) {
  const location = gl.getAttribLocation(program, name);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}
