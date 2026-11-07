# Fly Trainer: agreed product specification

Status: design baseline agreed with Ray, 1 November 2026. Implementation milestones below are proposed delivery steps, not completed features.

Implementation update: the 3D trainer is now the main root application. The V1 interface has been removed; its reusable genetics engine and puzzles are retained in `src/js/genetics/`, with a recovery archive outside the active app under `tmp/migration/`. The reference bench and first six-fly virgin-collection exercise are implemented, including reversible collection decisions, delayed review, local notebook saving/export, and optional support. Male anatomy remains a first pass and detailed male terminalia remain unimplemented; unexpanded wings and meconium are now modelled. The first white-eye cross mission now connects a separate maternal collection to inheritance prediction, documented/uncertain vial histories, parent removal, F1 examination and offspring-led diagnosis. Its notebook is separate from the original Canton-S collection.

Update, 7 November 2026: this specification is the single source of truth for Fly Trainer; the earlier cosy-sim design doc is superseded and kept only as a source of optional game ideas. Changes made in this round: the collection exercise uses the standard 8-hour window at 25 °C with flies aged across it; teneral flies show unexpanded wings and young flies show meconium; one fully pigmented holdover fly tests whether the learner notices a fly too old for the record; resting poses (left side, right side, back) are random and independent of sex; the uncertain cross offers "discard and re-clear" at a cost of 8 hours; paternity follows a remating model (probability 0.3) with last-male precedence 0.8; and learner-facing modelling caveats are gathered in one "About this model" panel. Notebook formats moved to version 2 (new storage keys; version 1 notebooks are left untouched).

## Purpose and audience

An offline desktop trainer for practical Drosophila work and genetics, serving beginners, undergraduate students, new lab members, and experienced users building confidence in advanced genetics. Assume no genetics knowledge at entry, while allowing experienced learners to skip basics.

Combine an interactive course, a cross sandbox, and realistic microscope handling. Keep the tone clear and instructional, with optional game elements. The first 30-45 minutes should introduce sexing, appropriate virgin collection, and planning and interpreting a basic cross. Deliver the virgin-collection activity first; the basic-cross activity follows.

## Agreed learning design

- All lessons are directly accessible. An optional diagnostic recommends a starting point without locking content.
- Start explanations with chromosome diagrams, introduce conventional notation gradually, and retain access to both representations.
- Learners infer genetic identity from stock records, observed phenotypes, and verification crosses. Do not expose hidden genotypes through a reveal button or support feature.
- Mistakes can affect subsequent offspring. Use the experiment history, diagnostic prompts, and follow-up crosses to investigate causes; reduce guidance as learners progress.
- Automatically record actions and crosses. Learners supply predictions and conclusions.
- Offer reference cards, optional supervisor guidance, and worked examples, each independently switchable. Supervisor behaviour is configurable: on request, after difficulty, and/or occasional reasoning prompts. No online service is required by this design.
- Worked examples can use separate explained demonstration crosses, discuss possible genotypes, and replay a completed experiment. A replay must distinguish established facts from unresolved possibilities; completion alone does not justify revealing hidden identity.
- Mission completion is based on obtaining the target flies, assessed after the learner declares their selection. Do not require a written explanation or a verification cross for every mission. A mission whose target explicitly includes verification can require it.
- Assess practical identification, independent cross design, and troubleshooting separately from mission completion.
- Support both advancing directly to an event and calendar-based collection/cross management as the trainer develops.

## First activity: virgin collection

### Scope

A small, polished population of 6-8 flies under a realistic virtual dissecting microscope. Prioritise convincing anatomy and useful inspection over a broad marker catalogue.

Begin with a reliably cleared source vial and a known collection interval under stated conditions. Teach how that history supports a collection decision. Later introduce uncertain history and conservative selection.

Allow genuine visual ambiguity and rejection of uncertain flies. Do not force a guess or promise that every fly can be identified conclusively from its appearance.

### Learner flow

1. Read the objective and source-vial record, including clearing/collection history and relevant conditions.
2. Make a short prediction or collection plan in the notebook.
3. Inspect flies using zoom, rotation, and underside views.
4. Move individual flies to the collection vial or reject them. Distinguish rejection from physical disposal in the interface and records.
5. Review the collection and declare it ready. No correctness signal is shown during sorting.
6. In the introductory exercise, review errors and retry. In later missions, carry the selection into a cross and diagnose consequences from offspring.

The assessment should report what the evidence supports. A mature female is not automatically mated; an isolated older female can remain virgin. Simulated mating history must be distinct from age and outward appearance. Avoid presenting an age cutoff or a visual cue as a universal guarantee.

### Handling

- Start with individual click-and-drag movement, developing toward brush contact and resistance.
- Provide both free rotation and explicit roll/flip controls.
- Clearly distinguish moving a fly, rotating it, and moving the microscope view.
- Physical actions initially affect position and orientation only. Do not apply injury, fertility, or CO2 exposure penalties in this milestone.
- Keep uncertain flies available for reconsideration until the learner submits the collection.

### Biological state and observation

Maintain separate internal records for biological truth, learner-visible observations, and evidence established by the learner. Candidate internal attributes include sex, age/developmental state, mating history, genotype, and source-vial identity.

Appearance must follow biologically relevant attributes without encoding answers through unrelated colours, identifiers, placement, or pose. Avoid automatically writing inferred sex, virginity, or genotype into the notebook before the learner establishes it.

Introductory feedback may explain an observed sexing error and the collection evidence. It must not become a general hidden-genotype reveal mechanism.

## Delivery sequence and acceptance criteria

### Milestone 1: male and female inspection

Extend the 3D microscope with a small set of male and female flies suitable for inspection before building the full collection exercise.

Acceptance:

- Male and female anatomy can be inspected from dorsal, lateral, and ventral orientations.
- Male abdomen shape/pigmentation and correctly placed foreleg sex combs are represented; young males do not depend on mature dark pigmentation for identification.
- Female morphology and fresh-adult appearance are checked against appropriate references. Model only cues that can be represented convincingly.
- Rotation, explicit roll/flip, zoom, and moving individual flies operate consistently, with flies resting plausibly on the pad.
- Review appearance at normal inspection magnifications, not only enlarged development views.
- Ray reviews the anatomy and controls before expanding the population and learning activity.

### Milestone 2: complete introductory collection exercise

Acceptance:

- Populate a session with 6-8 flies and an explicit source-vial history.
- Support collection, rejection, reconsideration, and learner submission.
- Record actions automatically and retain learner predictions and conclusions through the exercise and review.
- Delay assessment until submission; provide introductory review and retry.
- Make each support type independently switchable and keep hidden genetic information inaccessible through support.
- Run fully offline. Following Ray's later direction, remove the V1 interface while retaining the reusable genetics engine for future 3D activities.

### Milestone 3: uncertain history and consequences

Implemented first pass: a white-eyed maternal stock, separate from the Canton-S introductory activity, is crossed to verified red-eyed Canton-S males. Users choose documented or uncertain vial history, collect parents, predict the intended cross, remove parents on day 2, and examine a twelve-adult F1 sample on day 12. They record eye colour/sex (or uncertainty) for each offspring and interpret results before feedback.

The shared genetics engine generates the offspring. Extra selected white-eyed males and explicit stored-sperm histories can affect paternity. Prior mating cannot be identified visually or revealed individually by a button; the evidence review explains that white-eyed daughters imply unintended white-eyed paternity within the defined stock system, while a normal-looking finite sample does not prove virginity. Fixed developmental events, idealised fertility and illustrative paternity weights are documented modelling assumptions, not laboratory predictions.

Collection and cross notebooks persist independently, including predictions, parent choices, observations, timeline and interpretation. Reopening F1 scoring preserves the original sample. Expand to verification/test-cross follow-ups and calendar management after evaluating this experiment flow.

## Wider curriculum and sandbox

Advanced priorities, in a suggested teaching order:

1. Balancers and multigeneration cross planning.
2. Recombination and establishing verified lines.
3. GAL4/UAS, RNAi, and experimental controls.
4. Complementation and deficiency mapping.

Begin the sandbox with curated teaching stocks, then representative lab stocks. Later support user-defined genotypes and lab stock-list imports within the genetics engine's supported rules. Unsupported stock notation or biology should be identified explicitly rather than silently approximated.

## References and evaluation

Use Ray's own microscope photographs/videos when available and appropriately licensed external references. Track the origin and reuse terms of incorporated assets. The project README identifies licensing checks needed for its derived anatomy meshes before external distribution; that check remains unresolved.

Use the two Prokop guides in this folder as curriculum references and the scanned Fly Pushing book for selected reference work. Treat teaching simplifications as explicit modelling decisions and validate biological details against suitable sources.

Pilot with Ray first, then beginners and experienced fly researchers. Evaluate separately:

- Transfer of identification skills to unfamiliar photographs and real microscope work.
- Ability to design valid crosses independently.
- Ability to diagnose unfamiliar genetic results.

## Current implementation observations

- Root launcher and npm scripts now run the 3D trainer. There is no separate v2 application folder.
- The reference bench contains five known specimens (including a just-eclosed female); the collection exercise contains seven anonymously labelled flies: six from the 8-hour window plus one holdover, in shuffled order with varied headings and resting poses.
- Individual movement, rotation, explicit inspection views, collection/set-aside destinations, return to pad and submission review are implemented.
- The exercise asks for at least two females. It does not penalise leaving uncertain flies uncollected. Its record uses the standard 8-hour collection interval at 25 °C (females stay virgin for about 8–10 hours after eclosion), as referenced in the README.
- Biological sex, developmental appearance and explicit mating history are separate. The public notebook excludes biological truth before submission, and review explains only collected flies.
- Collection decisions, predictions, conclusions and history persist across app launches. Positions and inspection angles reset on activity loading. Snapshot tests use a separate app profile.
- The First cross activity uses twelve F1 adults, paged in groups of six, with two source-history scenarios and delayed evidence review. It reuses the retained genetics engine.
- Generation-par checks validate puzzle reachability under the retained genetics model; they do not establish biological fidelity or educational effectiveness.

## Details to resolve during implementation

Use reasonable, reversible defaults without another broad requirements questionnaire. Continue anatomy review against references, evaluate the defined two-hour collection scenario with learners, and establish performance expectations on Ray's desktop. These details must be documented before the collection exercise is considered validated.
