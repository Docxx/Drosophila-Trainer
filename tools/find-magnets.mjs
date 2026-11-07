// Find magnet seats (flat circular discs) in an original STL.
// Usage: node tools/find-magnets.mjs <file.STL> [minR] [maxR]
import fs from 'fs';

const [file, minR = 1.8, maxR = 6] = process.argv.slice(2);
const b = fs.readFileSync(file);
const n = b.readUInt32LE(80);
const tri = new Float32Array(n * 9);
const nor = new Float32Array(n * 3);
for (let t = 0; t < n; t++) for (let k = 0; k < 9; k++) tri[t * 9 + k] = b.readFloatLE(84 + t * 50 + 12 + k * 4);

// Weld so triangles can find their neighbours.
const vid = new Int32Array(n * 3);
const map = new Map();
for (let i = 0; i < n * 3; i++) {
  const k = `${Math.round(tri[i * 3] * 1e3)},${Math.round(tri[i * 3 + 1] * 1e3)},${Math.round(tri[i * 3 + 2] * 1e3)}`;
  if (!map.has(k)) map.set(k, map.size);
  vid[i] = map.get(k);
}
const area = new Float32Array(n);
const cen = new Float32Array(n * 3);
for (let t = 0; t < n; t++) {
  const o = t * 9;
  const ux = tri[o + 3] - tri[o], uy = tri[o + 4] - tri[o + 1], uz = tri[o + 5] - tri[o + 2];
  const vx = tri[o + 6] - tri[o], vy = tri[o + 7] - tri[o + 1], vz = tri[o + 8] - tri[o + 2];
  const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
  const l = Math.hypot(cx, cy, cz) || 1;
  nor.set([cx / l, cy / l, cz / l], t * 3);
  area[t] = l / 2;
  cen.set([(tri[o] + tri[o + 3] + tri[o + 6]) / 3, (tri[o + 1] + tri[o + 4] + tri[o + 7]) / 3, (tri[o + 2] + tri[o + 5] + tri[o + 8]) / 3], t * 3);
}
const vt = new Map();
for (let t = 0; t < n; t++) for (let k = 0; k < 3; k++) {
  const v = vid[t * 3 + k];
  if (!vt.has(v)) vt.set(v, []);
  vt.get(v).push(t);
}
const lab = new Int8Array(n);
const out = [];
for (let s = 0; s < n; s++) {
  if (lab[s]) continue;
  const ns = [nor[s * 3], nor[s * 3 + 1], nor[s * 3 + 2]];
  const ds = ns[0] * cen[s * 3] + ns[1] * cen[s * 3 + 1] + ns[2] * cen[s * 3 + 2];
  const stack = [s];
  lab[s] = 1;
  const mem = [];
  while (stack.length) {
    const t = stack.pop();
    mem.push(t);
    for (let k = 0; k < 3; k++) for (const u of vt.get(vid[t * 3 + k])) {
      if (lab[u]) continue;
      const dot = ns[0] * nor[u * 3] + ns[1] * nor[u * 3 + 1] + ns[2] * nor[u * 3 + 2];
      const d = ns[0] * cen[u * 3] + ns[1] * cen[u * 3 + 1] + ns[2] * cen[u * 3 + 2];
      if (dot > 0.999 && Math.abs(d - ds) < 0.05) {
        lab[u] = 1;
        stack.push(u);
      }
    }
  }
  let A = 0;
  const C = [0, 0, 0];
  for (const t of mem) {
    A += area[t];
    for (let k = 0; k < 3; k++) C[k] += cen[t * 3 + k] * area[t];
  }
  if (A < Math.PI * minR * minR * 0.7) continue;
  C.forEach((_, k) => (C[k] /= A));
  let R = 0;
  for (const t of mem) for (let k = 0; k < 3; k++) {
    const o = (t * 3 + k) * 3;
    R = Math.max(R, Math.hypot(tri[o] - C[0], tri[o + 1] - C[1], tri[o + 2] - C[2]));
  }
  const circ = A / (Math.PI * R * R);
  if (R >= minR && R <= maxR && circ > 0.55) out.push({ r: +R.toFixed(2), circ: +circ.toFixed(2), c: C.map((v) => +v.toFixed(2)), n: ns.map((v) => +v.toFixed(3)) });
}
for (const o of out) console.log(`${o.circ > 0.85 ? 'O ' : '[]'} r${o.r} circ${o.circ} c(${o.c}) n(${o.n})`);
