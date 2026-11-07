// Dev check: brute-force every cross, generation by generation, to confirm that
// each puzzle's par is the true minimum. Run: npm run check
// (Each generation is enumerated in full, so this proves both "possible" and "not sooner".)

import { PUZZLES } from '../src/js/genetics/puzzles.js';
import { parseStock, parseTarget, crossMixes, phenoClasses, isPure } from '../src/js/genetics/crosses.js';
import { genotypeKey } from '../src/js/genetics/genetics.js';

const mixKey = (mix) =>
  mix
    .map((m) => `${genotypeKey(m.g)}@${m.p.toFixed(6)}`)
    .sort()
    .join('|');

let failed = false;
for (const pz of PUZZLES) {
  const t = parseTarget(pz.target);
  const F = new Map();
  const M = new Map();
  const add = (map, mix, gen) => {
    const k = mixKey(mix);
    if (!map.has(k)) map.set(k, { mix, gen });
  };
  for (const s of pz.stocks) {
    const st = parseStock(s.text);
    add(F, st.F, 0);
    add(M, st.M, 0);
  }
  let found = 0;
  const maxGen = pz.par;
  for (let gen = 1; gen <= maxGen && !found; gen++) {
    const fs = [...F.values()];
    const ms = [...M.values()];
    for (const f of fs) {
      for (const m of ms) {
        if (Math.max(f.gen, m.gen) !== gen - 1) continue;
        for (const row of phenoClasses(crossMixes(f.mix, m.mix).mix)) {
          for (const [s, map] of [['F', F], ['M', M]]) {
            if (!row[s]) continue;
            if (isPure(row[s].members, t)) found = gen;
            add(map, row[s].members, gen);
          }
        }
      }
    }
    console.log(`  ${pz.id} gen ${gen}: ${F.size} female vials, ${M.size} male vials`);
  }
  const ok = found === pz.par;
  if (!ok) failed = true;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${pz.id} par ${pz.par}: ${found ? `solved in ${found}` : `no solution in ${maxGen}`}`);
}
process.exit(failed ? 1 : 0);
