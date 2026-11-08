import { CollectionSession, makePopulation, RESTS } from './collection.js';
import { parseGenotype, offspring, phenotype } from './genetics/genetics.js';

export const CROSS_SCENARIOS = Object.freeze({
  documented: {
    title: 'Documented collection',
    clearing: 'Cleared at 09:00, all adults removed. Collected at 17:00, 25 °C.',
    evidence: 'Every fly is under 8 hours old: the females are virgins. Identify them by anatomy.',
  },
  uncertain: {
    title: 'Uncertain vial history',
    clearing: 'A morning clearing was noted, but nobody recorded when or whether it was complete. Collected at 17:00, 25 °C.',
    evidence: 'These females could be older than 8 hours, and appearance cannot show whether they have mated.',
  },
});
// After the learner discards everything and clears the vial themselves.
export const RECLEARED_SOURCE = Object.freeze({
  title: 'Re-cleared vial',
  clearing: 'You discarded every adult and cleared the vial yourself; collected 8 hours later at 25 °C.',
  evidence: 'Your own complete clearing: every female here is a virgin. Identify them by anatomy.',
});
export const RECLEAR_DELAY_HOURS = 8;

// Paternity model. A virgin female mates once in the 2 days with the males;
// her mate is drawn from the males present. A previously mated female is
// usually still unreceptive (sex peptide), so she remates with probability
// REMATING_PROBABILITY; if she does, the new male sires LAST_MALE_SHARE of her
// later offspring (last-male sperm precedence, P2 about 0.8). Illustrative
// teaching values, documented in README and the About panel.
export const REMATING_PROBABILITY = 0.3;
export const LAST_MALE_SHARE = 0.8;
const TESTER_MALES = 2;
export const SCORE_CLASSES = Object.freeze({
  'red-F': 'Red-eyed female',
  'white-F': 'White-eyed female',
  'red-M': 'Red-eyed male',
  'white-M': 'White-eyed male',
  uncertain: 'Uncertain',
});
export const CROSS_PREDICTIONS = Object.freeze({
  expected: 'Red-eyed daughters; white-eyed sons',
  red: 'All red-eyed',
  white: 'All white-eyed',
  unknown: 'Not sure yet',
});
export const CROSS_INTERPRETATIONS = Object.freeze({
  consistent: 'Consistent with the intended cross; virginity is not proven',
  unintended: 'Unexpected daughters suggest an unintended white-eyed father',
  none: 'No progeny: review parent selection and other possible causes',
  unknown: 'I need more evidence',
});

function randomFor(seed) {
  let state = (seed ^ 0x45d9f3b) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
function sample(distribution, random) {
  let p = random();
  for (const item of distribution) {
    p -= item.p;
    if (p < 0) return item.g;
  }
  return distribution.at(-1).g;
}
const MOTHER = parseGenotype('w/w; +/+; +/+');
const TESTER = parseGenotype('+/Y; +/+; +/+');
const RESIDENT = parseGenotype('w/Y; +/+; +/+');
const INTENDED = offspring(MOTHER, TESTER).progeny;
const UNINTENDED = offspring(MOTHER, RESIDENT).progeny;

export class CrossSession {
  #collection;
  #scenario;
  #phase = 'collecting';
  #day = 0;
  #prediction = 'unknown';
  #interpretation = 'unknown';
  #scores = {};
  #offspring = [];
  #report = null;
  #seed;
  #recleared = false;
  constructor({ seed = Math.floor(Math.random() * 4294967296), scenario = 'documented', saved = null } = {}) {
    if (saved) {
      if (
        saved.version !== 2 ||
        !CROSS_SCENARIOS[saved.scenario] ||
        !['collecting', 'developing', 'scoring', 'review'].includes(saved.phase)
      )
        throw new Error('Unsupported experiment notebook');
      seed = saved.seed;
      scenario = saved.scenario;
      this.#recleared = saved.recleared === true && scenario === 'uncertain';
    }
    this.#seed = seed >>> 0;
    this.#scenario = scenario;
    if (!CROSS_SCENARIOS[scenario]) throw new Error('Unknown source-vial scenario');
    this.#collection = this.#newCollection(saved?.collection || null, 'Opened white-eyed stock parent collection for the first cross.');
    if (saved) {
      if (this.#collection.snapshot().submitted) throw new Error('Invalid experiment collection');
      if (!CROSS_PREDICTIONS[saved.prediction] || !CROSS_INTERPRETATIONS[saved.interpretation])
        throw new Error('Invalid saved interpretation');
      if (
        (saved.phase === 'collecting' && saved.day !== 0) ||
        (saved.phase === 'developing' && ![0, 2].includes(saved.day)) ||
        (['scoring', 'review'].includes(saved.phase) && saved.day !== 12)
      )
        throw new Error('Invalid experiment time');
      this.#phase = saved.phase;
      this.#day = saved.day;
      this.#prediction = saved.prediction;
      this.#interpretation = saved.interpretation;
      if (this.#phase !== 'collecting') {
        if (!this.#selected().length) throw new Error('Experiment has no selected parents');
        this.#offspring = this.#makeOffspring();
      }
      for (const [id, score] of Object.entries(saved.scores || {})) {
        if (!SCORE_CLASSES[score] || !this.#offspring.some((f) => f.id === id)) throw new Error('Invalid saved offspring score');
        this.#scores[id] = score;
      }
      if (this.#phase === 'review') {
        if (this.#offspring.some((f) => !this.#scores[f.id])) throw new Error('Incomplete saved evidence review');
        this.#report = this.#assess();
      }
    } else this.log('mission', null, `Opened first cross: white-eyed stock; ${CROSS_SCENARIOS[scenario].title.toLowerCase()}.`);
  }
  // The parents' vial: a re-clear starts a fresh, fully documented batch.
  #batchSeed() {
    return this.#recleared ? (this.#seed ^ 0x5bd1e995) >>> 0 : this.#seed;
  }
  #uncertain() {
    return this.#scenario === 'uncertain' && !this.#recleared;
  }
  #newCollection(saved, startDetail) {
    const seed = this.#batchSeed();
    return new CollectionSession({ seed, saved, startDetail, population: makePopulation(seed, { holdover: false }) });
  }
  #parents() {
    let female = 0;
    const uncertain = this.#uncertain();
    return makePopulation(this.#batchSeed(), { holdover: false }).map((f) => {
      // Mixed histories deliberately have no visual marker: every fly in an
      // uncertain vial looks mature, whether or not she has mated.
      const mated = uncertain && f.sex === 'F' && female++ % 2 === 0;
      return {
        ...f,
        eye: 'white',
        ...(uncertain ? { stage: 'mature', meconium: false, ageMinutes: 2880 + f.ageMinutes } : {}),
        matingHistory: f.sex === 'F' ? (mated ? 'previous-white-male' : 'unmated') : null,
      };
    });
  }
  #selected() {
    const ids = this.#collection
      .snapshot()
      .flies.filter((f) => f.destination === 'collection')
      .map((f) => f.id);
    return this.#parents().filter((f) => ids.includes(f.id));
  }
  get appearance() {
    return this.#parents().map(({ matingHistory, ageMinutes, holdover, ...f }) => f);
  }
  specimens(page = 0) {
    if (this.#phase === 'collecting') return this.appearance;
    if (this.#phase === 'developing') return [];
    return this.#offspring
      .slice(page * 6, page * 6 + 6)
      .map(({ g, ...f }, index) => ({ ...f, x: ((index % 3) - 1) * 3.05, z: (index < 3 ? -1 : 1) * 1.85 }));
  }
  /** Share of each mother's offspring sired by a white-eyed male, decided once per mother. */
  #whiteShare(mother, whiteMales, random) {
    const mateIsWhite = () => random() < whiteMales / (whiteMales + TESTER_MALES);
    if (mother.matingHistory === 'unmated') return mateIsWhite() ? 1 : 0;
    // Stored sperm from an earlier white-eyed mate.
    if (random() >= REMATING_PROBABILITY) return 1;
    return mateIsWhite() ? 1 : 1 - LAST_MALE_SHARE;
  }
  #makeOffspring() {
    const parents = this.#selected(),
      females = parents.filter((f) => f.sex === 'F');
    if (!females.length) return [];
    const whiteMales = parents.filter((f) => f.sex === 'M').length;
    const random = randomFor(this.#batchSeed());
    const shares = females.map((mother) => this.#whiteShare(mother, whiteMales, random));
    const result = [];
    for (let i = 0; i < 12; i++) {
      const m = Math.floor(random() * females.length);
      const g = sample(random() < shares.at(m) ? UNINTENDED : INTENDED, random);
      const ph = phenotype(g);
      result.push({
        id: `f1-${i + 1}`,
        label: `F1 ${String(i + 1).padStart(2, '0')}`,
        sex: ph.sex,
        eye: ph.eye,
        stage: 'mature',
        meconium: false,
        heading: random() * Math.PI * 2,
        rest: RESTS.at(Math.floor(random() * RESTS.length)),
        g,
      });
    }
    return result;
  }
  /** Discard every adult in an uncertain vial and clear it yourself; costs a collection interval. */
  reclear() {
    if (this.#phase !== 'collecting' || !this.#uncertain())
      throw new Error('Only an uncertain vial can be re-cleared before the cross is set up.');
    const events = this.#collection.snapshot().events;
    this.#recleared = true;
    this.#collection = this.#newCollection(
      null,
      `Discarded all adults from the uncertain vial and re-cleared it; collected again ${RECLEAR_DELAY_HOURS} hours later.`,
    );
    // Keep the earlier history in the notebook ahead of the new batch.
    this.#collection.restoreHistory(events);
  }
  log(action, id, detail) {
    this.#collection.log(action, id, detail);
  }
  move(id, destination) {
    if (this.#phase !== 'collecting') throw new Error('Parents are committed to this cross. Start a new experiment to change them.');
    this.#collection.move(id, destination);
  }
  setNote(field, value) {
    this.#collection.setNote(field, value);
  }
  setPrediction(value) {
    if (this.#phase !== 'collecting' || !CROSS_PREDICTIONS[value]) throw new Error('Prediction is locked once the cross is set up.');
    this.#prediction = value;
  }
  setInterpretation(value) {
    if (this.#phase !== 'scoring' || !CROSS_INTERPRETATIONS[value]) throw new Error('Interpretation is not editable at this stage.');
    this.#interpretation = value;
  }
  start() {
    if (this.#phase !== 'collecting' || !this.#selected().length)
      throw new Error('Collect at least one candidate parent before setting up the cross.');
    this.#offspring = this.#makeOffspring();
    this.#phase = 'developing';
    this.log(
      'cross',
      null,
      `Day 0: committed ${this.#selected().length} selected flies; added two verified Canton-S males. Prediction: ${CROSS_PREDICTIONS[this.#prediction]}.`,
    );
  }
  advance() {
    if (this.#phase !== 'developing') throw new Error('No pending development event');
    if (this.#day === 0) {
      this.#day = 2;
      this.log('time', null, 'Day 2: all parents removed after egg laying, preventing parents from being counted with F1 adults.');
    } else {
      this.#day = 12;
      this.#phase = 'scoring';
      this.log(
        'time',
        null,
        `Day 12: inspected ${this.#offspring.length ? 'a sample of twelve F1 adults' : 'the vial; no F1 adults found'}.`,
      );
    }
  }
  score(id, category) {
    if (this.#phase !== 'scoring' || !this.#offspring.some((f) => f.id === id) || !SCORE_CLASSES[category])
      throw new Error('Invalid offspring observation');
    this.#scores[id] = category;
    this.log('score', id, `${this.#offspring.find((f) => f.id === id).label}: recorded ${SCORE_CLASSES[category].toLowerCase()}.`);
  }
  #assess() {
    const counts = Object.fromEntries(
      Object.keys(SCORE_CLASSES)
        .filter((key) => key !== 'uncertain')
        .map((key) => [key, 0]),
    );
    let correct = 0,
      uncertain = 0;
    const rows = this.#offspring.map((f) => {
      const actual = `${f.eye}-${f.sex}`;
      counts[actual]++;
      if (this.#scores[f.id] === actual) correct++;
      if (this.#scores[f.id] === 'uncertain') uncertain++;
      return { id: f.id, label: f.label, observed: this.#scores[f.id] || null, actual, correct: this.#scores[f.id] === actual };
    });
    const conclusion = !rows.length ? 'none' : counts['white-F'] ? 'unintended' : 'consistent';
    return {
      counts,
      rows,
      correct,
      uncertain,
      total: rows.length,
      interpretation: this.#interpretation,
      interpretationSupported: this.#interpretation === conclusion,
      predictionCorrect: this.#prediction === 'expected',
      conclusion,
      explanation:
        conclusion === 'none'
          ? 'No offspring were observed. Recheck that females were included. In real work, infertility or husbandry can also cause an empty vial; absence of progeny alone does not identify the cause.'
          : conclusion === 'unintended'
            ? 'White-eyed daughters are not expected from the recorded w/w females and +/Y tester males. They indicate a white-eyed father in this simplified stock system. A previously mated female or an extra white-eyed male can both explain this; offspring alone cannot distinguish those causes.'
            : 'The observed sample is consistent with the intended cross: red-eyed daughters and white-eyed sons. A small sample without unexpected daughters does not prove every mother was virgin.',
      limitations: 'Twelve offspring vary by chance. The assumptions behind this cross are under About this model.',
    };
  }
  submit() {
    if (this.#phase === 'review') return structuredClone(this.#report);
    if (this.#phase !== 'scoring' || this.#offspring.some((f) => !this.#scores[f.id]))
      throw new Error('Record each offspring observation, using Uncertain where needed.');
    this.#report = this.#assess();
    this.#phase = 'review';
    this.log('diagnosis', null, `Recorded interpretation: ${CROSS_INTERPRETATIONS[this.#interpretation]}.`);
    return structuredClone(this.#report);
  }
  retryScoring() {
    if (this.#phase !== 'review') throw new Error('No review to reopen');
    this.#phase = 'scoring';
    this.#report = null;
    this.log('retry', null, 'Reopened F1 observations; original parent choices retained.');
  }
  snapshot() {
    const base = this.#collection.snapshot();
    return {
      ...base,
      scenario: this.#scenario,
      recleared: this.#recleared,
      canReclear: this.#phase === 'collecting' && this.#uncertain(),
      delayHours: this.#recleared ? RECLEAR_DELAY_HOURS : 0,
      source: { ...(this.#recleared ? RECLEARED_SOURCE : CROSS_SCENARIOS[this.#scenario]) },
      phase: this.#phase,
      day: this.#day,
      submitted: this.#phase !== 'collecting',
      report: this.#report ? structuredClone(this.#report) : null,
      prediction: this.#prediction,
      interpretation: this.#interpretation,
      scores: { ...this.#scores },
      scored: Object.keys(this.#scores).length,
      // No results, parent sex, mating history, or offspring count before eclosion.
      offspringCount: ['scoring', 'review'].includes(this.#phase) ? this.#offspring.length : null,
    };
  }
  serialize() {
    return {
      version: 2,
      seed: this.#seed,
      recleared: this.#recleared,
      scenario: this.#scenario,
      phase: this.#phase,
      day: this.#day,
      prediction: this.#prediction,
      interpretation: this.#interpretation,
      scores: { ...this.#scores },
      collection: this.#collection.serialize(),
    };
  }
}
