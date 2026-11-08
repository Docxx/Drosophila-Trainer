// Cross planner state, free of any DOM so it can be tested in node.
// Vials hold mixes of genotypes (one for females, one for males). The learner
// only ever sees phenotypes: classes are sorted by what is visible, and a vial
// is checked against the target only when the learner declares it finished.

import { CHROMS } from './genetics/genetics.js';
import { parseStock, parseTarget, crossMixes, phenoClasses, traits, isPure, containsTarget } from './genetics/crosses.js';

export function classLabel(ph) {
  const t = traits(ph);
  const markers = t.slice(1);
  return `${markers.length ? markers.join(', ') : 'No dominant markers'} · ${t[0]}`;
}

export class PlannerSession {
  constructor(puzzle) {
    this.puzzle = puzzle;
    this.target = parseTarget(puzzle.target);
    this.vials = puzzle.stocks.map((s, i) => ({
      id: `s${i}`,
      name: s.name,
      note: s.note,
      text: s.text,
      generation: 0,
      stock: true,
      ...parseStock(s.text),
    }));
    this.crosses = [];
    this.hintsUsed = 0;
    this.solved = null;
    this.log = [];
    this.next = 1;
    this.actions = [];
  }

  vial(id) {
    return this.vials.find((v) => v.id === id);
  }

  /** Cross virgin females from one vial to males from another. */
  cross(femaleVial, maleVial) {
    const f = this.vial(femaleVial),
      m = this.vial(maleVial);
    if (!f?.F) throw new Error('That vial has no females.');
    if (!m?.M) throw new Error('That vial has no males.');
    const { mix, dead } = crossMixes(f.F, m.M);
    const cross = {
      id: `c${this.next++}`,
      mother: f.id,
      father: m.id,
      generation: Math.max(f.generation, m.generation) + 1,
      dead,
      classes: phenoClasses(mix).map((row) => ({ ...row, label: classLabel(row.pheno), sexes: ['F', 'M'].filter((s) => row[s]) })),
    };
    this.crosses.push(cross);
    this.actions.push({ method: 'cross', args: [femaleVial, maleVial] });
    this.log.push(`Generation ${cross.generation}: ${f.name} ♀ × ${m.name} ♂ → ${cross.classes.length} classes.`);
    return cross;
  }

  /** Keep one class from a cross as a new vial (both sexes of that class). */
  keep(crossId, rowIndex, name) {
    const cross = this.crosses.find((c) => c.id === crossId);
    const row = cross.classes[rowIndex];
    const f = this.vial(cross.mother),
      m = this.vial(cross.father);
    const vial = {
      id: `v${this.next++}`,
      name: name || row.label.split(' · ')[0],
      note: `Generation ${cross.generation}, from ${f.name} ♀ × ${m.name} ♂. ${row.label}.`,
      generation: cross.generation,
      stock: false,
      F: row.F?.members || null,
      M: row.M?.members || null,
      from: crossId,
      pheno: row.pheno,
    };
    this.vials.push(vial);
    this.actions.push({ method: 'keep', args: [crossId, rowIndex, name || null] });
    this.log.push(`Kept ${row.label} as “${vial.name}”.`);
    return vial;
  }

  discard(vialId) {
    const v = this.vial(vialId);
    if (!v || v.stock) return;
    this.vials = this.vials.filter((x) => x !== v);
    this.actions.push({ method: 'discard', args: [vialId] });
  }

  hint() {
    const h = this.puzzle.hints[this.hintsUsed];
    if (h) {
      this.hintsUsed++;
      this.actions.push({ method: 'hint', args: [] });
    }
    return h || null;
  }

  /**
   * The learner declares a vial to be the finished stock. Success needs one sex
   * of the vial made only of target flies. Feedback names the uncertain
   * chromosome without revealing genotypes.
   */
  declare(vialId) {
    const v = this.vial(vialId);
    this.actions.push({ method: 'declare', args: [vialId] });
    const t = this.target;
    const pure = ['F', 'M'].some((s) => v[s] && isPure(v[s], t));
    if (pure) {
      this.solved = { vial: v.id, generations: v.generation, par: this.puzzle.par, hints: this.hintsUsed };
      this.log.push(
        `Declared “${v.name}”: target stock built in ${v.generation} generation${v.generation === 1 ? '' : 's'} (par ${this.puzzle.par}).`,
      );
      return { ok: true, ...this.solved };
    }
    const members = [...(v.F || []), ...(v.M || [])];
    const wrongChroms = [];
    if (members.some((m) => !m.g.X.filter((k) => k !== 'Y').every((k) => k === t.X))) wrongChroms.push('X');
    for (const c of ['2', '3']) if (members.some((m) => [...m.g[c]].sort().join('/') !== t[c].join('/'))) wrongChroms.push(c);
    const some = containsTarget(members, t);
    this.log.push(`Declared “${v.name}”: not the target.`);
    return {
      ok: false,
      some,
      chroms: wrongChroms,
      message: v.stock
        ? 'That is one of the starting stocks. You need to build the target with crosses.'
        : some
          ? `Some flies in this vial are the target, but not all: you cannot tell them apart by looking. Check chromosome ${wrongChroms.join(' and ')}: which markers would prove what each fly carries?`
          : `None of these flies is the target. Chromosome ${wrongChroms.join(' and ')} ${wrongChroms.length === 1 ? 'is' : 'are'} not what the target needs.`,
    };
  }
}

/** Target described homolog by homolog, for the planner header. */
export function targetChroms(t) {
  return { X: [t.X, t.X], 2: t.shown[0], 3: t.shown[1] };
}
export const label = (chrom, key) => CHROMS[chrom][key].label;

/** Restore decisions, not hidden genotypes or an untrusted success flag. */
export function replayPlan(puzzle, saved) {
  if (!saved || saved.puzzle !== puzzle.id || !Array.isArray(saved.actions) || saved.actions.length > 2000)
    throw new Error('Unsupported saved construction');
  const session = new PlannerSession(puzzle);
  for (const action of saved.actions) {
    if (!action || !['cross', 'keep', 'discard', 'hint', 'declare'].includes(action.method) || !Array.isArray(action.args))
      throw new Error('Invalid saved construction action');
    session[action.method](...action.args);
  }
  return session;
}
