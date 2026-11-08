// Plays one interactive lesson from lessons.js inside a container element.
// Each step must be worked through (answered, built or predicted) before Next
// unlocks; Back is always available, and every lesson can be left at any time.

import { parseGenotype, CHROMS } from './genetics/genetics.js';
import { genotypeHTML, gameteHTML, esc } from './chromosomes.js';
import {
  LESSON_CONTENT,
  classesFor,
  gametesFor,
  gameteKey,
  canCrossOver,
  crossoverBlock,
  crossoverKey,
  punnett,
  FRACTIONS,
  fractionLabel,
  classMatches,
  recommendStart,
  sampleCounts,
  rng,
  chiSquare,
  complementationCross,
  deficiencyMap,
} from './lessons.js';
import { progress, LESSONS } from './course.js';
import { lessonDraft, restoreDraft } from './lessonDraft.js';
import { STAGES as TEACHING_STAGES } from './curriculum.js';
import { teachingModel } from './teachingModels.js';
import { mountPlanner } from './planner.js';
import { replayPlan } from './plannerSession.js';
import { PUZZLES } from './genetics/puzzles.js';
import { visualGuideHTML, wireVisualGuide, actionGuideHTML, wireActionGuide, guideScene, VISUAL_GUIDES } from './lessonVisuals.js';
import {
  TP_GENES,
  threePointData,
  threePointPractice,
  cloneCohort,
  SHOCK_TIMES,
  SHOCK_LENGTHS,
  STAGES,
  simulateTarget,
  targetChecks,
  targetWindow,
  DOSES,
  PER_GENE,
  screenStats,
  screenChecks,
} from './research.js';

const near = (a, b) => Math.abs(a - b) < 1e-6;
const STATUS = {
  worked: 'follow all four demonstration stages',
  mission: 'build the target stock',
  choice: 'choose an answer',
  pick: 'pick a class',
  gametes: 'find every gamete',
  predict: 'check your prediction',
  multi: 'select and check',
  count: 'work it out from the counts',
  chance: 'count more vials',
  chisq: 'judge each hypothesis',
  grid: 'run every cross',
  threepoint: 'infer the order and calculate the map',
  clones: 'meet the clone goal',
  target: 'test a temperature schedule',
  screen: 'meet all screen constraints',
};
const paras = (body = []) => body.map((p) => `<p>${esc(p)}</p>`).join('');

export function mountLesson(root, id, { onExit, onAction }) {
  const lesson = LESSON_CONTENT[id];
  const saved = !lesson.diagnostic && restoreDraft(lesson, progress.get().drafts[id]);
  let index = saved ? saved.index : 0;
  let state = saved ? saved.state : lesson.steps.map(() => ({ done: false }));
  let diagnosticAnswers = [];
  let stopVisual = () => {};
  const save = () => {
    if (!lesson.diagnostic) progress.saveDraft(id, lessonDraft(lesson, index, state));
  };
  const complete = () =>
    progress.complete(id, {
      assisted: state.some((s) => s.assisted),
      independentPractice: state.some((s) => s.practice && s.done && !s.assisted),
    });

  const scrollToTop = () => {
    const desk = root.closest('.desk');
    if (desk) desk.scrollTop = 0;
  };
  const mode = () => progress.notation;
  const fly = (text, opts = {}) => genotypeHTML(parseGenotype(text), { mode: mode(), ...opts });

  function crossHTML(step) {
    const chroms = step.chroms || ['X', '2', '3'];
    return `<div class="cross-line">${fly(step.mother, { chroms, caption: 'Mother ♀' })}<span class="times" aria-hidden="true">×</span>${fly(step.father, { chroms, caption: 'Father ♂' })}</div>`;
  }

  // Research loci and transgenes are not part of the stock-building catalogue.
  // Show them explicitly without inventing chromosome insertions in that engine.
  function researchDiagram(rows, notation, caption) {
    return `<figure class="genotype research-diagram"><figcaption>${esc(caption)}</figcaption>
      ${mode() !== 'notation' ? `<div class="research-chroms">${rows.map((row) => `<div class="research-hom">${row.map((locus) => `<span>${esc(locus)}</span>`).join('')}</div>`).join('')}</div>` : ''}
      ${mode() !== 'diagram' ? `<code class="notation">${esc(notation)}</code>` : ''}</figure>`;
  }
  const checksHTML = (checks) =>
    `<ul class="goal-checks" aria-label="Goal checks">${checks.map((c) => `<li class="${c.ok ? 'met' : 'unmet'}">${c.ok ? '✓' : '○'} ${esc(c.text)}</li>`).join('')}</ul>`;
  const numberOK = (value, answer, tolerance) =>
    value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value)) && Math.abs(Number(value) - answer) <= tolerance;
  function targetPlot(sim, goal) {
    const width = 760,
      height = 266,
      left = 42,
      top = 18,
      innerW = 700,
      innerH = 174;
    const end = sim.points.at(-1).t;
    const x = (t) => left + (innerW * t) / end,
      y = (v) => top + innerH * (1 - v);
    const line = (measure) =>
      sim.points
        .filter((_, i) => i % 3 === 0 || i === sim.points.length - 1)
        .map((pt) => `${x(pt.t).toFixed(1)},${y(pt[measure]).toFixed(1)}`)
        .join(' ');
    return `<svg class="target-plot" viewBox="0 0 ${width} ${height}" role="img" aria-label="GAL4 activity and RNAi target protein over elapsed time; stage and temperature shown below">
      ${sim.bounds.map((b) => `<rect x="${x(b.start)}" y="${top}" width="${x(b.end) - x(b.start)}" height="${innerH}" fill="${b.temp === 29 ? '#493421' : '#20384b'}"/><text x="${x((b.start + b.end) / 2)}" y="212" text-anchor="middle">${esc(b.label)}</text><text x="${x((b.start + b.end) / 2)}" y="228" text-anchor="middle">${b.temp}°C</text>`).join('')}
      ${goal.checks
        .map((check, i) => {
          const pts = targetWindow(sim, check),
            colour = ['#c7b5ed', '#b5dfba', '#ffd09a'][i % 3];
          return sim.bounds
            .filter((b) => check.stages.includes(b.id))
            .map((b) => {
              const start = Math.max(b.start, (pts[0]?.t ?? 1) - 1),
                end = Math.min(b.end, pts.at(-1)?.t ?? 0);
              return end <= start
                ? ''
                : `<rect class="checked-window" x="${x(start)}" y="${top}" width="${x(end) - x(start)}" height="${innerH}" fill="${colour}" fill-opacity=".09"><title>${esc(check.text)}</title></rect>${[
                    check.min,
                    check.max,
                  ]
                    .filter((v) => v !== undefined)
                    .map(
                      (v) =>
                        `<line class="target-threshold" x1="${x(start)}" x2="${x(end)}" y1="${y(v)}" y2="${y(v)}" stroke="${colour}" stroke-width="2" stroke-dasharray="2 3"/><text x="${x(start) + 3}" y="${y(v) - 4}" fill="${colour}">${Math.round(v * 100)}%</text>`,
                    )
                    .join('')}`;
            })
            .join('');
        })
        .join('')}
      ${Array.from({ length: 5 }, (_, i) => (end * i) / 4)
        .map((t) => `<text x="${x(t)}" y="252" text-anchor="middle">${(t / 24).toFixed(1)} d</text>`)
        .join('')}
      ${[0, 0.5, 1].map((v) => `<line x1="${left}" x2="${left + innerW}" y1="${y(v)}" y2="${y(v)}" stroke="#64717c" stroke-dasharray="3 4"/><text x="35" y="${y(v) + 4}" text-anchor="end">${v * 100}%</text>`).join('')}
      <polyline points="${line('gal4')}" fill="none" stroke="#e8b064" stroke-width="2" stroke-dasharray="5 3"/>
      <polyline points="${line('protein')}" fill="none" stroke="#8bc7e6" stroke-width="3"/>
    </svg><p class="plot-key"><span>Shading and dotted thresholds: assessed windows</span><span>Dashed amber: GAL4 activity</span><span>Solid blue: target protein</span><span>Elapsed time: ${(end / 24).toFixed(1)} days; eclosion at ${(sim.eclosion / 24).toFixed(1)} days</span></p>`;
  }

  function screenPlot(dose, lines, goal) {
    const cap = goal.maxLines,
      x = (n) => 45 + (650 * n) / cap,
      y = (p) => 175 - 150 * p;
    return `<svg class="screen-plot target-plot" viewBox="0 0 760 220" role="img" aria-label="Coverage versus independent lines for each mutagenesis preset">
      ${[0, 0.5, 1].map((p) => `<line x1="45" x2="695" y1="${y(p)}" y2="${y(p)}" stroke="#64717c"/><text x="38" y="${y(p) + 4}" text-anchor="end">${p * 100}%</text>`).join('')}
      <line class="coverage-threshold" x1="45" x2="695" y1="${y(goal.minHit)}" y2="${y(goal.minHit)}" stroke="#c7b5ed" stroke-dasharray="4 3"/>
      ${DOSES.map(
        (d, i) =>
          `<polyline points="${Array.from({ length: 61 }, (_, k) => {
            const n = (cap * k) / 60;
            return `${x(n)},${y(screenStats(d.mM, n).hitGene)}`;
          }).join(' ')}" fill="none" stroke="${['#8bca9b', '#8bc7e6', '#e8b064'][i]}" stroke-width="${d.mM === dose ? 4 : 2}"/>`,
      ).join('')}
      ${[0, cap / 2, cap].map((n) => `<text x="${x(n)}" y="194" text-anchor="middle">${Math.round(n).toLocaleString('en-GB')}</text>`).join('')}
      <text x="370" y="214" text-anchor="middle">Independent chromosome lines (up to room capacity)</text>
      ${lines <= cap ? `<circle cx="${x(lines)}" cy="${y(screenStats(dose, lines).hitGene)}" r="5" fill="white"><title>Your plan</title></circle>` : ''}
      </svg><p class="plot-key">Green: low · Blue: standard · Amber: high. Thick line: your preset. Dotted line: required coverage.</p>
      <table class="counts screen-comparison"><caption>Same ${lines.toLocaleString('en-GB')} lines: compare mutation burden and workload</caption><thead><tr><th>Preset</th><th>Coverage</th><th>Multiple hits among lethal lines</th><th>Expected lethal lines</th><th>Maintenance vials</th></tr></thead><tbody>${DOSES.map(
        (d) => {
          const st = screenStats(d.mM, lines);
          return `<tr><th>${esc(d.label)}</th><td>${(st.hitGene * 100).toFixed(1)}%</td><td>${(st.multiShare * 100).toFixed(1)}%</td><td>${st.lethalLines.toFixed(0)}</td><td>${st.vials.toLocaleString('en-GB')}</td></tr>`;
        },
      ).join('')}</tbody></table>`;
  }

  // ---- step renderers: each returns HTML and an optional wire(el) ------------------

  const RENDER = {
    text(step) {
      const figs = (step.diagrams || []).map((d) => fly(d.g, { chroms: d.chroms, caption: d.caption, mode: d.mode || mode() })).join('');
      return { html: `${paras(step.body)}${figs ? `<div class="figures">${figs}</div>` : ''}`, ready: true };
    },

    reflection(step) {
      const notes = progress.get().learningNotes[id] || {};
      return {
        ready: true,
        html: `<p>Make your own experimental argument. These optional notes are saved for you or a supervisor to review; their scientific quality is not automatically graded.</p><div class="research-notes">${Object.entries(
          step.prompts,
        )
          .map(
            ([key, label]) =>
              `<label>${esc(label)}<textarea rows="4" maxlength="5000" data-learning-note="${key}">${esc(notes[key] || '')}</textarea></label>`,
          )
          .join(
            '',
          )}</div><p class="secondary" data-note-status>Notes stay saved after finishing the module and after resetting course progress.</p>`,
        wire(el) {
          el.querySelectorAll('[data-learning-note]').forEach((input) =>
            input.addEventListener('input', () => {
              notes[input.dataset.learningNote] = input.value;
              progress.saveLearningNote(id, notes);
              el.querySelector('[data-note-status]').textContent = 'Saved on this computer · ready for human review.';
            }),
          );
        },
      };
    },

    worked(step, s) {
      const model = teachingModel(step);
      const labels =
        step.kind === 'concept'
          ? VISUAL_GUIDES[step.visual].frames.map((f) => f[0])
          : step.kind === 'cross'
            ? ['Read the parents', 'Make gametes', 'Combine chromosomes', 'Interpret the result']
            : ['Define the question', 'Choose the model', 'Inspect the evidence', 'Explain the conclusion'];
      const guide = { title: step.title, frames: step.pages.map((p, i) => [labels[i], p]) };
      s.seen ||= [0];
      s.phase ??= 0;
      const table = (head, rows) =>
        `<div class="research-table-wrap"><table class="counts"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      const adultRows = () =>
        table(
          ['Adult class', 'Expected share of adults'],
          model.rows.map((r) => [r.label, fractionLabel(r.p)]),
        ) +
        `<p>${fractionLabel(model.dead)} of fertilised eggs do not survive in this model. Adult shares use surviving offspring as the denominator.</p>`;
      const scene = (f, animate) => {
        let html = '';
        if (step.kind === 'concept') html = guideScene(step.visual, f, animate);
        else if (step.kind === 'cross') {
          if (f === 0) html = crossHTML(step);
          else if (f === 1)
            html = `<div class="worked-gametes">${[
              ['Egg types', model.eggs],
              ['Sperm types', model.sperm],
            ]
              .map(
                ([name, gs]) =>
                  `<section><h4>${name}</h4>${gs.map((g) => `<div class="worked-gamete">${gameteHTML(g.gamete, { chroms: step.chroms, mode: mode() })}<span>${fractionLabel(g.p)}</span></div>`).join('')}</section>`,
              )
              .join('')}</div>`;
          else if (f === 2 && model.square) {
            const sq = model.square,
              name = (g) => step.chroms.map((c) => CHROMS[c][g[c]].label).join('; ');
            html = `<table class="punnett"><caption>Each cell combines one egg with one sperm</caption><thead><tr><th>Egg ↓ · Sperm →</th>${sq.sperm.map((g) => `<th>${esc(name(g))}</th>`).join('')}</tr></thead><tbody>${sq.cells.map((row, i) => `<tr><th>${esc(name(sq.eggs[i]))}</th>${row.map((c, j) => `<td class="${c.viable ? '' : 'lethal'}"><div class="worked-cell-chroms"><small>From the egg</small>${gameteHTML(sq.eggs[i], { chroms: step.chroms, mode: mode() })}<small>From the sperm</small>${gameteHTML(sq.sperm[j], { chroms: step.chroms, mode: mode() })}</div><code>${esc(step.chroms.map((k) => CHROMS[k][sq.eggs[i][k]].label + '/' + CHROMS[k][sq.sperm[j][k]].label).join('; '))}</code><strong>${c.viable ? esc(c.label) : 'No adult offspring'}</strong>${c.viable ? '' : '<small>This chromosome combination does not survive.</small>'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
          } else html = adultRows();
        } else if (step.kind === 'statistics') {
          if (f === 0) html = crossHTML(step);
          else
            html = table(
              ['Class', 'Observed O', 'Expected E', '(O − E)²/E'],
              model.test.rows.map((r, i) => [
                i === 0 ? 'Curly' : 'Straight',
                step.observed[i],
                r.e.toFixed(1),
                f >= 2 ? r.part.toFixed(3) : 'Calculate next',
              ]),
            );
          if (f === 3)
            html += `<p class="feedback right">χ² = ${model.test.chi.toFixed(3)} · critical value ${model.test.critical} · ${model.test.fits ? 'Cannot reject the stated hypothesis' : 'Reject the stated hypothesis'}.</p>`;
        } else if (step.kind === 'mapping') {
          if (f === 0)
            html = researchDiagram(
              [step.shown.map((g) => (step.phase[g] ? g : '+')), step.shown.map((g) => (step.phase[g] ? '+' : g))],
              'Known reference maternal X pair',
              'Reference phase; locus columns are not map order',
            );
          else
            html = table(
              ['Reference class', 'Sons', ...(f >= 2 ? ['Chromosome assignment'] : [])],
              model.counts.map((c) => [
                c.label,
                c.n,
                ...(f >= 2 ? [{ P: 'Parental', I: 'Interval I', II: 'Interval II', D: 'DCO' }[c.kind]] : []),
              ]),
            );
          if (f >= 2)
            html += `<p>Reference order: ${step.order.join(' — ')}. Interval I: ${model.d1.toFixed(2)} cM; interval II: ${model.d2.toFixed(2)} cM.</p>`;
          if (f === 3)
            html += `<p>Observed DCO: ${model.dco.reduce((n, i) => n + model.counts[i].n, 0)}; expected: ${model.expectedDco.toFixed(2)}. Coincidence ${model.coc.toFixed(3)}; interference ${(1 - model.coc).toFixed(3)}.</p>`;
        } else if (step.kind === 'clones') {
          if (f === 0)
            html = researchDiagram(
              [
                ['centromere', 'FRT', 'm'],
                ['centromere', 'FRT', '+'],
              ],
              'FRT m / FRT +',
              'Known starting chromosome-arm pair',
            );
          else if (f === 1)
            html =
              '<p class="worked-number">36 h · 30 min · 8 independent discs</p><p>Goal per disc: 1–5 visible clones; largest at least 40 cells.</p>';
          else
            html = table(
              ['Disc', 'Clones', 'Mean size', 'Largest'],
              model.summaries.map((d, i) => [i + 1, d.clones, d.meanSize.toFixed(1), d.largest]),
            );
          if (f === 3) html += `<p class="worked-number">${model.met} of ${model.count} discs meet the goal</p>`;
        } else if (step.kind === 'target') {
          if (f === 0)
            html = researchDiagram(
              [['GAL4'], ['UAS-RNAi'], ['GAL80ts']],
              'All three transgenes retained',
              'Genetic tools; insertion locations unspecified',
            );
          else if (f === 1)
            html = table(
              ['Stage', 'Temperature', 'Model hours'],
              model.sim.bounds.map((b) => [b.label, b.temp + ' °C', b.end - b.start]),
            );
          else if (f === 2) {
            const a = model.sim.points.filter((p) => p.stage === 'adult');
            html = table(
              ['Adult observation', 'GAL4 activity', 'Target protein'],
              [a[0], a[23], a.at(-1)].map((p) => [
                p.t - model.sim.eclosion + ' h',
                (p.gal4 * 100).toFixed(1) + '%',
                (p.protein * 100).toFixed(1) + '%',
              ]),
            );
          } else html = targetPlot(model.sim, model.goal) + checksHTML(model.checks);
        } else if (step.kind === 'screen') {
          if (f === 0) html = fly('w/w; mut/CyO; +/+', { chroms: ['2'], caption: 'One independent founding chromosome per line' });
          else if (f === 1)
            html = `<p class="worked-number">Low preset · ${step.lines.toLocaleString('en-GB')} lines</p><p>Chance of a target allele: ${(model.selected.hitGene * 100).toFixed(2)}%.</p>`;
          else if (f === 2) html = screenPlot(step.dose, step.lines, model.goal);
          else
            html = table(
              ['Quantity', 'Model expectation'],
              [
                ['Coverage', (model.selected.hitGene * 100).toFixed(2) + '%'],
                ['Multiple hits among lethal lines', (model.selected.multiShare * 100).toFixed(1) + '%'],
                ['Expected lethal lines', model.selected.lethalLines.toFixed(0)],
                ['Maintenance vials', model.selected.vials.toLocaleString('en-GB')],
              ],
            );
        }
        return `<div class="worked-scene ${animate ? 'worked-arrival' : ''}" role="group" aria-label="${esc(labels[f])}">${html}</div>`;
      };
      return {
        html:
          visualGuideHTML('', true, guide) +
          '<p class="secondary">Follow all four stages. This is a fully explained demonstration; the next activity is yours to complete.</p>',
        wire(el) {
          return wireVisualGuide(el, '', {
            override: guide,
            sceneRenderer: scene,
            frame: s.phase,
            initialSpeed: s.speed,
            onFrame(f) {
              s.phase = f;
              if (!s.seen.includes(f)) s.seen.push(f);
              s.done = s.seen.length === 4;
              const b = el.querySelector('[data-next], [data-finish]');
              if (b) b.disabled = !s.done;
              const status = el.querySelector('[data-step-status]');
              if (status)
                status.textContent = `${index + 1} / ${lesson.steps.length} · ${s.done ? 'demonstration complete' : s.seen.length + '/4 stages viewed'}`;
              save();
            },
            onSpeed(v) {
              s.speed = v;
              save();
            },
          });
        },
      };
    },

    mission(step, s) {
      if (s.done) {
        try {
          s.resultSummary = replayPlan(PUZZLES[step.puzzle], s.plan).solved;
        } catch {
          s.resultSummary = null;
        }
        if (!s.resultSummary) s.done = false;
      }
      if (s.done)
        return {
          html: `<p>${esc(step.intro)}</p><p class="feedback right">Target class constructed in ${s.resultSummary.generations} generations${s.resultSummary.hints ? ' with hints' : ' without planner hints'}. Continue to interpret what this establishes.</p><button type="button" data-mission-again>Try the construction again</button>`,
          wire(el) {
            el.querySelector('[data-mission-again]').addEventListener('click', () => {
              s.done = false;
              s.plan = null;
              render();
            });
          },
        };
      return {
        html: `<p>${esc(step.intro)}</p><div data-mission></div>`,
        wire(el) {
          const planner = mountPlanner(el.querySelector('[data-mission]'), {
            onExit: () => {},
            mission: step.puzzle,
            savedPlan: s.plan,
            onChange(plan) {
              s.plan = plan;
              save();
            },
            onSolved(result) {
              s.resultSummary = result;
              s.done = true;
              s.assisted = !!result.hints;
              save();
              render();
            },
          });
          return () => planner.destroy?.();
        },
      };
    },

    choice(step, s) {
      const html = `<p class="question">${esc(step.question)}</p><div class="options">${step.options
        .map(
          (o, i) =>
            `<button type="button" class="option ${s.picked === i ? (o.correct ? 'right' : 'wrong') : ''}" data-option="${i}">${esc(o.text)}</button>`,
        )
        .join('')}</div>
        ${s.picked !== undefined ? `<p class="feedback ${step.options[s.picked].correct ? 'right' : 'wrong'}" role="status">${esc(step.options[s.picked].why)}</p>` : ''}`;
      return {
        html,
        wire(el) {
          el.querySelectorAll('[data-option]').forEach((b) =>
            b.addEventListener('click', () => {
              const i = Number(b.dataset.option);
              if (lesson.diagnostic && s.picked !== undefined) return; // first answer counts
              s.picked = i;
              if (lesson.diagnostic) {
                diagnosticAnswers[index] = !!step.options[i].correct;
                s.done = true;
              } else if (step.options[i].correct) s.done = true;
              render();
            }),
          );
        },
      };
    },

    gametes(step, s) {
      const chroms = step.chroms;
      const all = gametesFor(step.parent, chroms);
      s.found ||= [];
      s.sel ||= {};
      s.crossover ||= false;
      const g = parseGenotype(step.parent);
      const complete = all.every((x) => s.found.includes(gameteKey(x.gamete, chroms)));
      if (complete) s.done = true;
      const ready = chroms.every((c) => s.sel[c] !== undefined);
      const crossChrom = chroms.find((c) => g[c][0] !== g[c][1]) || chroms[0];
      const block = step.crossover ? crossoverBlock(step.parent, crossChrom) : '';
      const foundHTML = s.found
        .map((k) => {
          const gamete = Object.fromEntries(chroms.map((c, i) => [c, k.split('|')[i]]));
          const p = all.find((x) => gameteKey(x.gamete, chroms) === k)?.p;
          return `<li>${gameteHTML(gamete, { chroms, mode: mode() })}${s.done ? `<span class="share">${fractionLabel(p)}</span>` : ''}</li>`;
        })
        .join('');
      const html = `<p>${esc(step.intro)}</p>
        <div class="gamete-bench">
          <div class="parent">${genotypeHTML(g, { chroms, mode: mode() === 'notation' ? 'both' : mode(), interactive: true, selected: s.sel, caption: 'Parent: click one chromosome from each pair' })}
            ${step.crossover ? `<label class="check-label"><input type="checkbox" data-crossover ${s.crossover ? 'checked' : ''}/> Crossover between the chromosome ${crossChrom} pair</label>` : ''}
            ${s.crossover && block ? `<p class="feedback wrong" role="status">${esc(block)}</p>` : ''}
            <div class="tool-row"><button type="button" class="primary" data-make ${ready ? '' : 'disabled'}>Make gamete</button>${complete ? '' : '<button type="button" data-all-found>I have found them all</button>'}</div>
            ${s.note ? `<p class="feedback ${s.noteKind || ''}" role="status">${esc(s.note)}</p>` : ''}
          </div>
          <div class="found"><h4>${s.found.length ? `Gametes found: ${s.found.length}` : 'No gametes yet'}</h4><ul>${foundHTML}</ul></div>
        </div>
        ${s.done ? `<p class="feedback right" role="status">${esc(step.done)}</p>` : ''}`;
      return {
        html,
        wire(el) {
          el.querySelectorAll('.hom[data-chrom]').forEach((b) =>
            b.addEventListener('click', () => {
              s.sel[b.dataset.chrom] = Number(b.dataset.index);
              s.note = '';
              render();
            }),
          );
          el.querySelector('[data-crossover]')?.addEventListener('change', (e) => {
            s.crossover = e.target.checked;
            s.note = '';
            render();
          });
          el.querySelector('[data-make]')?.addEventListener('click', () => {
            const gamete = {};
            for (const c of chroms) {
              gamete[c] = g[c][s.sel[c]];
              if (s.crossover && c === crossChrom && canCrossOver(step.parent, c)) gamete[c] = crossoverKey(step.parent, c, s.sel[c]);
            }
            const k = gameteKey(gamete, chroms);
            if (s.found.includes(k)) {
              s.note = 'You already have that one. Try a different combination.';
              s.noteKind = '';
            } else {
              s.found.push(k);
              s.note =
                s.crossover && gamete[crossChrom] !== g[crossChrom][s.sel[crossChrom]]
                  ? `A recombinant: the crossover joined the two chromosomes into ${CHROMS[crossChrom][gamete[crossChrom]].label === '+' ? 'one carrying neither insertion' : `one carrying ${CHROMS[crossChrom][gamete[crossChrom]].label}`}.`
                  : '';
              s.noteKind = 'right';
            }
            s.sel = {};
            render();
          });
          el.querySelector('[data-all-found]')?.addEventListener('click', () => {
            const missing = all.length - s.found.length;
            s.note = missing === 1 ? 'Not quite: there is one more kind to find.' : `Not quite: there are ${missing} more kinds to find.`;
            if (step.crossover && !s.crossover && all.length > 2) s.note += ' Have you tried the crossover?';
            s.noteKind = 'wrong';
            render();
          });
        },
      };
    },

    predict(step, s) {
      const { rows, dead } = classesFor(step.mother, step.father, { traits: step.traits, bySex: step.bySex });
      const options = [
        ...rows.map((r) => ({ label: r.label, p: r.p })),
        ...(step.decoys || []).filter((d) => !rows.some((r) => r.label === d)).map((label) => ({ label, p: 0 })),
      ].sort((a, b) => a.label.localeCompare(b.label));
      s.guess ||= {};
      const sum = options.reduce((t, o) => t + (FRACTIONS.find((f) => f.label === s.guess[o.label])?.value || 0), 0);
      const marks = s.checked ? options.map((o) => near(FRACTIONS.find((f) => f.label === s.guess[o.label])?.value ?? -1, o.p)) : [];
      const sq = punnett(step.mother, step.father, { chroms: step.chroms, traits: step.traits, bySex: step.bySex });
      const square = (reveal) => {
        const name = (gam) => step.chroms.map((c) => CHROMS[c][gam[c]].label).join('; ');
        return `<table class="punnett"><thead><tr><th>Eggs ↓ · Sperm →</th>${sq.sperm.map((x) => `<th>${esc(name(x))}</th>`).join('')}</tr></thead><tbody>${sq.eggs
          .map(
            (e, i) =>
              `<tr><th>${esc(name(e))}</th>${sq.cells[i].map((c) => `<td class="${reveal && !c.viable ? 'lethal' : ''}">${esc(c.label)}${reveal && !c.viable ? '<small>dies</small>' : ''}</td>`).join('')}</tr>`,
          )
          .join('')}</tbody></table>`;
      };
      const html = `<p>${esc(step.intro)}</p>${crossHTML(step)}
        <table class="predict"><thead><tr><th>Offspring class</th><th>Your prediction</th>${s.revealed ? '<th>Answer</th>' : ''}</tr></thead><tbody>${options
          .map(
            (o, i) =>
              `<tr class="${s.checked ? (marks[i] ? 'right' : 'wrong') : ''}"><td>${esc(o.label)}</td><td><div class="fractions" role="group" aria-label="${esc(o.label)}">${FRACTIONS.map(
                (f) =>
                  `<button type="button" data-row="${esc(o.label)}" data-frac="${f.label}" class="${s.guess[o.label] === f.label ? 'on' : ''}" ${s.revealed ? 'disabled' : ''}>${f.label}</button>`,
              ).join('')}</div></td>${s.revealed ? `<td><strong>${fractionLabel(o.p)}</strong></td>` : ''}</tr>`,
          )
          .join('')}
        </tbody></table>
        ${!s.revealed ? `<p class="secondary">Shares of the adults that hatch. Yours add up to ${fractionLabel(sum)}${near(sum, 1) ? '.' : ' (they should add up to all).'}</p>` : ''}
        <div class="tool-row">${s.revealed ? '' : `<button type="button" class="primary" data-check ${options.every((o) => s.guess[o.label]) ? '' : 'disabled'}>Check</button>`}
          ${!s.revealed && !s.hint ? '<button type="button" data-hint>Draw the squares</button>' : ''}
          ${s.checked && !s.revealed ? '<button type="button" data-reveal>Show me</button>' : ''}</div>
        ${s.checked && !s.revealed ? `<p class="feedback wrong" role="status">${marks.filter((m) => !m).length} of your predictions ${marks.filter((m) => !m).length === 1 ? 'is' : 'are'} off. Change them and check again, or ask to be shown.</p>` : ''}
        ${s.hint || s.revealed ? `<div class="square-wrap"><h4>${s.revealed ? 'Every egg meets every sperm' : 'Every combination of egg and sperm is equally likely'}</h4>${square(s.revealed)}</div>` : ''}
        ${s.revealed ? `<p class="feedback ${s.firstTry ? 'right' : ''}" role="status">${s.firstTry ? 'Spot on. ' : ''}${esc(step.explain)}${dead > 0 ? ` (${fractionLabel(dead)} of the fertilised eggs die.)` : ''}</p>` : ''}`;
      return {
        html,
        wire(el) {
          el.querySelectorAll('[data-frac]').forEach((b) =>
            b.addEventListener('click', () => {
              s.guess[b.dataset.row] = b.dataset.frac;
              s.checked = false;
              render();
            }),
          );
          el.querySelector('[data-hint]')?.addEventListener('click', () => {
            s.hint = true;
            s.assisted = true;
            render();
          });
          el.querySelector('[data-reveal]')?.addEventListener('click', () => {
            s.revealed = true;
            s.done = true;
            s.assisted = true;
            render();
          });
          el.querySelector('[data-check]')?.addEventListener('click', () => {
            const ok = options.every((o) => near(FRACTIONS.find((f) => f.label === s.guess[o.label]).value, o.p));
            s.attempts = (s.attempts || 0) + 1;
            s.checked = true;
            if (ok) {
              s.revealed = true;
              s.done = true;
              s.firstTry = s.attempts === 1;
            }
            render();
          });
        },
      };
    },

    pick(step, s) {
      const { rows } = classesFor(step.mother, step.father, { traits: step.traits });
      const html = `<p>${esc(step.intro)}</p>${crossHTML({ ...step, chroms: [step.target.chrom] })}
        <p class="secondary">The offspring, sorted by what you can see:</p>
        <div class="options">${rows.map((r, i) => `<button type="button" class="option ${s.picked === i ? (classMatches(r, step.target) ? 'right' : 'wrong') : ''}" data-class="${i}">${esc(r.label)} <span class="share">${fractionLabel(r.p)}</span></button>`).join('')}</div>
        ${s.picked !== undefined ? `<p class="feedback ${classMatches(rows[s.picked], step.target) ? 'right' : 'wrong'}" role="status">${esc(classMatches(rows[s.picked], step.target) ? step.right : step.wrong)}</p>` : ''}`;
      return {
        html,
        wire(el) {
          el.querySelectorAll('[data-class]').forEach((b) =>
            b.addEventListener('click', () => {
              s.picked = Number(b.dataset.class);
              if (classMatches(rows[s.picked], step.target)) s.done = true;
              render();
            }),
          );
        },
      };
    },

    multi(step, s) {
      s.sel ||= [];
      const right = (i) => !!step.options[i].correct;
      const html = `<p class="question">${esc(step.question)}</p><p class="secondary">Select all that apply, then check.</p>
        <div class="options">${step.options
          .map((o, i) => {
            const on = s.sel.includes(i);
            const mark = s.checked ? (on && right(i) ? 'right' : on ? 'wrong' : right(i) ? 'missed' : '') : '';
            return `<button type="button" class="option multi ${on ? 'on' : ''} ${mark}" data-multi="${i}" aria-pressed="${on}" ${s.done ? 'disabled' : ''}><span>${esc(o.text)}</span>${s.checked && (on || right(i)) ? `<small>${esc(o.why)}</small>` : ''}</button>`;
          })
          .join('')}</div>
        ${s.done ? '' : `<button type="button" class="primary" data-check ${s.sel.length ? '' : 'disabled'}>Check</button>`}
        ${s.checked && !s.done ? `<p class="feedback wrong" role="status">Not quite. Read the notes on the marked options, change your selection and check again.</p>` : ''}
        ${s.done && step.explain ? `<p class="feedback right" role="status">${esc(step.explain)}</p>` : ''}`;
      return {
        html,
        wire(el) {
          el.querySelectorAll('[data-multi]').forEach((b) =>
            b.addEventListener('click', () => {
              const i = Number(b.dataset.multi);
              s.sel = s.sel.includes(i) ? s.sel.filter((x) => x !== i) : [...s.sel, i];
              s.checked = false;
              render();
            }),
          );
          el.querySelector('[data-check]')?.addEventListener('click', () => {
            s.checked = true;
            if (step.options.every((o, i) => s.sel.includes(i) === right(i))) s.done = true;
            render();
          });
        },
      };
    },

    count(step, s) {
      const { rows } = classesFor(step.mother, step.father, { traits: step.traits });
      const counts = sampleCounts(rows, step.n, rng(step.seed));
      const answer = step.answer(counts);
      const html = `<p>${esc(step.intro)}</p>${crossHTML(step)}
        <table class="counts"><thead><tr><th>Class</th><th>Flies counted</th></tr></thead><tbody>${counts.map((c) => `<tr><td>${esc(c.label)}</td><td>${c.n}</td></tr>`).join('')}
          <tr class="total"><td>Total</td><td>${step.n}</td></tr></tbody></table>
        <label class="answer">${esc(step.question)} <input type="number" step="any" data-answer value="${s.value ?? ''}" ${s.done ? 'disabled' : ''}/> ${esc(step.unit || '')}</label>
        ${s.done ? '' : `<div class="tool-row"><button type="button" class="primary" data-check>Check</button>${s.tries ? '<button type="button" data-reveal>Show me</button>' : ''}</div>`}
        ${s.tries && !s.done ? `<p class="feedback wrong" role="status">${esc(step.hint)}</p>` : ''}
        ${s.done ? `<p class="feedback ${s.revealed ? '' : 'right'}" role="status"><strong>${answer.toFixed(step.decimals ?? 1)} ${esc(step.unit || '')}.</strong> ${esc(step.explain)}</p>` : ''}`;
      return {
        html,
        wire(el) {
          const input = el.querySelector('[data-answer]');
          input?.addEventListener('input', () => {
            s.value = input.value;
          });
          el.querySelector('[data-check]')?.addEventListener('click', () => {
            const v = Number(s.value);
            if (s.value !== undefined && s.value !== '' && Math.abs(v - answer) <= step.tolerance) s.done = true;
            else s.tries = (s.tries || 0) + 1;
            render();
          });
          el.querySelector('[data-reveal]')?.addEventListener('click', () => {
            s.done = true;
            s.revealed = true;
            s.assisted = true;
            render();
          });
        },
      };
    },

    chance(step, s) {
      const { rows } = classesFor(step.mother, step.father, { traits: step.traits });
      const expected = rows.find((r) => r.label === step.focus).p;
      s.samples ||= Object.fromEntries(step.sizes.map((n) => [n, []]));
      s.k ||= 0;
      if (step.sizes.every((n) => s.samples[n].length >= step.need)) s.done = true;
      const strip = (n) => {
        const xs = s.samples[n];
        const range = xs.length ? `${Math.round(Math.min(...xs) * 100)}–${Math.round(Math.max(...xs) * 100)}%` : '';
        return `<div class="strip-row"><button type="button" data-draw="${n}">Count a vial of ${n}</button>
          <div class="strip" aria-label="Shares of ${esc(step.focus)} in vials of ${n}"><span class="expect" style="left:${expected * 100}%"></span>${xs.map((x, i) => `<i style="left:${x * 100}%" class="${i === xs.length - 1 ? 'new' : ''}"></i>`).join('')}</div>
          <span class="range">${xs.length ? `${xs.length} vial${xs.length === 1 ? '' : 's'} · ${range}` : ''}</span></div>`;
      };
      const html = `<p>${esc(step.intro)}</p>${crossHTML(step)}
        <div class="strips"><div class="strip-axis"><span>0%</span><span>${esc(step.focus)}: expected ${fractionLabel(expected)}</span><span>100%</span></div>${step.sizes.map(strip).join('')}</div>
        <p class="secondary">Each dot is one vial: the share of ${esc(step.focus.toLowerCase())} among the flies counted. Count at least ${step.need} vials of each size.</p>
        ${s.done ? `<p class="feedback right" role="status">${esc(step.done)}</p>` : ''}`;
      return {
        html,
        wire(el) {
          el.querySelectorAll('[data-draw]').forEach((b) =>
            b.addEventListener('click', () => {
              const n = Number(b.dataset.draw);
              const c = sampleCounts(rows, n, rng((step.seed || 1) * 1000 + ++s.k));
              s.samples[n].push(c.find((r) => r.label === step.focus).n / n);
              render();
            }),
          );
        },
      };
    },

    chisq(step, s) {
      s.judged ||= {};
      const obs = step.observed.map((o) => o.n);
      const h = s.h ?? null;
      const test = h === null ? null : chiSquare(obs, step.hypotheses[h].shares);
      if (step.hypotheses.every((_, i) => s.judged[i] === true)) s.done = true;
      const html = `<p>${esc(step.intro)}</p>
        <table class="counts"><thead><tr><th>Class</th><th>Observed (O)</th>${test ? '<th>Expected (E)</th><th>(O − E)² / E</th>' : ''}</tr></thead><tbody>${step.observed
          .map(
            (o, i) =>
              `<tr><td>${esc(o.label)}</td><td>${o.n}</td>${test ? `<td>${test.rows[i].e.toFixed(1)}</td><td>${test.rows[i].part.toFixed(2)}</td>` : ''}</tr>`,
          )
          .join('')}
          ${test ? `<tr class="total"><td colspan="3">χ² (${test.df} degree${test.df === 1 ? '' : 's'} of freedom; 5% critical value ${test.critical})</td><td>${test.chi.toFixed(2)}</td></tr>` : ''}</tbody></table>
        <p>Test against:</p><div class="tool-row">${step.hypotheses.map((x, i) => `<button type="button" data-h="${i}" class="${h === i ? 'on' : ''} ${s.judged[i] === true ? 'done' : ''}">${esc(x.label)}${s.judged[i] === true ? ' ✓' : ''}</button>`).join('')}</div>
        ${
          test
            ? `<p class="secondary">p = ${test.p < 0.001 ? '< 0.001' : test.p.toFixed(3)}. What do you conclude about the ${esc(step.hypotheses[h].label)} hypothesis?</p>
          <div class="tool-row"><button type="button" data-judge="fits">Consistent: cannot reject it</button><button type="button" data-judge="reject">Reject it</button></div>
          ${s.note ? `<p class="feedback ${s.noteOk ? 'right' : 'wrong'}" role="status">${esc(s.note)}</p>` : ''}`
            : '<p class="secondary">Choose a hypothesis to test.</p>'
        }
        ${s.done ? `<p class="feedback right" role="status">${esc(step.explain)}</p>` : ''}`;
      return {
        html,
        wire(el) {
          el.querySelectorAll('[data-h]').forEach((b) =>
            b.addEventListener('click', () => {
              s.h = Number(b.dataset.h);
              s.note = '';
              render();
            }),
          );
          el.querySelectorAll('[data-judge]').forEach((b) =>
            b.addEventListener('click', () => {
              const sayFits = b.dataset.judge === 'fits';
              const ok = sayFits === test.fits;
              s.judged[h] = ok || s.judged[h] === true;
              s.noteOk = ok;
              s.note = ok
                ? test.fits
                  ? `Right: χ² = ${test.chi.toFixed(2)} is below ${test.critical}, so the data are consistent with ${step.hypotheses[h].label}. That is not proof it is true.`
                  : `Right: χ² = ${test.chi.toFixed(2)} is above ${test.critical}. A deviation this large would happen less than 5% of the time by chance.`
                : test.fits
                  ? `χ² = ${test.chi.toFixed(2)} is below the critical value ${test.critical}: the deviation is the kind chance produces, so you cannot reject it.`
                  : `χ² = ${test.chi.toFixed(2)} is above the critical value ${test.critical}: chance alone rarely gives a deviation this large.`;
              render();
            }),
          );
        },
      };
    },

    grid(step, s) {
      s.results ||= {};
      const name = (k) => CHROMS['2'][k].label;
      const keyOf = (r, c) => `${r}|${c}`;
      if (step.rows.every((r) => step.cols.every((c) => s.results[keyOf(r, c)]))) s.done = true;
      let mapHTML = '';
      if (step.map) {
        const m = deficiencyMap(step.cols);
        const w = 100 / m.genes.length;
        mapHTML = `<div class="dfmap"><div class="genes">${m.genes.map((g) => `<span style="width:${w}%">gene ${g}</span>`).join('')}</div>
          ${m.dfs
            .map((d) => {
              const i0 = m.genes.indexOf(d.genes[0]);
              return `<div class="dfrow"><span class="dfbar" style="left:${i0 * w}%;width:${d.genes.length * w}%">${esc(d.label)}</span></div>`;
            })
            .join('')}
          <p class="secondary">Each bar is a deficiency: the stretch of chromosome 2 it deletes.</p></div>`;
      }
      const html = `<p>${esc(step.intro)}</p>${mapHTML}
        <table class="grid"><thead><tr><th>♀ (over CyO) ↓ · ♂ (over CyO) →</th>${step.cols.map((c) => `<th>${esc(name(c))}</th>`).join('')}</tr></thead><tbody>${step.rows
          .map(
            (r, i) =>
              `<tr><th>${esc(name(r))}</th>${step.cols
                .map((c, j) => {
                  const res = s.results[keyOf(r, c)];
                  return `<td class="${res ? (res.complements ? 'comp' : 'fail') : ''}">${
                    res
                      ? `<strong>${res.complements ? 'Complements' : 'Fails'}</strong><small>${res.straight} of ${res.total} straight-winged</small>`
                      : `<button type="button" data-cell="${i}:${j}">Cross</button>`
                  }</td>`;
                })
                .join('')}</tr>`,
          )
          .join('')}</tbody></table>
        <p class="secondary">Each cross: females of the row stock × males of the column stock, 60 offspring scored. Straight wings can only be the two mutant chromosomes together.</p>
        ${s.done ? `<p class="feedback right" role="status">${esc(step.done)}</p>` : ''}`;
      return {
        html,
        wire(el) {
          el.querySelectorAll('[data-cell]').forEach((b) =>
            b.addEventListener('click', () => {
              const [i, j] = b.dataset.cell.split(':').map(Number);
              s.results[keyOf(step.rows[i], step.cols[j])] = complementationCross(step.rows[i], step.cols[j], 60, 11 + i * 7 + j);
              render();
            }),
          );
        },
      };
    },

    threepoint(step, s) {
      if (s.caseSeed !== undefined) step = threePointPractice(step, s.caseSeed);
      const data = threePointData(step);
      s.parental ||= [];
      s.dco ||= [];
      s.values ||= {};
      s.interval1 ||= [];
      s.interval2 ||= [];
      const mark = (rows) => [...rows].sort((a, b) => a - b).join(',');
      const hap = (mutant) => step.shown.map((g) => (mutant[g] ? g : '+'));
      const diagram = researchDiagram(
        [hap(step.phase), hap(Object.fromEntries(step.shown.map((g) => [g, !step.phase[g]])))],
        `X(${hap(step.phase).join(' ')}) / X(${hap(Object.fromEntries(step.shown.map((g) => [g, !step.phase[g]]))).join(' ')})`,
        'Maternal X homologs · loci listed alphabetically, not in map order',
      );
      const comparisons = data.dco
        .map((i) => {
          const d = data.counts[i],
            p = data.counts[data.parental.find((j) => step.order.filter((g) => d.mutant[g] !== data.counts[j].mutant[g]).length === 1)];
          return `<div class="allele-comparison"><span>Parental → DCO</span>${step.order.map((g) => `<span class="${g === data.middle ? 'changed-allele' : ''}">${p.mutant[g] ? g : '+'} → ${d.mutant[g] ? g : '+'}${g === data.middle ? ' (changed)' : ''}</span>`).join('')}</div>`;
        })
        .join('');
      const correctRows = (interval) => data.counts.map((c, i) => (c.kind === interval || c.kind === 'D' ? i : -1)).filter((i) => i >= 0);
      const html = `<p>${esc(step.intro)}</p>${diagram}<button type="button" data-fresh-map>Try a fresh chromosome phase and sample</button>${s.practice ? '<p class="secondary">Fresh case: solve without worked-answer support to record independent practice.</p>' : ''}
        <div class="research-table-wrap"><table class="counts mapping-counts"><caption>Sons: each reads one maternal X chromosome</caption><thead><tr><th>Class</th>${step.shown.map((g) => `<th>${esc(g)}</th>`).join('')}<th>Count</th><th>Your class assignment</th></tr></thead><tbody>${data.counts.map((row, i) => `<tr><th scope="row">${esc(row.label)}</th>${step.shown.map((g) => `<td>${row.mutant[g] ? esc(g) : '+'}</td>`).join('')}<td>${row.n}</td><td><div class="tool-row">${['parental', 'dco'].map((kind) => `<button type="button" data-map-row="${i}" data-map-kind="${kind}" aria-pressed="${s[kind].includes(i)}" class="${s[kind].includes(i) ? 'on' : ''}" ${s.ordered ? 'disabled' : ''}>${kind === 'parental' ? 'Parental' : 'Double crossover'}</button>`).join('')}</div></td></tr>`).join('')}</tbody><tfoot><tr><th colspan="4">Total sons</th><td>${step.n}</td><td></td></tr></tfoot></table></div>
        <label class="answer">Middle gene <select data-middle ${s.ordered ? 'disabled' : ''}><option value="">Choose…</option>${step.shown.map((g) => `<option value="${g}" ${s.middle === g ? 'selected' : ''}>${esc(TP_GENES[g].name)} (${g})</option>`).join('')}</select></label>
        ${s.ordered ? '' : `<div class="tool-row"><button type="button" class="primary" data-check-order>Check classes and order</button>${s.orderTries ? '<button type="button" data-reveal-order>Show me the chromosome comparison</button>' : ''}</div>`}
        ${
          s.orderTries
            ? checksHTML([
                {
                  text:
                    mark(s.parental) === mark(data.parental)
                      ? 'Parental pair: correct'
                      : 'Parental pair: match the maternal homologs; these are the two largest classes here.',
                  ok: mark(s.parental) === mark(data.parental),
                },
                {
                  text:
                    mark(s.dco) === mark(data.dco)
                      ? 'Double-crossover pair: correct'
                      : 'DCO pair: identify the two rarest reciprocal classes in this sample.',
                  ok: mark(s.dco) === mark(data.dco),
                },
                {
                  text:
                    s.middle === data.middle
                      ? 'Middle locus: correct'
                      : 'Middle locus: compare a DCO with the parental chromosome sharing its two outside alleles.',
                  ok: s.middle === data.middle,
                },
              ])
            : ''
        }
        ${s.orderTries && !s.ordered ? '<p class="feedback wrong" role="status">Choose two parental classes and two double-crossover classes. Compare their maternal X chromosomes: only the middle allele changes when the two outside alleles return to their parental arrangement.</p>' : ''}
        ${
          s.ordered
            ? `<p class="feedback right">The maternal X order is ${step.order.join(' — ')} (the reverse order describes the same map). Compare each double-crossover chromosome with its closest parental chromosome: ${data.middle} changes while the outside alleles match.</p>
          ${comparisons}<p>Compute each interval distance from single crossovers in that interval plus BOTH double-crossover classes. Then compute observed DCO / expected DCO, where expected DCO = total × interval fraction I × interval fraction II.</p>
          <table class="counts interval-rows"><caption>Select recombinant chromosomes for each interval. Each DCO belongs to both.</caption><thead><tr><th>Class (count)</th><th>${step.order[0]}–${step.order[1]}</th><th>${step.order[1]}–${step.order[2]}</th></tr></thead><tbody>${data.counts.map((row, i) => `<tr><th>${esc(row.label)} (${row.n})</th>${[1, 2].map((k) => `<td><input type="checkbox" aria-label="${esc(row.label)}, interval ${k}" data-interval="${k}" data-interval-row="${i}" ${s['interval' + k].includes(i) ? 'checked' : ''} ${s.done ? 'disabled' : ''}/></td>`).join('')}</tr>`).join('')}</tbody></table>
          ${[1, 2].map((k) => `<p>Interval ${k}: selected total = ${s['interval' + k].reduce((n, i) => n + data.counts[i].n, 0)} / ${step.n}</p>`).join('')}
          <div class="map-answers">${[
            ['d1', `${step.order[0]}–${step.order[1]} distance (cM)`],
            ['d2', `${step.order[1]}–${step.order[2]} distance (cM)`],
            ['coc', 'Coefficient of coincidence'],
          ]
            .map(
              ([key, label]) =>
                `<label class="answer">${esc(label)}<input type="number" step="any" data-map-value="${key}" value="${esc(s.values[key] ?? '')}" ${s.done ? 'disabled' : ''}/></label>`,
            )
            .join('')}</div>
          ${s.done ? '' : `<div class="tool-row"><button type="button" class="primary" data-check-map>Check map</button>${s.mapTries ? '<button type="button" data-reveal-map>Show the calculation</button>' : ''}</div>`}
          ${s.mapTries && !s.done ? '<p class="feedback wrong" role="status">Check your selected rows as well as your numbers. Count exchanges on the maternal chromosomes separately for each interval. Double crossovers count in both. Use the measured interval fractions, rather than reference map values, to calculate expected double crossovers.</p>' : ''}
          ${s.done ? `<p class="feedback right" role="status">${step.order[0]}–${step.order[1]}: ${data.d1.toFixed(2)} cM; ${step.order[1]}–${step.order[2]}: ${data.d2.toFixed(2)} cM. Observed DCO = ${data.dco.reduce((t, i) => t + data.counts[i].n, 0)}; expected = ${data.expectedDco.toFixed(2)}. Coefficient = ${data.coc.toFixed(3)}; interference = ${(1 - data.coc).toFixed(3)}. ${esc(step.explain)}</p>` : ''}`
            : ''
        }`;
      return {
        html,
        wire(el) {
          el.querySelector('[data-fresh-map]').addEventListener('click', () => {
            const caseSeed = ((s.caseSeed ?? step.seed) + 7919) >>> 0;
            Object.keys(s).forEach((k) => delete s[k]);
            Object.assign(s, { caseSeed, practice: true, done: false });
            render();
          });
          el.querySelectorAll('[data-interval]').forEach((input) =>
            input.addEventListener('change', () => {
              const key = 'interval' + input.dataset.interval,
                row = Number(input.dataset.intervalRow);
              s[key] = input.checked ? [...s[key], row] : s[key].filter((i) => i !== row);
              render();
            }),
          );
          el.querySelectorAll('[data-map-row]').forEach((b) =>
            b.addEventListener('click', () => {
              const row = Number(b.dataset.mapRow),
                kind = b.dataset.mapKind,
                other = kind === 'parental' ? 'dco' : 'parental';
              s[kind] = s[kind].includes(row) ? s[kind].filter((i) => i !== row) : [...s[kind], row];
              s[other] = s[other].filter((i) => i !== row);
              render();
            }),
          );
          el.querySelector('[data-middle]')?.addEventListener('change', (e) => {
            s.middle = e.target.value;
          });
          el.querySelector('[data-check-order]')?.addEventListener('click', () => {
            s.orderTries = (s.orderTries || 0) + 1;
            s.ordered = mark(s.parental) === mark(data.parental) && mark(s.dco) === mark(data.dco) && s.middle === data.middle;
            render();
          });
          el.querySelector('[data-reveal-order]')?.addEventListener('click', () => {
            s.parental = [...data.parental];
            s.dco = [...data.dco];
            s.middle = data.middle;
            s.ordered = true;
            s.assisted = true;
            render();
          });
          el.querySelectorAll('[data-map-value]').forEach((input) =>
            input.addEventListener('input', () => {
              s.values[input.dataset.mapValue] = input.value;
            }),
          );
          el.querySelector('[data-check-map]')?.addEventListener('click', () => {
            s.mapTries = (s.mapTries || 0) + 1;
            s.done =
              mark(s.interval1) === mark(correctRows('I')) &&
              mark(s.interval2) === mark(correctRows('II')) &&
              numberOK(s.values.d1, data.d1, 0.1) &&
              numberOK(s.values.d2, data.d2, 0.1) &&
              numberOK(s.values.coc, data.coc, 0.02);
            render();
          });
          el.querySelector('[data-reveal-map]')?.addEventListener('click', () => {
            s.assisted = true;
            s.interval1 = correctRows('I');
            s.interval2 = correctRows('II');
            s.values = { d1: data.d1.toFixed(2), d2: data.d2.toFixed(2), coc: data.coc.toFixed(3) };
            s.done = true;
            render();
          });
        },
      };
    },

    clones(step, s) {
      s.round ??= SHOCK_TIMES[3].round;
      s.minutes ??= 30;
      const cohort = (round = s.round, minutes = s.minutes) =>
        cloneCohort({ round, p: SHOCK_LENGTHS.find((l) => l.minutes === minutes).p, seed: step.seed, goal: step.goal });
      if (s.ran && !s.result) s.result = cohort();
      const sample = s.result,
        result = sample?.disc;
      const diagram = researchDiagram(
        [
          ['centromere', 'FRT', 'm'],
          ['centromere', 'FRT', '+'],
        ],
        'FRT m / FRT + → m/m and +/+ daughter lineages',
        'One heterozygous chromosome-arm pair',
      );
      const disc = result
        ? `<div class="clone-view"><svg viewBox="0 0 ${result.size} ${result.size}" role="img" aria-label="First independent disc: purple mutant clones, green reciprocal twins, grey heterozygous tissue">${result.cells.map((c, i) => (c.inside ? `<rect x="${i % result.size}" y="${Math.floor(i / result.size)}" width="0.96" height="0.96" fill="${['#c48fc7', '#53616a', '#8bca9b'][c.geno]}"/>` : '')).join('')}</svg><div><p>Disc 1 shown: purple m/m, green +/+, grey m/+.</p><p>Same plan, eight independent discs. Variation comes from chromosome-exchange events and lineage growth.</p><strong>${sample.met} / ${sample.count} discs meet the goal</strong><p>Observed success ${((sample.met / sample.count) * 100).toFixed(0)}% in this small model sample; this is not a calibrated laboratory success rate.</p></div></div>
        <table class="counts clone-replicates"><caption>Independent dissections: compare the spread, not just disc 1</caption><thead><tr><th>Disc</th><th>Clones</th><th>Mean size (cells)</th><th>Largest (cells)</th></tr></thead><tbody>${sample.summaries.map((d, i) => `<tr><th>${i + 1}</th><td>${d.clones}</td><td>${d.meanSize.toFixed(1)}</td><td>${d.largest}</td></tr>`).join('')}</tbody></table>`
        : '';
      const prediction = `<label class="answer">Before dissecting: earlier induction usually produces…<select data-clone-prediction><option value="">Choose a prediction…</option><option value="larger" ${s.prediction === 'larger' ? 'selected' : ''}>Larger individual clones</option><option value="smaller" ${s.prediction === 'smaller' ? 'selected' : ''}>Smaller individual clones</option></select></label>`;
      return {
        html: `<p>${esc(step.intro)}</p><p>Plan for at least four of eight independent discs to meet those tissue goals. A single lucky disc is insufficient.</p>${diagram}${prediction}<div class="research-controls"><label>Heat-shock age<select data-clone-round>${SHOCK_TIMES.map((t) => `<option value="${t.round}" ${s.round === t.round ? 'selected' : ''}>${t.hours} h after egg laying</option>`).join('')}</select></label><label>Heat-shock duration<select data-clone-length>${SHOCK_LENGTHS.map((l) => `<option value="${l.minutes}" ${s.minutes === l.minutes ? 'selected' : ''}>${l.minutes} min</option>`).join('')}</select></label></div><div class="tool-row"><button type="button" class="primary" data-clone-run ${s.prediction ? '' : 'disabled'}>Induce and dissect eight discs</button>${s.tries && !s.done ? '<button type="button" data-clone-example>Show a working plan</button>' : ''}</div>${disc}${checksHTML(
          [
            { text: 'Earlier chromosome exchange leaves more divisions for a larger lineage', ok: s.prediction === 'larger' },
            { text: 'At least 4 of 8 discs meet the tissue goals', ok: sample && sample.met >= 4 },
          ],
        )}${s.tries && sample ? `<p class="feedback ${s.done ? 'right' : 'wrong'}" role="status">${esc(s.done ? step.explain : 'Earlier induction leaves more divisions to expand each lineage; later induction reaches more dividing cells. Compare all eight discs and revise your prediction or plan.')}</p>` : ''}`,
        wire(el) {
          const reset = () => {
            s.result = null;
            s.ran = false;
            s.done = false;
            render();
          };
          el.querySelector('[data-clone-prediction]').addEventListener('change', (e) => {
            s.prediction = e.target.value;
            reset();
          });
          el.querySelector('[data-clone-round]').addEventListener('change', (e) => {
            s.round = Number(e.target.value);
            reset();
          });
          el.querySelector('[data-clone-length]').addEventListener('change', (e) => {
            s.minutes = Number(e.target.value);
            reset();
          });
          const run = () => {
            s.ran = true;
            s.result = cohort();
            s.tries = (s.tries || 0) + 1;
            s.done = s.result.met >= 4 && s.prediction === 'larger';
            render();
          };
          el.querySelector('[data-clone-run]').addEventListener('click', run);
          el.querySelector('[data-clone-example]')?.addEventListener('click', () => {
            const plan = SHOCK_TIMES.flatMap((t) => SHOCK_LENGTHS.map((l) => ({ round: t.round, minutes: l.minutes }))).find(
              (x) => cohort(x.round, x.minutes).met >= 4,
            );
            s.assisted = true;
            s.prediction = 'larger';
            s.round = plan.round;
            s.minutes = plan.minutes;
            run();
          });
        },
      };
    },

    target(step, s) {
      s.temps ||= Object.fromEntries(STAGES.map((stage) => [stage.id, 18]));
      if (s.ran && !s.sim) s.sim = simulateTarget(s.temps);
      const sim = s.sim,
        checks = sim ? targetChecks(sim, step.goal) : step.goal.checks.map((c) => ({ text: c.text, ok: false }));
      const diagram = researchDiagram(
        [['GAL4 driver'], ['UAS-RNAi'], ['GAL80ts repressor']],
        'GAL4, UAS-RNAi and GAL80ts present (insertion sites unspecified)',
        'Genetic tools retained throughout the schedule',
      );
      return {
        html: `<p>${esc(step.intro)}</p>${diagram}<div class="temperature-schedule">${STAGES.map((stage) => `<label>${esc(stage.label)}<select data-temp="${stage.id}">${[18, 29].map((t) => `<option value="${t}" ${s.temps[stage.id] === t ? 'selected' : ''}>${t} °C</option>`).join('')}</select></label>`).join('')}</div><div class="tool-row"><button type="button" class="primary" data-target-run>Simulate schedule</button>${s.tries && !s.done ? '<button type="button" data-target-example>Show a working schedule</button>' : ''}</div>${checksHTML(checks)}${sim ? targetPlot(sim, step.goal) : ''}${s.tries && sim ? `<p class="feedback ${s.done ? 'right' : 'wrong'}" role="status">${esc(s.done ? step.explain : 'The transgenes stay in the fly, but their activity and the target protein change at different rates. Check which stage window fails and adjust the temperature schedule.')}</p>` : ''}`,
        wire(el) {
          el.querySelectorAll('[data-temp]').forEach((select) =>
            select.addEventListener('change', () => {
              s.temps[select.dataset.temp] = Number(select.value);
              s.sim = null;
              s.ran = false;
              s.done = false;
              render();
            }),
          );
          const run = () => {
            s.ran = true;
            s.sim = simulateTarget(s.temps);
            s.tries = (s.tries || 0) + 1;
            s.done = targetChecks(s.sim, step.goal).every((c) => c.ok);
            render();
          };
          el.querySelector('[data-target-run]').addEventListener('click', run);
          el.querySelector('[data-target-example]')?.addEventListener('click', () => {
            s.assisted = true;
            s.temps = Array.from({ length: 1 << STAGES.length }, (_, bits) =>
              Object.fromEntries(STAGES.map((stage, i) => [stage.id, bits & (1 << i) ? 29 : 18])),
            ).find((temps) => targetChecks(simulateTarget(temps), step.goal).every((c) => c.ok));
            run();
          });
        },
      };
    },

    screen(step, s) {
      s.dose ??= 35;
      s.lines ??= '1000';
      if (s.ran && !s.result) s.result = screenStats(s.dose, Number(s.lines));
      const result = s.result;
      const resultHTML = result
        ? `<dl class="screen-stats"><div><dt>Chance of at least one target-gene allele</dt><dd>${(result.hitGene * 100).toFixed(3)}%</dd></div><div><dt>Expected lethal lines</dt><dd>${result.lethalLines.toFixed(1)}</dd></div><div><dt>Multiple-hit share among lethal lines</dt><dd>${(result.multiShare * 100).toFixed(1)}%</dd></div><div><dt>Maintenance vials</dt><dd>${result.vials.toLocaleString('en-GB')}</dd></div></dl>${checksHTML(screenChecks(s.dose, Number(s.lines), step.goal))}`
        : '';
      return {
        html: `<p>${esc(step.intro)}</p>${fly('w/w; mut/CyO; +/+', { chroms: ['2'], caption: 'One independent mutagenised chromosome maintained over CyO' })}<div class="research-controls"><label>Mutagenesis preset<select data-dose>${DOSES.map((d) => `<option value="${d.mM}" ${s.dose === d.mM ? 'selected' : ''}>${esc(d.label)}</option>`).join('')}</select></label><label>Independent lines<input type="number" min="1" step="1" data-lines value="${esc(s.lines)}"/></label></div><div class="tool-row"><button type="button" class="primary" data-screen-run>Evaluate screen plan</button>${s.tries && !s.done ? '<button type="button" data-screen-example>Show a feasible plan</button>' : ''}</div>${resultHTML}${result ? screenPlot(s.dose, Number(s.lines), step.goal) : ''}${s.invalid ? '<p class="feedback wrong" role="status">Enter a positive whole number of independent chromosome lines.</p>' : s.tries ? `<p class="feedback ${s.done ? 'right' : 'wrong'}" role="status">${esc(s.done ? step.explain : 'Check all three constraints. More independent chromosomes improve coverage, but cannot fix the fraction carrying multiple lethal hits at a given preset.')}</p>` : ''}`,
        wire(el) {
          el.querySelector('[data-dose]').addEventListener('change', (e) => {
            s.dose = Number(e.target.value);
            s.result = null;
            s.ran = false;
            s.done = false;
            render();
          });
          el.querySelector('[data-lines]').addEventListener('input', (e) => {
            s.lines = e.target.value;
            s.result = null;
            s.ran = false;
            s.done = false;
            s.invalid = false;
            el.querySelectorAll('.screen-stats, .screen-plot, .screen-comparison, .plot-key, .goal-checks, .feedback').forEach((node) =>
              node.remove(),
            );
            el.querySelector('[data-next], [data-finish]').disabled = true;
          });
          const run = () => {
            const n = Number(s.lines);
            s.invalid = !String(s.lines).trim() || !Number.isSafeInteger(n) || n < 1;
            s.tries = (s.tries || 0) + 1;
            s.ran = !s.invalid;
            s.result = s.invalid ? null : screenStats(s.dose, n);
            s.done = !s.invalid && screenChecks(s.dose, n, step.goal).every((c) => c.ok);
            render();
          };
          el.querySelector('[data-screen-run]').addEventListener('click', run);
          el.querySelector('[data-screen-example]')?.addEventListener('click', () => {
            const plan = DOSES.map((d) => ({
              dose: d.mM,
              n: Math.ceil(Math.log(1 - step.goal.minHit) / Math.log(1 - d.lambda * PER_GENE)),
            })).find((p) => screenChecks(p.dose, p.n, step.goal).every((c) => c.ok));
            s.assisted = true;
            s.dose = plan.dose;
            s.lines = String(plan.n);
            run();
          });
        },
      };
    },

    go(step) {
      return {
        html: `${paras(step.body)}<button type="button" class="primary big" data-go>${esc(step.action.label)}</button>`,
        ready: true,
        wire(el) {
          el.querySelector('[data-go]').addEventListener('click', () => {
            complete();
            onAction(step.action);
          });
        },
      };
    },
  };

  function finishHTML() {
    if (!lesson.diagnostic) return '';
    const right = diagnosticAnswers.filter(Boolean).length;
    const start = LESSONS.find((l) => l.id === recommendStart(diagnosticAnswers));
    return `<div class="result-card"><p><strong>${right} of ${lesson.steps.length}</strong> right first time.</p>
      <p>Suggested start: <strong>${esc(start.title)}</strong>. ${esc(start.summary)}</p>
      <button type="button" class="primary" data-start="${start.id}">Start ${esc(start.title)}</button></div>`;
  }

  function render() {
    stopVisual();
    const step = lesson.steps[index];
    const guideId = step.visual || id;
    const guideOpen = step.visual ? !['choice', 'multi', 'pick', 'go'].includes(step.type) : step.type === 'text';
    const guideState =
      state[0].visualGuides?.[guideId] || (guideId === id ? { frame: state[0].visualFrame, speed: state[0].visualSpeed } : {});
    const s = state[index];
    if (s.skipped) {
      s.skipped = false;
      s.done = false;
    }
    const out = RENDER[step.type](step, s);
    if (out.ready) s.done = true;
    const last = index === lesson.steps.length - 1;
    const heading = step.title || (step.type === 'choice' ? (lesson.diagnostic ? `Question ${index + 1}` : 'Check your thinking') : '');
    root.innerHTML = `<article class="lesson" data-step-type="${step.type}">
      <header class="lesson-head"><button type="button" class="link" data-exit>← Course</button>
        <div><span class="eyebrow">${esc(lesson.title)}</span><h2>${esc(heading)}</h2></div>
        <button type="button" class="link" data-restart>Restart lesson</button><ol class="dots" aria-label="Progress">${lesson.steps.map((_, i) => `<li class="${i === index ? 'now' : state[i].skipped ? 'skipped' : state[i].done ? 'done' : ''}" aria-current="${i === index ? 'step' : 'false'}"></li>`).join('')}</ol></header>
      ${
        lesson.curriculum
          ? `<details class="lesson-orientation" ${index === 0 ? 'open' : ''}><summary>${esc(lesson.curriculum.level)} · What you will learn</summary><button type="button" data-start-activity>Know the explanation? Start the activity</button><ul>${lesson.curriculum.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>${lesson.curriculum.prerequisites.length ? `<p>Useful preparation: ${lesson.curriculum.prerequisites.map((p) => `<button class="link" type="button" data-open="${p}">${esc(LESSONS.find((l) => l.id === p)?.title || p)}</button>`).join(' · ')}. Every lesson remains open.</p>` : ''}<dl class="lesson-glossary">${Object.entries(
              lesson.curriculum.terms,
            )
              .map(([term, meaning]) => `<div><dt>${esc(term)}</dt><dd>${esc(meaning)}</dd></div>`)
              .join('')}</dl></details><nav class="teaching-cycle" aria-label="Learning sequence">${Object.entries(TEACHING_STAGES)
              .map(([key, label]) => `<span aria-current="${step.stage === key ? 'step' : 'false'}">${esc(label)}</span>`)
              .join('')}</nav>`
          : ''
      }
      <div class="lesson-body">${['worked', 'mission'].includes(step.type) ? '' : visualGuideHTML(guideId, guideOpen)}${actionGuideHTML(step.type)}${lesson.curriculum && step.stage === 'guide' ? `<aside class="coaching"><strong>Work through it in this order</strong><ol>${lesson.curriculum.coach.map((c) => `<li>${esc(c)}</li>`).join('')}</ol></aside>` : ''}${state.some((x) => x.assisted) ? '<p class="support-status">Worked support used · this run is recorded as completed with support.</p>' : ''}${out.html}${last && s.done ? finishHTML() : ''}</div>
      ${lesson.model ? `<details class="support about lesson-model"><summary>About this model</summary>${paras(lesson.model)}</details>` : ''}
      <footer class="lesson-foot"><button type="button" data-back ${index === 0 ? 'disabled' : ''}>Back</button>
        <span class="secondary" data-step-status>${index + 1} / ${lesson.steps.length}${!s.done ? ` · ${STATUS[step.type] || 'check your answer'}` : ''}</span>
        ${
          last
            ? step.type === 'go'
              ? '<button type="button" data-finish>Back to course</button>'
              : `<button type="button" class="primary" data-finish ${s.done ? '' : 'disabled'}>Finish</button>`
            : `<button type="button" class="primary" data-next ${s.done ? '' : 'disabled'}>Next</button>`
        }</footer></article>`;
    const stepCleanup = out.wire?.(root);
    wireActionGuide(root);
    const saveGuide = (change) => {
      state[0].visualGuides ||= {};
      state[0].visualGuides[guideId] = { ...guideState, ...state[0].visualGuides[guideId], ...change };
      save();
    };
    if (['worked', 'mission'].includes(step.type)) stopVisual = stepCleanup || (() => {});
    else
      stopVisual = wireVisualGuide(root, guideId, {
        frame: guideState.frame,
        initialSpeed: guideState.speed,
        onFrame(frame) {
          saveGuide({ frame });
        },
        onSpeed(speed) {
          saveGuide({ speed });
        },
      });
    root.querySelectorAll('input, select, textarea').forEach((input) => {
      input.addEventListener('input', save);
      input.addEventListener('change', save);
    });
    root.querySelector('[data-restart]').addEventListener('click', () => {
      index = 0;
      state = lesson.steps.map(() => ({ done: false }));
      diagnosticAnswers = [];
      render();
      scrollToTop();
    });
    save();
    root.querySelector('[data-start-activity]')?.addEventListener('click', () => {
      const first = lesson.steps.findIndex((step) => ['guide', 'practise'].includes(step.stage));
      if (first < 0) return;
      for (let i = 0; i < first; i++) if (!state[i].done) Object.assign(state[i], { done: true, skipped: true });
      index = first;
      render();
      scrollToTop();
    });
    root.querySelector('[data-exit]').addEventListener('click', onExit);
    root.querySelector('[data-back]').addEventListener('click', () => {
      index--;
      render();
      scrollToTop();
    });
    root.querySelector('[data-next]')?.addEventListener('click', () => {
      index++;
      render();
      scrollToTop();
    });
    root.querySelector('[data-finish]')?.addEventListener('click', () => {
      if (state.every((x) => x.done)) complete();
      onExit();
    });
    root.querySelector('[data-start]')?.addEventListener('click', (e) => {
      progress.complete(id);
      onAction({ kind: 'lesson', id: e.currentTarget.dataset.start });
    });
  }

  render();
  return {
    rerender: render,
    destroy() {
      stopVisual();
    },
    get step() {
      return index;
    },
    goTo(i) {
      index = i;
      render();
    },
  };
}
