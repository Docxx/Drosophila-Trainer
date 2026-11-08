// Keep answers and plans, never large derived tissue/temperature arrays.
// Bump this when a changed exercise makes earlier answers incompatible.
export const DRAFT_VERSION = 1;
export function lessonDraft(lesson, index, state) {
  return JSON.parse(JSON.stringify({ version: DRAFT_VERSION,
    types: lesson.steps.map((s) => s.type), index, state }, (key, value) =>
    key === 'sim' || key === 'result' ? undefined : value));
}
export function restoreDraft(lesson, saved) {
  if (!saved || saved.version !== DRAFT_VERSION || !Number.isInteger(saved.index)
    || saved.index < 0 || saved.index >= lesson.steps.length
    || JSON.stringify(saved.types) !== JSON.stringify(lesson.steps.map((s) => s.type))
    || !Array.isArray(saved.state) || saved.state.length !== lesson.steps.length
    || saved.state.some((s) => !s || typeof s !== 'object' || Array.isArray(s))) return null;
  return structuredClone(saved);
}
