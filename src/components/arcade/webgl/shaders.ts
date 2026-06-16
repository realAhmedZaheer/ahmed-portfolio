// GLSL for the WebGL reactive background. Written for three.js ShaderMaterial
// (GLSL1): `position`/`uv` and the standard precision are injected by three, so
// they are NOT redeclared here. gl_Position is written directly from a [-1,1]
// clip-space layout (no camera matrices). Kept as plain strings so they carry no
// three import and are easy to tune.

/** Fullscreen quad: pass uv, position already spans [-1,1] (PlaneGeometry(2,2)). */
export const fullscreenVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** Nebula: domain-warped, multi-hue cosmic clouds with two parallax depth layers.
   Colour is woven from a cool teal, the level colour, and a warm rose by noise
   fields, so the field is never monochrome. Richness is weighted to the periphery
   and the column directly behind the board is kept calm so blocks stay readable -
   the same framing Tetris Effect uses to keep the matrix legible over a busy world. */
export const nebulaFrag = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uDanger;
uniform vec3 uColor;
uniform float uAspect;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }
void main(){
  vec2 uv = vUv; uv.x *= uAspect;
  vec2 t = vec2(uTime * 0.015, uTime * 0.009);

  // domain warp - fold the coordinate space through noise for swirling structure
  vec2 q = vec2(fbm(uv * 1.4 + t), fbm(uv * 1.4 + vec2(5.2, 1.3)));
  float n  = fbm(uv * 2.4 + 1.7 * q - t);            // detailed foreground clouds
  float n2 = fbm(uv * 0.8 + 0.6 * q - t * 0.4);      // slow, large background layer

  // weave the palette: cool teal ↔ level colour ↔ warm rose, driven by noise
  vec3 base = uColor / 255.0;
  vec3 cool = vec3(0.10, 0.52, 0.60);
  vec3 warm = vec3(0.62, 0.14, 0.42);
  vec3 col = mix(cool, base, smoothstep(0.25, 0.85, q.x));
  col = mix(col, warm, smoothstep(0.30, 0.90, n2));
  col = mix(col, vec3(0.92, 0.11, 0.34), uDanger * 0.6);

  float clouds = pow(n, 2.0);
  float deep   = pow(n2, 1.6) * 0.5;
  float edge   = smoothstep(0.10, 0.85, length(vUv - 0.5) * 1.25); // brighter toward the rim
  float calm   = 0.55 + 0.45 * smoothstep(0.0, 0.22, abs(vUv.x - 0.5)); // dim behind the board
  float amp    = (clouds * 0.55 + deep * 0.42) * (0.4 + 0.6 * edge) * calm;

  gl_FragColor = vec4(col * amp + base * 0.012, 1.0);
}
`;

/** Bokeh: large, soft, out-of-focus floating lights - the signature Tetris Effect
   foreground element. Few in number but big and faint, drifting slowly upward in a
   palette of teal/rose/level colour. Additive, so they read as glowing depth-of-field. */
export const bokehVert = /* glsl */ `
attribute float seed;
uniform float uTime;
uniform float uKick;
uniform float uEnergy;
varying float vSeed;
varying float vDepth;
void main(){
  float depth = position.z;                 // 0..1 - closer ones are bigger and blurrier
  vec2 p = position.xy;
  p.y = mod(p.y + uTime * (0.006 + depth * 0.02) + 1.0, 2.0) - 1.0; // slow float up
  p.x += sin(uTime * 0.1 + seed * 6.2831) * 0.03 * depth;           // gentle sway
  vSeed = seed; vDepth = depth;
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = (12.0 + depth * 64.0) * (1.0 + uKick * 0.3 + uEnergy * 0.4);
}
`;

export const bokehFrag = /* glsl */ `
uniform vec3 uColor;
varying float vSeed;
varying float vDepth;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float soft = smoothstep(0.5, 0.0, length(c));
  soft *= soft;                              // very soft falloff - out of focus
  vec3 cool = vec3(0.20, 0.75, 0.85);
  vec3 warm = vec3(0.96, 0.36, 0.60);
  vec3 base = uColor / 255.0;
  vec3 col = mix(cool, warm, fract(vSeed * 7.0));
  col = mix(col, base, 0.4);
  float a = soft * (0.018 + vDepth * 0.05);  // big and faint
  gl_FragColor = vec4(col, a);
}
`;

/** Reactive glints: a dense drifting field, sized by kick/energy, ripped by pulses. */
export const motesVert = /* glsl */ `
attribute float seed;
uniform float uTime;
uniform float uKick;
uniform float uEnergy;
uniform vec2 uPulseOrigin;
uniform float uPulseTime;
uniform float uPulseStrength;
varying float vDepth;
varying float vTwinkle;
varying float vSeed;
void main(){
  float depth = position.z;
  vec2 p = position.xy;
  // slow downward drift, wrapped in [-1,1]
  p.y = mod(p.y - uTime * (0.01 + depth * 0.04) + 1.0, 2.0) - 1.0;
  // a play event shoves particles outward from the placement column - a push,
  // not a flash: a wide expanding band displaces nearby motes away from origin
  float dt = uTime - uPulseTime;
  if (dt > 0.0 && dt < 1.5) {
    vec2 dir = p - uPulseOrigin;
    float dist = length(dir);
    float band = exp(-pow((dist - dt * 1.5) * 2.6, 2.0));   // wider band → more motes caught
    float fade = 1.0 - dt / 1.5;                            // ease out over its life
    p += normalize(dir + 0.0001) * band * fade * uPulseStrength * 0.16;
  }
  vDepth = depth;
  vTwinkle = sin(uTime * 2.0 + seed * 6.2831);
  vSeed = seed;
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = (0.6 + depth * 2.0) * (1.0 + uKick * 1.1 + uEnergy * 0.8);
}
`;

export const motesFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uDanger;
varying float vDepth;
varying float vTwinkle;
varying float vSeed;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float glow = smoothstep(0.5, 0.0, length(c));
  // tint a third of the field cool, a third warm, the rest the level colour, so
  // the starfield shimmers in several hues rather than one
  vec3 cool = vec3(0.40, 0.85, 0.95);
  vec3 warm = vec3(0.98, 0.55, 0.70);
  vec3 col = uColor / 255.0;
  float h = fract(vSeed * 5.0);
  col = mix(col, cool, smoothstep(0.66, 0.95, h));
  col = mix(col, warm, smoothstep(0.33, 0.05, h));
  col = mix(col, vec3(0.92, 0.22, 0.27), uDanger * 0.6 * (1.0 - vDepth)); // far dim motes redshift first
  float a = glow * (0.04 + 0.16 * vDepth) * (0.45 + 0.55 * vTwinkle);
  gl_FragColor = vec4(col, a);
}
`;

/** Data-flow streams: vertical lanes of particles; reverse + redden under danger. */
export const streamsVert = /* glsl */ `
attribute float seed;
uniform float uTime;
uniform float uDanger;
uniform float uEnergy;
varying float vA;
void main(){
  float speed = (0.14 + position.z * 0.22) * (1.0 + uEnergy);
  float dir = mix(1.0, -1.0, step(0.62, uDanger)); // pressure backs up → reverse upward
  float y = mod(position.y - dir * uTime * speed + 1.0, 2.0) - 1.0;
  gl_Position = vec4(position.x, y, 0.0, 1.0);
  gl_PointSize = 1.5 + uEnergy * 1.8;
  vA = 0.06 + uEnergy * 0.3;
}
`;

export const streamsFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uDanger;
varying float vA;
void main(){
  vec3 col = mix(uColor / 255.0, vec3(0.92, 0.2, 0.32), uDanger * 0.7);
  gl_FragColor = vec4(col, vA);
}
`;

/** Board aura: a soft radial glow from the matrix plus a vertical light shaft
   descending onto it (Tetris Effect's signature beam). Both pulse on clears/overflow. */
export const auraFrag = /* glsl */ `
varying vec2 vUv;
uniform vec3 uColor;
uniform float uAura;
uniform float uPulse;
void main(){
  vec2 center = vec2(0.5, 0.55);
  float d = length((vUv - center) * vec2(1.6, 1.0));
  float glow = smoothstep(0.72 + uPulse * 0.5, 0.0, d) * (0.03 + uAura * 0.12 + uPulse * 0.4);

  // volumetric shaft: a soft column over the board, brightest up top, fading down,
  // narrowing toward the matrix - light pouring onto the playfield
  float width = 0.06 + 0.05 * vUv.y;                       // flares out toward the top
  float beam = smoothstep(width, 0.0, abs(vUv.x - 0.5));
  beam *= smoothstep(0.1, 0.95, vUv.y);                    // top-weighted
  glow += beam * (0.05 + uAura * 0.08 + uPulse * 0.5);

  gl_FragColor = vec4(uColor / 255.0 * glow, 1.0);
}
`;
