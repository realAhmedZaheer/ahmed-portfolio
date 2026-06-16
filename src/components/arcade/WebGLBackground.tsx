"use client";
import { useEffect, useRef } from "react";
import { getMusic } from "@/lib/defrag/music";
import type { BgProps, BgPulseKind } from "./bgShared";
import {
  fullscreenVert, nebulaFrag, motesVert, motesFrag, streamsVert, streamsFrag, auraFrag,
  bokehVert, bokehFrag,
} from "./webgl/shaders";

const LEVEL_STOPS: [number, number, number][] = [
  [34, 211, 238], [124, 58, 237], [168, 85, 247], [236, 72, 153],
];
function levelRGB(level: number): [number, number, number] {
  const f = Math.max(0, Math.min(3, (level - 1) / 3));
  const i = Math.min(2, Math.floor(f));
  const a = LEVEL_STOPS[i], b = LEVEL_STOPS[i + 1], t = f - i;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function pulseStrength(kind: BgPulseKind): number {
  if (kind === "fail") return 2.6; // SYSTEM FAILURE - the biggest blast
  if (kind === "overflow" || kind === "crit") return 1.6;
  if (kind === "clear") return 1.2;
  if (kind === "harddrop") return 0.9;
  return 0.85; // lock - a clear, visible push
}

/**
 * Dense WebGL reactive world (three.js, loaded at runtime): a nebula colour-field,
 * a drifting glint field, vertical data-flow streams, and a board aura, all reacting
 * to play events + the music kick, with HDR bloom. Mounted only when WebGL is
 * supported and motion is full; everything is disposed on unmount.
 */
export function WebGLBackground({ danger, level = 1, pulse = null }: BgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dangerRef = useRef(danger); dangerRef.current = danger;
  const levelRef = useRef(level); levelRef.current = level;
  const pulseRef = useRef(pulse); pulseRef.current = pulse;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    let raf = 0;
    let dispose = () => { };

    (async () => {
      let THREE: typeof import("three");
      let EffectComposer: any, RenderPass: any, UnrealBloomPass: any, OutputPass: any;
      try {
        THREE = await import("three");
        ({ EffectComposer } = await import("three/addons/postprocessing/EffectComposer.js"));
        ({ RenderPass } = await import("three/addons/postprocessing/RenderPass.js"));
        ({ UnrealBloomPass } = await import("three/addons/postprocessing/UnrealBloomPass.js"));
        ({ OutputPass } = await import("three/addons/postprocessing/OutputPass.js"));
      } catch {
        return; // import failed → leave blank; canvas fallback covers most cases
      }
      if (!alive) return;

      const parent = canvas.parentElement;
      const w = () => parent?.clientWidth || window.innerWidth;
      const h = () => parent?.clientHeight || window.innerHeight;
      const small = Math.min(window.innerWidth, window.innerHeight) < 768;
      const N = small ? 1200 : 3000;
      const M = small ? 150 : 300;
      const B = small ? 22 : 44; // bokeh - few but large, so they stay soft, not blown out

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
      renderer.setSize(w(), h(), false);
      renderer.setClearColor(0x05030d, 1);

      // stop the loop on context loss; preventDefault allows a browser restore (recovery = reload)
      const onContextLost = (e: Event) => {
        e.preventDefault();
        alive = false;
        cancelAnimationFrame(raf);
      };
      canvas.addEventListener("webglcontextlost", onContextLost, false);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // shared uniforms (referenced by value across materials)
      const c0 = levelRGB(level);
      const U = {
        uTime: { value: 0 },
        uDanger: { value: 0 },
        uColor: { value: new THREE.Vector3(c0[0], c0[1], c0[2]) },
        uAspect: { value: w() / h() },
        uKick: { value: 0 },
        uEnergy: { value: 0 },
        uPulseOrigin: { value: new THREE.Vector2(0, 0.05) },
        uPulseTime: { value: -10 },
        uPulseStrength: { value: 0 },
        uAura: { value: 0 },
        uPulse: { value: 0 },
      };

      const quad = () => new THREE.PlaneGeometry(2, 2);
      const add = (geo: any, mat: any, order: number) => {
        const m = new THREE.Mesh(geo, mat);
        m.frustumCulled = false; m.renderOrder = order; scene.add(m); return m;
      };

      const nebula = add(quad(), new THREE.ShaderMaterial({
        vertexShader: fullscreenVert, fragmentShader: nebulaFrag, depthTest: false, depthWrite: false,
        uniforms: { uTime: U.uTime, uDanger: U.uDanger, uColor: U.uColor, uAspect: U.uAspect },
      }), 0);

      // streams
      const sg = new THREE.BufferGeometry();
      const sp = new Float32Array(M * 3), ss = new Float32Array(M);
      for (let i = 0; i < M; i++) {
        sp[i * 3] = Math.random() * 2 - 1; sp[i * 3 + 1] = Math.random() * 2 - 1; sp[i * 3 + 2] = Math.random();
        ss[i] = Math.random();
      }
      sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
      sg.setAttribute("seed", new THREE.BufferAttribute(ss, 1));
      const streams = new THREE.Points(sg, new THREE.ShaderMaterial({
        vertexShader: streamsVert, fragmentShader: streamsFrag, transparent: true, depthTest: false, depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: U.uTime, uDanger: U.uDanger, uEnergy: U.uEnergy, uColor: U.uColor },
      }));
      streams.frustumCulled = false; streams.renderOrder = 1; scene.add(streams);

      // glints
      const mg = new THREE.BufferGeometry();
      const mp = new Float32Array(N * 3), msd = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        mp[i * 3] = Math.random() * 2 - 1; mp[i * 3 + 1] = Math.random() * 2 - 1; mp[i * 3 + 2] = Math.random();
        msd[i] = Math.random();
      }
      mg.setAttribute("position", new THREE.BufferAttribute(mp, 3));
      mg.setAttribute("seed", new THREE.BufferAttribute(msd, 1));
      const motes = new THREE.Points(mg, new THREE.ShaderMaterial({
        vertexShader: motesVert, fragmentShader: motesFrag, transparent: true, depthTest: false, depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: U.uTime, uKick: U.uKick, uEnergy: U.uEnergy, uColor: U.uColor, uDanger: U.uDanger,
          uPulseOrigin: U.uPulseOrigin, uPulseTime: U.uPulseTime, uPulseStrength: U.uPulseStrength,
        },
      }));
      motes.frustumCulled = false; motes.renderOrder = 2; scene.add(motes);

      // bokeh - big, soft, out-of-focus floating lights drifting up through the depth
      const bg = new THREE.BufferGeometry();
      const bp = new Float32Array(B * 3), bs = new Float32Array(B);
      for (let i = 0; i < B; i++) {
        bp[i * 3] = Math.random() * 2 - 1; bp[i * 3 + 1] = Math.random() * 2 - 1; bp[i * 3 + 2] = Math.random();
        bs[i] = Math.random();
      }
      bg.setAttribute("position", new THREE.BufferAttribute(bp, 3));
      bg.setAttribute("seed", new THREE.BufferAttribute(bs, 1));
      const bokeh = new THREE.Points(bg, new THREE.ShaderMaterial({
        vertexShader: bokehVert, fragmentShader: bokehFrag, transparent: true, depthTest: false, depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: U.uTime, uKick: U.uKick, uEnergy: U.uEnergy, uColor: U.uColor },
      }));
      bokeh.frustumCulled = false; bokeh.renderOrder = 1; scene.add(bokeh);

      const aura = add(quad(), new THREE.ShaderMaterial({
        vertexShader: fullscreenVert, fragmentShader: auraFrag, transparent: true, depthTest: false, depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: U.uColor, uAura: U.uAura, uPulse: U.uPulse },
      }), 3);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(w(), h()), 0.5, 0.4, 0.25));
      composer.addPass(new OutputPass());

      const ro = new ResizeObserver(() => {
        renderer.setSize(w(), h(), false);
        composer.setSize(w(), h());
        U.uAspect.value = w() / h();
      });
      if (parent) ro.observe(parent);

      const t0 = performance.now() / 1000;
      let lastAt = -1;
      let energy = 0;
      let auraPulse = 0;
      let prev = 0;

      const frame = () => {
        if (!alive) return;
        raf = requestAnimationFrame(frame);
        if (typeof document !== "undefined" && document.hidden) return;
        if (renderer.getContext().isContextLost()) return;
        const tsec = performance.now() / 1000 - t0;
        const dt = Math.min(0.05, tsec - prev); prev = tsec;

        U.uTime.value = tsec;
        U.uDanger.value = dangerRef.current;
        const lc = levelRGB(levelRef.current);
        U.uColor.value.set(lc[0], lc[1], lc[2]);

        const mb = getMusic().beat();
        U.uKick.value = mb ? mb.kick : 0;

        const p = pulseRef.current;
        if (p && p.at !== lastAt) {
          lastAt = p.at;
          U.uPulseTime.value = tsec;
          U.uPulseStrength.value = pulseStrength(p.kind);
          // push originates from the placement column (general direction), board height
          U.uPulseOrigin.value.set(p.x != null ? p.x * 2 - 1 : 0, 0.0);
          if (p.kind === "clear") energy = Math.min(1, energy + 0.3);
          else if (p.kind === "overflow" || p.kind === "crit") energy = Math.min(1, energy + 0.55);
          else if (p.kind === "fail") energy = 1;
          // only clears/overflow/fail flash the aura - a plain lock is a particle PUSH, not a flash
          if (p.kind === "clear") auraPulse = 0.5;
          else if (p.kind === "overflow" || p.kind === "crit") auraPulse = 1;
          else if (p.kind === "fail") auraPulse = 1.6; // the explosion
        }
        energy = Math.max(0, energy - dt * 0.4);
        auraPulse = Math.max(0, auraPulse - dt * 2.2);
        U.uEnergy.value = energy;
        U.uPulse.value = auraPulse;
        U.uAura.value = 0.12 + energy * 0.5;

        composer.render();
      };
      frame();

      dispose = () => {
        cancelAnimationFrame(raf);
        canvas.removeEventListener("webglcontextlost", onContextLost);
        ro.disconnect();
        [nebula, aura].forEach((m) => { (m.geometry as any).dispose(); (m.material as any).dispose(); });
        [streams, motes, bokeh].forEach((pt) => { (pt.geometry as any).dispose(); (pt.material as any).dispose(); });
        composer.dispose?.();
        renderer.dispose();
      };
    })();

    return () => { alive = false; cancelAnimationFrame(raf); dispose(); };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
