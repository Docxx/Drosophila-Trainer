// Verify actual mesh builds, including cached-source isolation between specimens.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildFly } from '../src/js/flyModel.js';
import * as THREE from 'three';

const source = new URL('../assets/fly/', import.meta.url);
globalThis.fetch = async (url) => {
  const bytes = await readFile(new URL(String(url).split('/').at(-1), source));
  return { ok: true, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
};

const female = await buildFly();
const originalPositions = female.parts.body_l.geometry.attributes.position.array.slice();
const originalColours = female.parts.body_l.geometry.attributes.color.array.slice();
const male = await buildFly({ sex: 'M' });
const paleMale = await buildFly({ sex: 'M', stage: 'fresh' });
const femaleAgain = await buildFly();
const wingSource = female.parts.wing_l.geometry.attributes.position.array.slice();
const teneral = await buildFly({ stage: 'teneral', meconium: true });
const withMeconium = await buildFly({ stage: 'fresh', meconium: true });
const withoutMeconium = await buildFly({ stage: 'fresh' });
const wingAfter = await buildFly();

const comb = (fly) => {
  const found = [];
  fly.object.traverse((o) => { if (/^sex-comb-[lr]-\d+$/.test(o.name)) found.push(o); });
  return found;
};
assert.equal(comb(female).length, 0, 'Females must not carry sex combs');
assert.equal(comb(male).length, 20, 'A male must have ten teeth on each foreleg');
assert.equal(comb(paleMale).length, 20, 'Pale males retain sex combs');
assert.deepEqual(female.parts.body_l.geometry.attributes.position.array, originalPositions, 'Building a male must not reshape an existing female');
assert.deepEqual(female.parts.body_l.geometry.attributes.color.array, originalColours, 'Building a pale fly must not recolour an existing female');
assert.deepEqual(femaleAgain.parts.body_l.geometry.attributes.position.array, originalPositions, 'Cached source geometry must remain unchanged');
assert.deepEqual(femaleAgain.parts.body_l.geometry.attributes.color.array, originalColours);
assert.notDeepEqual(male.parts.body_l.geometry.attributes.position.array, originalPositions, 'Male silhouette must differ');
assert.notDeepEqual(paleMale.parts.body_l.geometry.attributes.color.array, male.parts.body_l.geometry.attributes.color.array, 'Pale male pigment must differ from mature pigment');
assert.equal(male.object.scale.x, female.object.scale.x, 'Abdomen shortening must not enlarge the male head');

// Teneral flies: unexpanded wings are much smaller, and the shared wing source is untouched.
const span = (mesh) => new THREE.Box3().setFromBufferAttribute(mesh.geometry.attributes.position).getSize(new THREE.Vector3());
assert(span(teneral.parts.wing_l).x < span(female.parts.wing_l).x * 0.6, 'Unexpanded wings must be shorter than expanded wings');
assert.deepEqual(wingAfter.parts.wing_l.geometry.attributes.position.array, wingSource, 'Crumpling a teneral wing must not alter the cached wing');
// Meconium darkens the ventral abdomen only.
const luminance = (fly) => { const c = fly.parts.body_l.geometry.attributes.color.array; let min = 3; for (let i = 0; i < c.length; i += 3) min = Math.min(min, c[i] + c[i + 1] + c[i + 2]); return min; };
assert(luminance(withMeconium) < luminance(withoutMeconium) - 0.3, 'Meconium must show as a dark patch');
assert.deepEqual(comb(teneral), [], 'A teneral female has no sex combs');

for (const fly of [female, male, paleMale, femaleAgain, teneral, withMeconium]) {
  fly.object.updateMatrixWorld(true);
  fly.object.traverse((o) => {
    if (!o.isMesh) return;
    for (const attribute of ['position', 'normal']) {
      const values = o.geometry.attributes[attribute].array;
      assert(values.every(Number.isFinite), `Non-finite ${attribute} on ${o.name}`);
    }
  });
  const bounds = new THREE.Box3().setFromObject(fly.object);
  assert(bounds.max.x > bounds.min.x && bounds.max.y > bounds.min.y, 'Nonempty specimen bounds');
}
await assert.rejects(buildFly({ sex: 'unknown' }), /Unknown sex/);
await assert.rejects(buildFly({ stage: 'unknown' }), /Unknown developmental stage/);
console.log(`PASS: anatomy variants, sex combs, finite geometry, input validation and source-cache isolation (${fileURLToPath(source)})`);
