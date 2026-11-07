// Collection decisions and biological state, independent of the renderer.
// Public snapshots contain observations/decisions; no biological answer key.
export const SOURCE_RECORD = Object.freeze({
  stock: 'Canton-S',
  clearedAt: '09:00',
  collectedAt: '11:00',
  temperature: '25 °C',
  clearing: 'All adults removed; food and vial walls checked.',
  evidence: 'This teaching batch uses a two-hour collection interval after a complete clearing. Female flies in this batch can be collected as virgins. Identify their sex; pale colour alone is insufficient.',
  target: 2,
});

function generator(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function makePopulation(seed) {
  const random = generator(seed);
  const sexes = ['F', 'F', 'F', 'M', 'M', 'M'];
  for (let i = sexes.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [sexes[i], sexes[j]] = [sexes[j], sexes[i]];
  }
  return sexes.map((sex, i) => ({
    id: `fly-${i + 1}`, label: `Fly ${String.fromCharCode(65 + i)}`,
    sex, stage: 'fresh',
    // Actual mating history is explicit, not calculated from pigmentation/age.
    matingHistory: sex === 'F' ? 'unmated' : null,
    ageMinutes: 20 + Math.floor(random() * 100),
    x: (i % 3 - 1) * 3.05,
    z: (i < 3 ? -1 : 1) * 1.85,
    heading: random() * Math.PI * 2,
  }));
}

const DESTINATIONS = ['pad', 'collection', 'rejected'];
export class CollectionSession {
  #population;
  #destinations;
  #events = [];
  #notes = { prediction: '', conclusion: '' };
  #submitted = false;
  #report = null;
  constructor({ seed = Math.floor(Math.random() * 4294967296), saved = null, now = () => new Date().toISOString(), startDetail = 'Opened the two-hour virgin-collection exercise.' } = {}) {
    this.seed = seed >>> 0;
    this.now = now;
    this.#population = makePopulation(this.seed);
    this.#destinations = Object.fromEntries(this.#population.map((f) => [f.id, 'pad']));
    if (saved) this.#restore(saved);
    else this.log('start', null, startDetail);
  }
  #restore(saved) {
    if (saved.version !== 1 || saved.seed !== this.seed) throw new Error('Unsupported notebook');
    for (const fly of this.#population) {
      const destination = saved.destinations?.[fly.id];
      if (!DESTINATIONS.includes(destination)) throw new Error('Invalid saved destination');
      this.#destinations[fly.id] = destination;
    }
    for (const field of ['prediction', 'conclusion']) {
      if (typeof saved.notes?.[field] === 'string') this.#notes[field] = saved.notes[field].slice(0, 5000);
    }
    this.#events = Array.isArray(saved.events) ? saved.events.filter((e) => e && typeof e.action === 'string' && typeof e.detail === 'string' && typeof e.at === 'string').slice(-200) : [];
    // Recompute any review from decisions; never trust a stored success flag.
    if (saved.submitted === true) { this.#submitted = true; this.#report = this.#assess(); }
  }
  get appearance() {
    return this.#population.map(({ matingHistory, ageMinutes, ...fly }) => ({ ...fly }));
  }
  snapshot() {
    return {
      seed: this.seed,
      flies: this.#population.map(({ id, label }) => ({ id, label, destination: this.#destinations[id] })),
      notes: { ...this.#notes }, events: this.#events.map((e) => ({ ...e })),
      submitted: this.#submitted,
      report: this.#report ? structuredClone(this.#report) : null,
    };
  }
  serialize() {
    return { version: 1, seed: this.seed, destinations: { ...this.#destinations }, notes: { ...this.#notes }, events: this.#events.map((e) => ({ ...e })), submitted: this.#submitted };
  }
  log(action, id = null, detail = '') {
    if (this.#submitted) return;
    this.#events.push({ at: this.now(), action, id, detail });
    this.#events = this.#events.slice(-200);
  }
  move(id, destination) {
    if (this.#submitted) throw new Error('Review the submitted collection or retry before changing it.');
    const fly = this.#population.find((f) => f.id === id);
    if (!fly || !DESTINATIONS.includes(destination)) throw new Error('Invalid collection decision');
    if (this.#destinations[id] === destination) return;
    this.#destinations[id] = destination;
    const description = { pad: 'Returned to the pad', collection: 'Moved to the collection vial', rejected: 'Set aside for reconsideration' }[destination];
    this.log('transfer', id, `${fly.label}: ${description.toLowerCase()}.`);
  }
  setNote(field, value) {
    if (!['prediction', 'conclusion'].includes(field) || typeof value !== 'string') throw new Error('Invalid note');
    this.#notes[field] = value.slice(0, 5000);
  }
  #assess() {
    const collected = this.#population.filter((f) => this.#destinations[f.id] === 'collection');
    const females = collected.filter((f) => f.sex === 'F' && f.matingHistory === 'unmated').length;
    const errors = collected.length - females;
    return {
      success: females >= SOURCE_RECORD.target && errors === 0,
      females, errors, collected: collected.length,
      rows: collected.map((f) => ({ id: f.id, label: f.label, correct: f.sex === 'F',
        reason: f.sex === 'F'
          ? 'Female: no foreleg sex combs. The documented clearing and short collection interval support virgin collection in this batch.'
          : 'Male: sex combs on the first tarsal segment of the forelegs. Pale male pigmentation can make the abdomen misleading.' })),
    };
  }
  submit() {
    if (!this.#submitted) {
      this.log('submit', null, 'Declared the collection ready for review.');
      this.#report = this.#assess();
      this.#submitted = true;
    }
    return structuredClone(this.#report);
  }
  retry() {
    this.#submitted = false;
    this.#report = null;
    this.log('retry', null, 'Reopened the same collection for another attempt.');
  }
}
