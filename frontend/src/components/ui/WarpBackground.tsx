import { useEffect, useRef } from "react";

interface ShaderSettings {
  proportion: number;
  softness: number;
  distortion: number;
  swirl: number;
  swirlIterations: number;
  shapeScale: number;
  scale: number;
  rotation: number;
  speed: number;
  colors: string[];
}

const SETTINGS: ShaderSettings = {
  proportion: 0.45,
  softness: 1,
  distortion: 0.25,
  swirl: 0.8,
  swirlIterations: 10,
  shapeScale: 0.1,
  scale: 1,
  rotation: 0,
  speed: 1,
  colors: [
    "hsl(200,100%,20%)",
    "hsl(160,100%,75%)",
    "hsl(180,90%,30%)",
    "hsl(170,100%,80%)",
  ],
};

type RGB = [number, number, number];

function hslToRgb(str: string): RGB {
  const m = (str.match(/[\d.]+/g) ?? []).map(Number);
  const h = m[0] / 360;
  const s = m[1] / 100;
  const l = m[2] / 100;
  const f = (n: number): number => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

function buildFragmentShader(settings: ShaderSettings): string {
  return [
    "precision highp float;",
    "uniform vec2 uRes;uniform float uTime;uniform vec3 uC[4];",
    `const float PROP=${settings.proportion.toFixed(3)};`,
    `const float SOFT=${settings.softness.toFixed(3)};`,
    `const float DIST=${settings.distortion.toFixed(3)};`,
    `const float SWIRL=${settings.swirl.toFixed(3)};`,
    `const float SSCALE=${settings.shapeScale.toFixed(3)};`,
    `const float ROT=${((settings.rotation * Math.PI) / 180).toFixed(4)};`,
    "void main(){",
    "  vec2 uv=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);",
    `  uv/=${settings.scale.toFixed(3)};`,
    "  float c=cos(ROT),s=sin(ROT);uv=mat2(c,-s,s,c)*uv;",
    "  uv*=SSCALE*40.;",
    "  float t=uTime;",
    `  for(int i=1;i<${settings.swirlIterations};i++){`,
    "    float fi=float(i);",
    "    uv.x+=(SWIRL+DIST)/fi*cos(t+fi*1.5*uv.y);",
    "    uv.y+=(SWIRL+DIST)/fi*cos(t+fi*1.0*uv.x);",
    "  }",
    "  float shape=.5+.5*sin(uv.x)*cos(uv.y);",
    "  shape=smoothstep(PROP-SOFT*.5-.001,PROP+SOFT*.5+.5,shape);",
    "  float x=clamp(shape,0.,1.)*3.;",
    "  vec3 col=mix(uC[0],uC[1],smoothstep(0.,1.,x));",
    "  col=mix(col,uC[2],smoothstep(1.,2.,x));",
    "  col=mix(col,uC[3],smoothstep(2.,3.,x));",
    "  gl_FragColor=vec4(col,1.);",
    "}",
  ].join("\n");
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

export interface WarpBackgroundProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function WarpBackground({ id = "warp", className, style }: WarpBackgroundProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const program = gl.createProgram();
    if (!program) return;

    const vertexShader = compileShader(
      gl,
      gl.VERTEX_SHADER,
      "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"
    );
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      buildFragmentShader(SETTINGS)
    );
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
      throw new Error("Could not create background buffer");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, "uRes");
    const time = gl.getUniformLocation(program, "uTime");
    const colors = gl.getUniformLocation(program, "uC");
    if (!resolution || !time || !colors) {
      gl.deleteBuffer(buffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
      throw new Error("Could not initialize background shader uniforms");
    }
    gl.uniform3fv(
      colors,
      new Float32Array(SETTINGS.colors.flatMap((color) => hslToRgb(color)))
    );

    const resize = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const parent = canvas.parentElement;
      const width = parent && parent.clientWidth > 0 ? parent.clientWidth : window.innerWidth;
      const height = parent && parent.clientHeight > 0 ? parent.clientHeight : window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
      ro = new ResizeObserver(() => {
        resize();
      });
      ro.observe(canvas.parentElement);
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const start = performance.now();
    let animationFrame = 0;
    const render = (now: number): void => {
      gl.uniform1f(
        time,
        reduceMotion ? 0 : ((now - start) / 1000) * 0.25 * SETTINGS.speed
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduceMotion) animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      if (ro) ro.disconnect();
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas id={id} className={className} style={style} ref={canvasRef} aria-hidden="true" />;
}
