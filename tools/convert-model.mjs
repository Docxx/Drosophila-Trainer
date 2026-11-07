// Convert the Hidalgo-lab fly STLs into compact, simplified meshes for the app.
// Usage: node tools/convert-model.mjs <folder with MJF *.STL>
// Output: assets/fly/<part>.bin  =  [u32 vertexCount, u32 indexCount, f32 xyz..., u32 idx...]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MeshoptSimplifier } from 'meshoptimizer';

const PARTS = {
  'MJF HALF LEFT BODY.STL': ['body_l', 0.2],
  'MJF HALF RIGHT BODY.STL': ['body_r', 0.2],
  'MJF HALF NOTUN LEFT AND RIGHT.STL': ['notum', 0.3],
  'MJF PLEURA.STL': ['pleura', 0.4],
  'MJF FLY_HAIRS.STL': ['hairs', 0.35],
  'MJF LEFT EYE.STL': ['eye_l', 1],
  'MJF RIGHT EYE.STL': ['eye_r', 1],
  'MJF LEFT MUTATION EYE.STL': ['eye_mut_l', 1],
  'MJF RIGHT MUTATION EYE.STL': ['eye_mut_r', 1],
  'MJF LEFT_WING.STL': ['wing_l', 0.3],
  'MJF RIGHT_WING.STL': ['wing_r', 0.3],
  'MJF LEFT MUTATION WING.STL': ['wing_mut_l', 0.3],
  'MJF RIGHT MUTATION WING.STL': ['wing_mut_r', 0.3],
  'MJF LEFT ANTENNA.STL': ['antenna_l', 0.6],
  'MJF RIGHT ANTENNA.STL': ['antenna_r', 0.6],
  'MJF LEFT FORELEG.STL': ['leg1_l', 0.5],
  'MJF RIGHT FORELEG.STL': ['leg1_r', 0.5],
  'MJF SECOND LEFT LEG.STL': ['leg2_l', 0.5],
  'MJF SECOND RIGHT LEG.STL': ['leg2_r', 0.5],
  'MJF THIRD LEFT LEG.STL': ['leg3_l', 0.5],
  'MJF THIRD RIGHT LEG.STL': ['leg3_r', 0.5],
};

function readStl(file) {
  const b = fs.readFileSync(file);
  const n = b.readUInt32LE(80);
  // STL is a triangle soup: weld identical corners into shared vertices.
  const map = new Map();
  const pos = [];
  const idx = new Uint32Array(n * 3);
  for (let t = 0; t < n; t++) {
    for (let v = 0; v < 3; v++) {
      const o = 84 + t * 50 + 12 + v * 12;
      const x = b.readFloatLE(o), y = b.readFloatLE(o + 4), z = b.readFloatLE(o + 8);
      const key = `${Math.round(x * 1e4)},${Math.round(y * 1e4)},${Math.round(z * 1e4)}`;
      let i = map.get(key);
      if (i === undefined) {
        i = pos.length / 3;
        map.set(key, i);
        pos.push(x, y, z);
      }
      idx[t * 3 + v] = i;
    }
  }
  return { pos: new Float32Array(pos), idx };
}

function compact(pos, idx) {
  const remap = new Int32Array(pos.length / 3).fill(-1);
  const out = [];
  const nidx = new Uint32Array(idx.length);
  for (let i = 0; i < idx.length; i++) {
    let r = remap[idx[i]];
    if (r < 0) {
      r = remap[idx[i]] = out.length / 3;
      out.push(pos[idx[i] * 3], pos[idx[i] * 3 + 1], pos[idx[i] * 3 + 2]);
    }
    nidx[i] = r;
  }
  return { pos: new Float32Array(out), idx: nidx };
}

const src = process.argv[2];
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'fly');
fs.mkdirSync(outDir, { recursive: true });
await MeshoptSimplifier.ready;

for (const [file, [id, ratio]] of Object.entries(PARTS)) {
  const { pos, idx } = readStl(path.join(src, file));
  let simp = idx;
  if (ratio < 1) {
    const target = Math.floor((idx.length * ratio) / 3) * 3;
    [simp] = MeshoptSimplifier.simplify(idx, pos, 3, target, 0.01, ['LockBorder']);
  }
  const m = compact(pos, simp);
  const header = new Uint32Array([m.pos.length / 3, m.idx.length]);
  fs.writeFileSync(
    path.join(outDir, `${id}.bin`),
    Buffer.concat([Buffer.from(header.buffer), Buffer.from(m.pos.buffer), Buffer.from(m.idx.buffer)]),
  );
  console.log(id.padEnd(12), `${idx.length / 3} -> ${m.idx.length / 3} tris`);
}
