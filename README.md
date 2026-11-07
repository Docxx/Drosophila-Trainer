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

## Current activities

**Virgin collection:** inspect seven flies from a Canton-S vial cleared at 09:00 and
collected at 17:00 (25 °C). Six eclosed since the clearing, at ages spread across the
8 hours: the youngest still have folded, unexpanded wings, and the meconium shows for
the first few hours. One older, fully pigmented fly was missed at clearing; collecting
it is an error whatever its sex or actual history, because the record no longer
supports it. Flies land on their sides or backs at random. Collect at least two
virgin females, set uncertain flies aside, and declare the collection ready.
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

- `npm run check`: actual mesh builds plus collection, inheritance, experiment and notebook domain tests.
- `npm run check:genetics`: verify the retained genetics engine's six cross puzzles.
- `npm run serve`: local browser preview at http://127.0.0.1:5180.
- `npm run snapshot`: hidden Electron snapshot, saved as `snapshot.png`.
- `npx electron . --snapshot=tmp/collection.png --snapshot-js=tools/review-collection.js`:
  renderer integration checks and exercise screenshot.
- `npx electron . --snapshot=tmp/reference.png --snapshot-js=tools/review-scope.js`:
  reference selection, inspection and keyboard checks.
- `npx electron . --snapshot=tmp/cross.png --snapshot-js=tools/review-cross.js`:
  documented/uncertain parent collections, event progression, F1 scoring and evidence review.
- Add `--snapshot-size=1000x700` to inspect the minimum supported window size.

Snapshot runs use a separate profile under `tmp/snapshot-profile`, so tests do not
change a learner's saved notebook. Local storage is per browser/app profile; the
browser preview and desktop app do not share notebooks.

## Code map

```
main.cjs                  Electron shell and hidden snapshot support
src/js/scope.js            Microscope, activity UI, transfers and notebook presentation
src/js/collection.js       Collection session, private biological state and assessment
src/js/experiment.js       White-eye cross, explicit mating history, event time and F1 assessment
src/js/flyModel.js         Fly assembly, sex/developmental variants and materials
src/js/legs.js             Leg assembly and posing
src/js/genetics/           Genetics engine used by the cross mission, plus retained puzzles
assets/fly/               Converted anatomy meshes
tools/                    Model tools and checks
Documentation/            Teaching references and agreed Trainer Specification
```

The 3D cross mission now uses the shared genetics engine for Mendelian progeny.
The advanced puzzle interface has not yet been reintroduced. A local V1 source recovery archive is in
`tmp/migration/v1-source.zip`; it is outside the active app and excluded from Git.

The project is under Git (local repository, branch `main`). Commit before handing the
folder between assistants or people so every change can be reviewed and undone.

## Model provenance and limitations

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

Calendar management, individual verification/test-cross follow-ups and the advanced
genetics course remain subsequent stages.
