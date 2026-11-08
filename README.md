# Fly Trainer

An offline desktop trainer for Drosophila handling and genetics. The 3D microscope
is now the main application; the former V1 interface has been removed.

## Run

Double-click **Start Fly Trainer.bat** in this folder, or run:

```
npm install
npm start
```

The launcher installs dependencies on first use; subsequent runs work offline.

## The course

Fly Trainer opens on a **course hub**. Every lesson is open from the start; the hub
suggests the next one and records what is done. An optional three-minute quick check
suggests where to begin. A five-stage learning path runs from first contact through
foundations, stock construction, experimental design and integrated investigations.
All 17 taught modules expose learning goals, suggested prerequisites and a glossary.
Each of the 15 teaching modules follows **explain → demonstrate → guide → practise →
diagnose**; the two final investigations integrate those skills. Every module stays
open, and experienced learners can start directly at its activity. Suggested order:

| Section | Lesson | What the learner does |
|---|---|---|
| Handling flies | Meet the fly | Guided microscope tour: pick up a fly, zoom, turn it over, centre the sex combs, compare a female and a just-eclosed fly. Each step is checked from the real scope state; "Show me" does it for you. |
| | Reference bench | Five known flies to compare (practice, never assessed). |
| | From a vial to a reliable cross | Life cycle, generation identity, stock/source records, virginity evidence and parent removal. |
| | Virgin collection | The collection exercise below. |
| Inheritance | Start here: the language of genetics | Cells, chromosomes, genes, alleles, genotype, phenotype, dominance and gametes with no genetics assumed. |
| | Chromosomes and inheritance | Build gametes by clicking chromosomes, predict Curly ratios, discover CyO/CyO lethality (2/3 Curly). |
| | The X chromosome | Sperm and egg types, white-eye criss-cross inheritance, the reciprocal cross, what a white-eyed daughter means. Ends at the First cross. |
| | First cross | The bench cross below. |
| Building stocks | Read a fly stock and a cross | Translate slashes, semicolons, +, Y and chromosome names; distinguish records from inferred identity. |
| | Balancers | The three properties of a balancer, a true-breeding mut¹/CyO stock, crossing over in females only and its suppression by TM3, picking classes by markers. |
| | Cross planner | Six puzzles: cross vials, keep classes by their markers, declare the target stock. Par, hints on request. |
| Experiments and analysis | Counting and chance | Count vials of 20, 100 and 1000 and watch the scatter shrink; χ² test a Curly × Curly vial against 1:1, 2:1 and 3:1; why "not rejected" is not "proven". |
| | Recombination and mapping | Score 400 test-cross offspring by mini-white eye dosage and estimate the map distance; pick the recombinant class; plan screen sizes; verify recombinants. |
| | GAL4/UAS and controls | Driver × reporter; sorting GAL4 flies by the balancer marker; choose the controls a knockdown needs; sibling controls and their limits. |
| | Complementation and mapping | Run a complementation grid for three lethals, then map them against three overlapping deficiencies. |
| Research techniques | Three-point mapping | Identify parental and double-crossover X chromosomes, infer the middle marker, calculate both intervals and coincidence/interference from 2,000 sampled sons. |
| | FLP/FRT clones and twin spots | Induce chromosome exchanges in a growing model disc; plan a few large mutant patches or many small ones. |
| | GAL80ts: controlling time | Set stage-specific temperatures, inspect GAL4 and target-protein time courses, and meet developmental protection, knockdown and recovery windows. |
| | Planning a genetic screen | Balance target-gene coverage, multiple-lethal burden and independent-line capacity; see the maintenance-vial workload. |
| | Choose the genetic strategy | Forward/reverse genetics, reporter versus protein evidence, MARCM, maternal contribution and causal follow-up. |
| Research investigations | Do not lose the invisible chromosome | Diagnose an ambiguous intermediate and construct a two-generation stock preserving an unmarked lethal. |
| | Construct, verify and interpret | Build the three-generation research stock; choose validation, controls and timing; save an optional experimental argument for human review. |
| Open practice | Genetics bench | Build any two flies (dropdowns or stock presets), see gamete counts and offspring classes, count a vial with a χ² test, and drill generated practice problems (one or two chromosomes, with a streak). |

Lessons are step by step: explanations with chromosome diagrams, multiple choice with
an explanation for every option, a gamete builder (with a crossover switch that
explains why it does nothing in males or over a balancer), predict-then-reveal tables
with a Punnett square that marks lethal cells, and pick-the-class steps. The advanced
lessons add select-all-that-apply questions, estimates worked out from sampled counts,
a vial-counting simulator, a step-by-step χ² table, and complementation grids with a
deficiency map. Research steps add a three-point classification/calculation table,
an eight-disc clone experiment with replicate summaries, a temperature-schedule planner with assessed windows and thresholds,
and a screen planner with coverage curves and preset/workload comparisons. Mapping feedback separates parental, DCO and middle-locus decisions, highlights the changed allele and checks the chromosome rows counted in each interval. Each choice option explains its reasoning, and the research
lessons gather assumptions in an About this model panel. Changing a simulation
plan clears its old result and relocks Next until the new plan works. Next unlocks
once a step is worked through. Calculated inheritance and simulation answers come from the same pure models used
in demonstrations. Conceptual questions have authored chromosome-based explanations. A Diagram / Notation / Both switch controls how
genotypes are shown everywhere.

The planner never reveals genotypes: classes are described by markers and eye colour,
and a vial is checked only when the learner declares it the target. Feedback names the
uncertain chromosome ("Some flies in this vial are the target, but not all") rather
than the answer. Course progress and unfinished lesson steps, inputs and plans are saved locally;
notebooks are separate. Reopening an unfinished lesson resumes it; Restart lesson
starts again. Derived tissue and temperature arrays are regenerated from saved plans.
The hub distinguishes completion with worked support from independent fresh-case
mapping practice; neither is a claim of laboratory competence. Fresh mapping cases
vary phase and sampled counts while retaining the real locus order. Clones are
assessed across eight independent seeded discs, with at least four meeting the tissue
goal; the observed success fraction is a teaching sample, not a laboratory calibration.
The trusted six-fly collection uses `fly-trainer.collection.v3`; earlier collection
notebooks under v1/v2 keys are retained untouched. Cross notebooks remain v2.

### Animated visual lessons

All 17 taught modules include visual teaching. There are 24 guides with four
captioned stages each (96 scenes), including guides selected for individual beginner steps.
Chromosomes separate into gametes, parental segments exchange at crossovers,
GAL4 moves to a UAS-linked output, clone lineages expand and target protein
disappears after RNAi activation. Allele labels accompany colour cues throughout.
These are explicitly separate schematic teaching examples; the mapping animation
uses A–B–C rather than revealing the exercise's locus order.

Use **Play animation**, pause, the arrow buttons, the numbered stages or **Replay**.
Slow/normal/fast speed and the selected stage are saved with the unfinished lesson.
Guides open on explanation pages. Beginner teaching activities also open the relevant
concept guide; quiz guidance stays optional. Numbered activity
guides highlight the actual controls, tables or results without entering answers.
Animations start only when requested, stop when closed or left, and respect the
operating system's reduced-motion setting. Everything runs offline, with no video
downloads or external assets. Watching a guide does not complete an assessment.

Visual verification: `tools/review-visuals.js` runs in the isolated Electron snapshot
profile; it checks all 96 scenes, playback/pause/replay, saved position/speed,
notation changes and highlighting. The ordinary course walkthrough also checks
the activity-guide targets at each exercise step.

The beginner sequence zooms from fly to cell to all four chromosome pairs, then
distinguishes a chromosome, gene and allele. Dedicated guides cover Curly dominance,
fertilisation, independent assortment, lethal zygotes versus surviving adults,
X-linked copy number, egg/sperm types and reciprocal crosses. Male meiosis and
balancer transmission have their own guides so a female-crossover animation is
not reused for a step where it would be misleading. Stage and speed are saved
separately for each concept. `tools/review-beginners.js` checks the 17 specifically
assigned beginner steps, including that watching leaves gametes and predictions
for the learner to complete.

### Worked teaching and investigations

Fifteen full demonstrations show parents, gametes, combinations and conclusions,
or the corresponding statistical/experimental reasoning. Calculated examples use
actual genetics and research-model outputs. The Punnett demonstration shows each
inherited chromosome and distinguishes non-viable combinations from adult classes;
unequally weighted recombinant gametes use the full probability model instead.
Play/pause and individual stages let learners control the explanation. Watching a
demonstration never fills their next prediction or completes their construction.

Teaching bridges introduce new operations before asking for an answer. Guided
activities include a reasoning checklist; later practice removes that checklist.
Diagnostic cases ask what evidence would investigate a surprising result.
The two integrated missions retain the consequences of the learner's crosses and
class choices over generations. Their saved action histories rebuild the experiment
without storing a hidden-genotype answer key; target construction is checked again
on restore. Research notes remain saved after lesson completion and progress reset.

The expanded sequences invalidate incompatible unfinished lesson drafts and begin
those modules afresh; completed progress and existing lab notebooks are retained.
The [curriculum and evaluation guide](Documentation/Curriculum.md) describes scope,
learning evidence, reference alignment and the separate need for real-lab validation.

## Current activities

**Virgin collection:** inspect six flies from a Canton-S vial completely cleared at
09:00 and collected at 17:00 (25 °C). All six eclosed since that trusted clearing.
The youngest can have folded wings and meconium, while others have already darkened
and expanded their wings. These appearance cues cannot establish virginity or
identify a missed adult. Use the clearing record for virginity and anatomy for sex.
Flies land on their sides or backs at random. Collect at least two virgin females,
set uncertain flies aside, and declare the collection ready.
Feedback appears only after submission. Reopen the same batch
to correct mistakes or start a new batch. Collection decisions, predictions,
conclusions and action history are saved locally in the lab notebook, which can be
exported as text. Starting a new batch replaces that notebook; export it first if
needed. Pad positions and viewing angles reset when reopening an activity.

**First genetic cross:** a separate white-eyed maternal stock connects collection
to an experiment. Choose a documented or uncertain source-vial history, collect
candidate females, record an inheritance prediction, and add two verified red-eyed
Canton-S males. Advance to parent removal on day 2 and examination of an F1 sample
on day 12. Inspect twelve offspring in two groups of six, record eye colour and sex
(or Uncertain), and interpret the evidence before reviewing the observations.

With an uncertain vial, **Discard these flies and re-clear the vial** throws every
adult away and starts a fresh, fully documented batch at a cost of 8 hours: the
conservative choice a fly worker would usually make.

An extra white-eyed male or previously mated female can contribute unintended
paternity. The review explains what the offspring support without revealing an
individual mother's mating history. Absence of unexpected offspring is not proof
of virginity. Each mission has its own saved notebook; the original Canton-S
collection is preserved when starting a white-eye cross.

The **First cross** tab is always accessible; the collection review also links to
it. Under **Try another vial history**, start a new cross batch with the alternate
source record. New batches replace only their own mission notebook.

**Reference bench:** compare five known specimens: mature female, mature male,
just-eclosed female (unexpanded wings, meconium), pale female (meconium) and pale
male. Inspection notes describe what to look for.

The collection window is the standard one: females do not mate for about 8–10 hours
after eclosion at 25 °C (about 16 hours at 18 °C), per the [Berg lab introduction](https://depts.washington.edu/cberglab/wordpress/outreach/an-introduction-to-fruit-flies/1000/).
The exercises use 8 hours. Learner-facing caveats live in one **About this model**
panel rather than in the instructions.

## Controls

- Click a fly or its roster button to select it; drag with **Move** (G) to move it.
- Choose **Rotate** (R), then drag to roll it. Hold Shift while rotating to turn.
- **Back**, **Side**, **Underside**, roll buttons, Q/E and F provide inspection controls.
- Scroll or use the slider to zoom. Double-click a fly or use **Focus** to inspect it closely.
- Right-drag or drag an empty part of the pad to move the view. Escape gives an overview.
- Collect/set aside using the buttons, or drag a fly onto the corresponding destination.
- Select a transferred fly in the roster and use **Return to pad** to reconsider it.
- **Reset pad** restores positions/angles without changing collection decisions.

Field-guide cards, a separate worked example and optional supervisor reminders are
available in the left panel. No timing, injury or CO2 fertility penalties apply.

## Checks and previews

- `npm run check`: actual mesh builds plus collection, experiment, notebook, lesson, planner and progress tests.
- `npm run check:genetics`: verify the retained genetics engine's six cross puzzles.
- `npm run format` / `npm run format:check`: Prettier (settings in `.prettierrc.json`) for all JavaScript. Run it before committing, whichever assistant made the change.
- `npm run serve`: local browser preview at http://127.0.0.1:5180.
- `npm run snapshot`: hidden Electron snapshot, saved as `snapshot.png`.
- `npx electron . --snapshot=tmp/course.png --snapshot-js=tools/review-course.js`:
  plays every lesson, the quick check, a planner puzzle and the full guided tour through the real controls.
- `npx electron . --open=collection --snapshot=tmp/collection.png --snapshot-js=tools/review-collection.js`:
  renderer integration checks and exercise screenshot.
- `npx electron . --open=reference --snapshot=tmp/reference.png --snapshot-js=tools/review-scope.js`:
  reference selection, inspection and keyboard checks.
- `npx electron . --open=first-cross --snapshot=tmp/cross.png --snapshot-js=tools/review-cross.js`:
  documented/uncertain parent collections, event progression, F1 scoring and evidence review.
- `--open=<lesson id>` starts on that lesson instead of the hub (any run, not only snapshots).
- Add `--snapshot-size=1000x700` to inspect the minimum supported window size.

Snapshot runs use a separate profile under `tmp/snapshot-profile`, so tests do not
change a learner's saved notebook. Local storage is per browser/app profile; the
browser preview and desktop app do not share notebooks.

## Code map

```
main.cjs                  Electron shell and hidden snapshot support
src/js/desk.js             Course hub and router (opens lessons, planner, tour, microscope)
src/js/course.js           Lesson catalogue, suggested order and saved progress
src/js/lessons.js          Lesson content and engine helpers (gametes, classes, Punnett squares,
                           GAL4/UAS expression, seeded sampling, chi-square, complementation)
src/js/sandboxLogic.js     Genetics bench and practice-problem logic (no DOM)
src/js/sandbox.js          Genetics bench UI
src/js/lessonPlayer.js     Interactive lesson steps
src/js/chromosomes.js      Chromosome-bar diagrams and notation
src/js/plannerSession.js   Cross-planner state (no DOM; tested in node)
src/js/planner.js          Cross-planner UI
src/js/tour.js             "Meet the fly" guided microscope tour
src/js/scope.js            Microscope, activity UI, transfers and notebook presentation
src/js/research.js         Pure models used by research-technique lessons
src/js/collection.js       Collection session, private biological state and assessment
src/js/experiment.js       White-eye cross, explicit mating history, event time and F1 assessment
src/js/flyModel.js         Fly assembly, sex/developmental variants and materials
src/js/legs.js             Leg assembly and posing
src/js/genetics/           Genetics engine used by the cross mission, plus retained puzzles
assets/fly/               Converted anatomy meshes
tools/                    Model tools and checks
Documentation/            Teaching references and agreed Trainer Specification
```

The 3D cross mission, the lessons and the cross planner all use the shared genetics engine. A local V1 source recovery archive is in
`tmp/migration/v1-source.zip`; it is outside the active app and excluded from Git.

The project is under Git (local repository, branch `main`). Commit before handing the
folder between assistants or people so every change can be reviewed and undone.

## Model provenance and limitations

Genetics simplifications used by the lessons: GAL4/UAS expression is all-or-none
(no temperature, tissue pattern, leakiness or knockdown efficiency); recombination
between GAL4 and UAS-RNAi is a fixed 30% with no double-crossover correction;
the deficiency map is a teaching example (genes a–d on chromosome 2), not real
Df(2L) breakpoints; sampled counts are reproducible (seeded) in lessons and random
on the bench.

The anatomy meshes derive from the Hidalgo lab (University of Birmingham) external
anatomy model via MICRA. The existing project provenance requires checking the
source licence before distributing these derived assets outside the lab.

Male anatomy is a first-pass adaptation of the female-derived source: shorter
abdomen, posterior pigmentation and sex combs on both forelegs. Detailed male
terminalia have not been reconstructed. Young flies come in two stages: `teneral`
(under an hour old: palest, with the printed wing shrunk and crumpled into an
unexpanded pad) and `fresh` (wings expanded, still pale). A dark meconium is painted
through the ventral and lateral abdomen for the first 5 hours. These timings are
simplified teaching values. Mating history is maintained separately from outward
appearance.

The cross samples twelve adults rather than enforcing an exact 1:1 ratio.
Development follows fixed teaching events; fertility is idealised. Paternity: a
virgin female mates once during the two days, with a male drawn from those present
(two red-eyed testers plus any white-eyed males collected by mistake). A previously
mated female is usually still unreceptive, so she remates with probability 0.3; if
she does, the new male sires 0.8 of her later offspring, following the usual
last-male sperm precedence benchmark ([Laturney et al. 2018](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6121866/)).
These are illustrative teaching values, not lab predictions.
No females yields no progeny in this model, while the review acknowledges other
possible causes in real work. Only known X-linked white inheritance is represented
in this mission; other pigment mutations, nondisjunction and parthenogenesis are
outside its scope.

Background references: [FlyBase white gene report](https://flybase.org/reports/FBgn0003996.htm)
and [Berg lab guidance on sperm storage and virgin collection](https://depts.washington.edu/cberglab/wordpress/outreach/an-introduction-to-fruit-flies/1000/).

Research lessons reuse `research.js`: no new stock genotypes or chromosomes were
invented in the core genetics catalogue. Three-point estimates come from the
sampled counts; the reference recombination fractions are not accepted as the
sampled answer. Clone induction and GAL80ts kinetics are schematic, and screen
presets and per-gene rates are model assumptions rather than laboratory advice.
The existing GAL4/UAS stock-building model remains all-or-none; the TARGET lesson
uses its own temporal RNAi model.

Background for the chromosome mechanisms: [Mosaic Analysis in Drosophila (FlyBook)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5788516/)
and [McGuire et al., TARGET](https://pubmed.ncbi.nlm.nih.gov/14657498/).

Calendar management and individual verification/test-cross follow-ups remain
subsequent stages.

Biology corrections (8 November 2026): Drosophila Y chromosomes support male fertility,
not sex determination ([primary study](https://pmc.ncbi.nlm.nih.gov/articles/PMC2516102/)).
The appearance model allows wings to expand and adults to darken during the virgin
collection interval; appearance cannot establish mating history. Timings are
illustrative ([FlyBase-hosted teaching guide](https://flybase.org/flybase/associated_files/Experiments_with_Drosophila_for_Biology_Courses.pdf)).
