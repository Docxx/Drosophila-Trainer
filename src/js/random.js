// Seeded random numbers and sampling, shared by lessons, the bench and the research models.

/** Small seeded random generator (mulberry32), so samples are reproducible. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Count `n` flies drawn from progeny classes: [{ label, p, n }]. */
export function sampleCounts(rows, n, random = Math.random) {
  const out = rows.map((r) => ({ label: r.label, p: r.p, n: 0 }));
  for (let i = 0; i < n; i++) {
    let x = random();
    let k = out.findIndex((r) => (x -= r.p) < 0);
    if (k < 0) k = out.length - 1;
    out[k].n++;
  }
  return out;
}
