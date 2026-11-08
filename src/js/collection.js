// Collection decisions and biological state, independent of the renderer.
// Public snapshots contain observations/decisions; no biological answer key.

// Standard virgin window: females do not mate for about 8-10 h after eclosion
// at 25 °C, so collecting 8 h after a complete clearing is the usual practice.
export const VIRGIN_WINDOW_MINUTES = 480;
export const SOURCE_RECORD = Object.freeze({
  stock: 'Canton-S',
  clearedAt: '09:00',
  collectedAt: '17:00',
  temperature: '25 °C',
  clearing: 'All adults removed at 09:00.',
  evidence:
    'Every fly that eclosed since the clearing is under 8 hours old, so its females are virgins. Adults can darken within this interval. Appearance cannot establish virginity; use the trusted clearing record.',
  target: 2,
});

// Appearance follows age since eclosion (modelled values for this teaching batch):
// wings expand within the first hour, and the meconium stays visible for a few hours.
export const WING_EXPANSION_MINUTES = 60;
export const MECONIUM_MINUTES = 180;
export const PIGMENTATION_MINUTES = 180;
export function appearanceForAge(ageMinutes) {
  if (ageMinutes >= PIGMENTATION_MINUTES) return { stage: 'mature', meconium: false };
  return { stage: ageMinutes < WING_EXPANSION_MINUTES ? 'teneral' : 'fresh', meconium: ageMinutes < MECONIUM_MINUTES };
}

// Knocked-out flies land in different ways; resting pose is random and says
// nothing about the fly.
export const RESTS = ['left', 'right', 'back'];

function generator(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pad layout: a row of four above a row of three (or two rows of three).
function layout(count) {
  const rows = count > 6 ? [4, count - 4] : [3, count - 3];
  return rows.flatMap((n, r) =>
    Array.from({ length: n }, (_, i) => ({ x: (i - (n - 1) / 2) * (n > 3 ? 2.7 : 3.05), z: (r ? 1 : -1) * 1.85 })),
  );
}

/**
 * Six flies that eclosed after the clearing (three of each sex, ages spread over
 * the 8-hour window). An optional holdover is reserved for explicit custom scenarios.
 * The holdover's mating history is unknown to the learner and may be either.
 */
export function makePopulation(seed, { holdover = false } = {}) {
  const random = generator(seed);
  const flies = ['F', 'F', 'F', 'M', 'M', 'M'].map((sex) => {
    const ageMinutes = Math.floor(random() * VIRGIN_WINDOW_MINUTES);
    return { sex, ageMinutes, matingHistory: sex === 'F' ? 'unmated' : null, holdover: false };
  });
  if (holdover) {
    const sex = random() < 0.5 ? 'F' : 'M';
    const mated = random() < 0.75;
    flies.push({
      sex,
      ageMinutes: 2880 + Math.floor(random() * 2880),
      matingHistory: sex === 'F' ? (mated ? 'mated' : 'unmated') : null,
      holdover: true,
    });
  }
  for (let i = flies.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [flies[i], flies[j]] = [flies[j], flies[i]];
  }
  const spots = layout(flies.length);
  return flies.map((fly, i) => ({
    id: `fly-${i + 1}`,
    label: `Fly ${String.fromCharCode(65 + i)}`,
    ...fly,
    ...appearanceForAge(fly.ageMinutes),
    ...spots.at(i),
    heading: random() * Math.PI * 2,
    rest: RESTS.at(Math.floor(random() * RESTS.length)),
  }));
}

const DESTINATIONS = ['pad', 'collection', 'rejected'];
export const NOTEBOOK_VERSION = 2;
export class CollectionSession {
  #population;
  #destinations;
  #events = [];
  #notes = { prediction: '', conclusion: '' };
  #submitted = false;
  #report = null;
  constructor({
    seed = Math.floor(Math.random() * 4294967296),
    saved = null,
    now = () => new Date().toISOString(),
    startDetail = 'Opened the virgin-collection exercise.',
    population = null,
  } = {}) {
    this.seed = seed >>> 0;
    this.now = now;
    this.#population = population || makePopulation(this.seed);
    this.#destinations = Object.fromEntries(this.#population.map((f) => [f.id, 'pad']));
    if (saved) this.#restore(saved);
    else this.log('start', null, startDetail);
  }
  #restore(saved) {
    if (saved.version !== NOTEBOOK_VERSION || saved.seed !== this.seed) throw new Error('Unsupported notebook');
    for (const fly of this.#population) {
      const destination = saved.destinations?.[fly.id];
      if (!DESTINATIONS.includes(destination)) throw new Error('Invalid saved destination');
      this.#destinations[fly.id] = destination;
    }
    for (const field of ['prediction', 'conclusion']) {
      if (typeof saved.notes?.[field] === 'string') this.#notes[field] = saved.notes[field].slice(0, 5000);
    }
    this.#events = Array.isArray(saved.events)
      ? saved.events
          .filter((e) => e && typeof e.action === 'string' && typeof e.detail === 'string' && typeof e.at === 'string')
          .slice(-200)
      : [];
    // Recompute any review from decisions; never trust a stored success flag.
    if (saved.submitted === true) {
      this.#submitted = true;
      this.#report = this.#assess();
    }
  }
  get appearance() {
    // What a learner could see: no mating history, exact age or holdover flag.
    return this.#population.map(({ matingHistory, ageMinutes, holdover, ...fly }) => ({ ...fly }));
  }
  snapshot() {
    return {
      seed: this.seed,
      flies: this.#population.map(({ id, label }) => ({ id, label, destination: this.#destinations[id] })),
      notes: { ...this.#notes },
      events: this.#events.map((e) => ({ ...e })),
      submitted: this.#submitted,
      report: this.#report ? structuredClone(this.#report) : null,
    };
  }
  serialize() {
    return {
      version: NOTEBOOK_VERSION,
      seed: this.seed,
      destinations: { ...this.#destinations },
      notes: { ...this.#notes },
      events: this.#events.map((e) => ({ ...e })),
      submitted: this.#submitted,
    };
  }
  /** Put earlier notebook entries (e.g. from a discarded batch) ahead of this one's. */
  restoreHistory(events) {
    const earlier = events.filter((e) => e && typeof e.action === 'string' && typeof e.detail === 'string' && typeof e.at === 'string');
    this.#events = [...earlier, ...this.#events].slice(-200);
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
    const description = {
      pad: 'Returned to the pad',
      collection: 'Moved to the collection vial',
      rejected: 'Set aside for reconsideration',
    }[destination];
    this.log('transfer', id, `${fly.label}: ${description.toLowerCase()}.`);
  }
  setNote(field, value) {
    if (!['prediction', 'conclusion'].includes(field) || typeof value !== 'string') throw new Error('Invalid note');
    this.#notes[field] = value.slice(0, 5000);
  }
  #reason(f) {
    if (f.holdover)
      return 'The source history does not establish this fly as a virgin. Colour and expanded wings cannot establish age or mating history.';
    if (f.sex === 'M')
      return 'Male: sex combs on the first tarsal segment of the forelegs. Pale young males can look female from the abdomen alone.';
    return 'Female: no foreleg sex combs. The trusted clearing record supports collecting her as a virgin, whether she is pale or already darkened. Body colour, expanded wings and absence of meconium do not prove mating history.';
  }
  #assess() {
    const collected = this.#population.filter((f) => this.#destinations[f.id] === 'collection');
    // Eligible = a female whose age fits the record. A holdover female counts as an
    // error whatever her actual history: the evidence does not support collecting her.
    const eligible = (f) => f.sex === 'F' && !f.holdover && f.matingHistory === 'unmated';
    const females = collected.filter(eligible).length;
    const errors = collected.length - females;
    return {
      success: females >= SOURCE_RECORD.target && errors === 0,
      females,
      errors,
      collected: collected.length,
      rows: collected.map((f) => ({ id: f.id, label: f.label, correct: eligible(f), reason: this.#reason(f) })),
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
