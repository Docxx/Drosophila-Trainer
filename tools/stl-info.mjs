// Print triangle count and bounding box for each binary STL in a folder.
import fs from 'fs';
import path from 'path';
const dir = process.argv[2];
for (const f of fs.readdirSync(dir).filter((f) => /^MJF.*\.STL$/i.test(f))) {
  const b = fs.readFileSync(path.join(dir, f));
  const n = b.readUInt32LE(80);
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) {
    const o = 84 + i * 50 + 12;
    for (let v = 0; v < 3; v++) for (let k = 0; k < 3; k++) {
      const x = b.readFloatLE(o + v * 12 + k * 4);
      if (x < lo[k]) lo[k] = x;
      if (x > hi[k]) hi[k] = x;
    }
  }
  const r = (a) => a.map((x) => x.toFixed(1)).join(', ');
  console.log(f.padEnd(36), String(n).padStart(7), ' min[', r(lo), '] max[', r(hi), ']');
}
