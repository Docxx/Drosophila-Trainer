// Worked demonstrations use the same pure models as learner activities.
import { classesFor, gametesFor, punnett, chiSquare } from './lessons.js';
import { threePointData, cloneCohort, SHOCK_LENGTHS, STAGES, simulateTarget, targetChecks, screenStats, DOSES } from './research.js';
export function teachingModel(step) {
  if (step.kind === 'concept') return { schematic: true };
  if (step.kind === 'cross')
    return {
      ...classesFor(step.mother, step.father, step),
      eggs: gametesFor(step.mother, step.chroms),
      sperm: gametesFor(step.father, step.chroms),
      square: step.recombine ? null : punnett(step.mother, step.father, step),
    };
  if (step.kind === 'statistics') return { test: chiSquare(step.observed, step.shares), n: step.observed.reduce((a, b) => a + b, 0) };
  if (step.kind === 'mapping') return threePointData(step);
  if (step.kind === 'clones') return cloneCohort({ ...step, p: SHOCK_LENGTHS.find((l) => l.minutes === step.minutes).p });
  if (step.kind === 'target') {
    const temps = Object.fromEntries(STAGES.map((s) => [s.id, s.id === 'adult' ? 29 : 18]));
    const sim = simulateTarget(temps),
      goal = {
        checks: [
          {
            stages: STAGES.filter((s) => s.id !== 'adult').map((s) => s.id),
            measure: 'protein',
            min: 0.9,
            text: 'Protein ≥90% throughout development',
          },
          { stages: ['adult'], measure: 'protein', max: 0.2, last: 48, text: 'Protein ≤20% throughout the final 48 adult hours' },
        ],
      };
    return { temps, sim, goal, checks: targetChecks(sim, goal) };
  }
  if (step.kind === 'screen')
    return {
      selected: screenStats(step.dose, step.lines),
      presets: DOSES.map((d) => ({ ...d, ...screenStats(d.mM, step.lines) })),
      goal: { minHit: 0.9, maxMulti: 0.35, maxLines: 5000 },
    };
  throw new Error(`Unknown teaching model: ${step.kind}`);
}
