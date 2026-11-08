// Loads the Hidalgo-lab fly parts and assembles them into one model.
// Part files are laid out flat as for 3D printing; ASSEMBLY places each one.
// Model units are the print's millimetres (body ~210 long); the fly frame is
// x = head (small) to tail (large), y = dorsal (+), z = fly's left (+).
// `bilateral: true` parts are left-side pieces that also get a mirrored right twin.

import * as THREE from 'three';
import { LEG_JOINTS, KO_POSE, legRestMatrix, poseLeg, closeSlit } from './legs.js';

// Parts are seated the way the printed model is: on its magnets and square pegs.
// Seat positions were measured from the flat discs (magnet holes) in each STL.
export const ASSEMBLY = {
  body_l: { pos: [0, 0, 0], rot: [0, 0, 0] },
  // Halves join on two 5 mm magnets each; their seats put the cut faces at z = 4.04.
  body_r: { pos: [221.1, 0, 6.41], rot: [0, 180, 0] },
  // Keyed by two square pegs each side (head end and scutellum end).
  notum: { pos: [5.7, 62, 45.29], rot: [-90, 0, 0] },
  // 5 mm magnet: eye disc (11.47,13.9,25.46) onto head socket (24.52,62.81,32.4) + 2 x 2 mm.
  eye_l: { pos: [36.72, 34.12, 35.28], rot: [-56.715, -4.402, 74.277], bilateral: true },
  antenna_l: { pos: [10, 44, 0.5], rot: [0, -90, 0], bilateral: true },
  wing_l: { seat: true, bilateral: true }, // posed by wingSeat()
  // Square pegs + two 8 mm magnets into the thorax floor.
  pleura: { pos: [118.41, 58.17, -30.835], rot: [90, 0, 90] },
};

// Wing base: an 8 mm magnet disc (file) onto the thorax's wing seat (fly frame).
// A single magnet only fixes the base, so the wing can swing to any spread.
const WING_SEAT = {
  disc: [10.24, 18.81, 4.39],
  discNormal: [0, 0, -1],
  long: [0.898, 0.437, 0], // hinge -> tip, in the wing's plane
  // Body seat floor at y 72.13 (5 mm deep) + wing hole 3 mm deep.
  at: [81.38, 80.13, 24.87],
};

/**
 * Pose for the left wing. With `raise` = 0 it lies flat on its magnet seat,
 * `spread` degrees out from the body axis. With `raise` > 0 it is held up over
 * the back like a knocked-out fly's: the wing turned on edge so its flat face
 * looks sideways, tip `raise` degrees above horizontal, splayed `spread` degrees.
 */
export function wingSeat(spread = 28, raise = 0) {
  const s = THREE.MathUtils.degToRad(spread);
  if (!raise) {
    return seatOnDisc(WING_SEAT.disc, WING_SEAT.discNormal, WING_SEAT.at, [0, -1, 0], WING_SEAT.long, [Math.cos(s), 0, Math.sin(s)]);
  }
  const a = THREE.MathUtils.degToRad(raise);
  // Wing's own axes (file): long (hinge -> tip), A = N x L (toward the trailing edge), N (dorsal face).
  const N = new THREE.Vector3(...WING_SEAT.discNormal).negate();
  const L = new THREE.Vector3(...WING_SEAT.long).normalize();
  const A = new THREE.Vector3().crossVectors(N, L);
  // Targets (fly frame): tip up and back, trailing edge down and back, dorsal face inward.
  const Lw = new THREE.Vector3(Math.cos(a), Math.sin(a), Math.sin(s)).normalize();
  const Aw = new THREE.Vector3(Math.sin(a), -Math.cos(a), 0);
  Aw.sub(Lw.clone().multiplyScalar(Aw.dot(Lw))).normalize();
  const Nw = new THREE.Vector3().crossVectors(Lw, Aw);
  const R = new THREE.Matrix4().makeBasis(Lw, Aw, Nw).multiply(new THREE.Matrix4().makeBasis(L, A, N).transpose());
  const c = new THREE.Vector3(...WING_SEAT.disc).applyMatrix4(R);
  const e = new THREE.Euler().setFromRotationMatrix(R, 'XYZ');
  return {
    pos: [WING_SEAT.at[0] - c.x, WING_SEAT.at[1] - c.y, WING_SEAT.at[2] - c.z],
    rot: [e.x, e.y, e.z].map((v) => THREE.MathUtils.radToDeg(v)),
  };
}

/**
 * Rotation + translation that puts a part's disc (centre, normal) onto a target
 * disc, turning about the disc axis so `longFile` lines up with `longTarget`.
 */
function seatOnDisc(discC, discN, targetC, targetN, longFile, longTarget) {
  const n = new THREE.Vector3(...discN).normalize();
  const tn = new THREE.Vector3(...targetN).normalize();
  const lf = new THREE.Vector3(...longFile);
  const b = lf.sub(n.clone().multiplyScalar(lf.dot(n))).normalize();
  const lt = new THREE.Vector3(...longTarget);
  const B = lt.sub(tn.clone().multiplyScalar(lt.dot(tn))).normalize();
  const R = new THREE.Matrix4()
    .makeBasis(tn, B, new THREE.Vector3().crossVectors(tn, B))
    .multiply(new THREE.Matrix4().makeBasis(n, b, new THREE.Vector3().crossVectors(n, b)).transpose());
  const e = new THREE.Euler().setFromRotationMatrix(R, 'XYZ');
  const c = new THREE.Vector3(...discC).applyMatrix4(R);
  return {
    pos: [targetC[0] - c.x, targetC[1] - c.y, targetC[2] - c.z],
    rot: [e.x, e.y, e.z].map((v) => THREE.MathUtils.radToDeg(v)),
  };
}

const cache = new Map();

export async function loadPart(id, base = '../assets/fly/') {
  if (!cache.has(id)) {
    cache.set(
      id,
      fetch(`${base}${id}.bin`)
        .then((r) => {
          if (!r.ok) throw new Error(`Missing part ${id}`);
          return r.arrayBuffer();
        })
        .then((buf) => {
          const [nv, ni] = new Uint32Array(buf, 0, 2);
          const pos = new Float32Array(buf, 8, nv * 3);
          const idx = new Uint32Array(buf, 8 + nv * 12, ni);
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          g.setIndex(new THREE.BufferAttribute(idx, 1));
          g.computeVertexNormals();
          return g;
        }),
    );
  }
  return cache.get(id);
}

/** Split an indexed geometry into connected pieces, largest first. */
export function splitComponents(g) {
  const idx = g.index.array;
  const pos = g.attributes.position.array;
  const parent = new Int32Array(pos.length / 3).map((_, i) => i);
  const find = (a) => {
    while (parent[a] !== a) a = parent[a] = parent[parent[a]];
    return a;
  };
  for (let i = 0; i < idx.length; i += 3) {
    const a = find(idx[i]);
    parent[find(idx[i + 1])] = a;
    parent[find(idx[i + 2])] = a;
  }
  const groups = new Map();
  for (let i = 0; i < idx.length; i += 3) {
    const r = find(idx[i]);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(idx[i], idx[i + 1], idx[i + 2]);
  }
  return [...groups.values()]
    .sort((a, b) => b.length - a.length)
    .map((tri) => {
      const remap = new Map();
      const p = [];
      const out = tri.map((v) => {
        if (!remap.has(v)) {
          remap.set(v, p.length / 3);
          p.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
        }
        return remap.get(v);
      });
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      sg.setIndex(out);
      sg.computeVertexNormals();
      return sg;
    });
}

// Body halves meet at this z; right-side parts are left parts mirrored across it.
export const MIDLINE_Z = 4.04;

// Macrochaete sockets on the notum + head plate (left side, notum file coords),
// found as pits in the mesh. Mirrored about the notum's own midline (file y).
const NOTUM_MID_Y = 41.55;
const BRISTLE_PITS = [
  [106.3, 29.7, 20.1],
  [61.3, 36.6, 39.2],
  [93.1, 34.5, 39.2],
  [84.1, 20.8, 37.4],
  [67.9, 12.8, 31.5],
  [116.7, 34.6, 30.6],
  [103.9, 30, 28.2],
  [47.1, 14.4, 25.9],
  [55.9, 9.3, 22.5],
  [44.7, 10.9, 18.9],
  [38.6, 14.7, 13.6],
  [46.3, 9.5, 13.3],
  [21.9, 24.2, 16.2],
  [12.3, 24.8, 15.5],
];

export const EYE_COLOURS = {
  red: 0x9c1a10,
  orange: 0xd9661c,
  white: 0xf2efe6,
};

const PALETTE = {
  cuticle: new THREE.Color(0x7a4a22),
  abdomen: new THREE.Color(0xa87a3e),
  band: new THREE.Color(0x24140a),
  leg: new THREE.Color(0x9a6a36),
  bristle: new THREE.Color(0x120a05),
};

function cuticleMaterial(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.55,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    // Microchaetae give real cuticle a soft, velvety rim.
    sheen: 0.35,
    sheenRoughness: 0.75,
    sheenColor: new THREE.Color(0xc9a272),
    side: THREE.DoubleSide,
    ...opts,
  });
}

/**
 * Colour a body half: tan thorax/head, paler abdomen, and the female pattern of a
 * dark band along the posterior edge of each tergite. Those edges are the steps
 * where one tergite overlaps the next, i.e. surfaces facing backward (+x).
 */
// Meconium: the first gut contents, a dark greenish mass seen through the pale
// ventral and lateral abdominal wall for the first hours after eclosion.
// Ellipsoid in the fly frame; dorsal tergites (y > ~48) stay unpainted.
const MECONIUM = { c: new THREE.Vector3(152, 32, MIDLINE_Z), r: new THREE.Vector3(20, 16, 42), color: new THREE.Color(0x2b3420) };

function meconiumWeight(x, y, z) {
  const d = Math.hypot((x - MECONIUM.c.x) / MECONIUM.r.x, (y - MECONIUM.c.y) / MECONIUM.r.y, (z - MECONIUM.c.z) / MECONIUM.r.z);
  return 1 - THREE.MathUtils.smoothstep(d, 0.65, 1);
}

// Pale colours for newly eclosed flies; teneral (wings not yet expanded) are palest.
const PALE = {
  teneral: { cuticle: new THREE.Color(0xe3cf9f), abdomen: new THREE.Color(0xeee0b4), leg: 0xd6bc86 },
  fresh: { cuticle: new THREE.Color(0xd7bb81), abdomen: new THREE.Color(0xe5ce96), leg: 0xc8a46c },
};

function paintBodyHalf(mesh, { sex, stage, meconium }) {
  mesh.updateMatrixWorld();
  const g = mesh.geometry;
  const p = g.attributes.position;
  const n = g.attributes.normal;
  const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  const N = p.count;
  const wp = new Float32Array(N * 3);
  const rim = new Float32Array(N);
  const v = new THREE.Vector3();
  const nn = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld);
    nn.fromBufferAttribute(n, i).applyMatrix3(nm).normalize();
    wp.set([v.x, v.y, v.z], i * 3);
    // Tergite step: dorsal/lateral, abdomen only, not the very tip (a dark tip is male).
    const facingBack = THREE.MathUtils.smoothstep(nn.x, 0.4, 0.7);
    const dorsal = THREE.MathUtils.smoothstep(nn.y, -0.45, -0.1);
    const inAbdomen = THREE.MathUtils.smoothstep(v.x, 134, 140) * (1 - THREE.MathUtils.smoothstep(v.x, 198, 206));
    // Tergites wrap down the sides; the pale sternites underneath stay unbanded.
    const upperBody = THREE.MathUtils.smoothstep(v.y, 30, 40);
    rim[i] = facingBack * dorsal * inAbdomen * upperBody;
  }

  // Spread each step's pigment forward over the back of its tergite.
  const BAND = 8; // print units ahead of the step
  const CELL = 3;
  const grid = new Map();
  const key = (x, y, z) => `${x},${y},${z}`;
  for (let i = 0; i < N; i++) {
    if (rim[i] < 0.3) continue;
    const k = key(Math.floor(wp[i * 3] / CELL), Math.floor(wp[i * 3 + 1] / CELL), Math.floor(wp[i * 3 + 2] / CELL));
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(i);
  }
  const col = new THREE.Color();
  const colors = new Float32Array(N * 3);
  const cuticle = PALE[stage]?.cuticle || PALETTE.cuticle;
  const abdomen = PALE[stage]?.abdomen || PALETTE.abdomen;
  const young = stage !== 'mature';
  for (let i = 0; i < N; i++) {
    const x = wp[i * 3],
      y = wp[i * 3 + 1],
      z = wp[i * 3 + 2];
    let band = rim[i];
    if (x > 130 && x < 210) {
      const cx = Math.floor(x / CELL),
        cy = Math.floor(y / CELL),
        cz = Math.floor(z / CELL);
      for (let a = 0; a <= Math.ceil(BAND / CELL); a++)
        for (let b = -1; b <= 1; b++)
          for (let c = -1; c <= 1; c++) {
            const list = grid.get(key(cx + a, cy + b, cz + c));
            if (!list) continue;
            for (const j of list) {
              const ahead = wp[j * 3] - x;
              if (ahead < 0 || ahead > BAND) continue;
              if (Math.hypot(wp[j * 3 + 1] - y, wp[j * 3 + 2] - z) > 2.5) continue;
              band = Math.max(band, rim[j] * (1 - THREE.MathUtils.smoothstep(ahead, BAND * 0.6, BAND)));
            }
          }
    }
    // Blend from thorax colour into abdomen colour around the waist.
    col.copy(cuticle).lerp(abdomen, THREE.MathUtils.smoothstep(x, 128, 140));
    // The posterior male tergites merge into a dark patch. Fresh males retain
    // sex combs but have little abdominal pigmentation immediately after eclosion.
    const maleTip = sex === 'M' ? THREE.MathUtils.smoothstep(x, 174, 187) * THREE.MathUtils.smoothstep(y, 27, 36) : 0;
    col.lerp(PALETTE.band, Math.max(Math.min(1, band), maleTip) * (young ? 0.16 : 0.94));
    if (meconium) col.lerp(MECONIUM.color, 0.85 * meconiumWeight(x, y, z));
    colors.set([col.r, col.g, col.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

/** Shorten the female-derived abdomen, leaving the thorax and leg seats fixed.
 * This is a first-pass male silhouette, rather than a new anatomical scan. */
function shapeMaleAbdomen(mesh) {
  mesh.updateMatrixWorld();
  const inverse = mesh.matrixWorld.clone().invert();
  const p = mesh.geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld);
    const weight = THREE.MathUtils.smoothstep(v.x, 136, 205);
    v.x -= (v.x - 136) * weight * 0.22;
    v.z = MIDLINE_Z + (v.z - MIDLINE_Z) * (1 + weight * 0.15);
    v.applyMatrix4(inverse);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  p.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** Ten teeth on the first tarsal segment of each male foreleg. Construct in
 * the rest frame, then use the same skinning as the leg to keep them attached. */
function buildSexComb(leg, joints, mirror, material) {
  const axis = joints[4].clone().sub(joints[3]);
  const direction = axis.clone().normalize();
  const outward = new THREE.Vector3(0, -1, 0);
  outward.addScaledVector(direction, -outward.dot(direction)).normalize();
  const positions = leg.attributes.position;
  const group = new THREE.Group();
  group.name = 'sex-combs';
  for (let tooth = 0; tooth < 10; tooth++) {
    const centre = joints[3].clone().addScaledVector(axis, 0.12 + tooth * 0.024);
    // Find the cuticle surface on this side of the metatarsus, rather than
    // placing a floating comb a fixed distance from its centreline.
    let surface = 0;
    const v = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
      v.fromBufferAttribute(positions, i).sub(centre);
      if (Math.abs(v.dot(direction)) < 1.5) surface = Math.max(surface, v.dot(outward));
    }
    const base = centre.addScaledVector(outward, Math.max(0.6, surface) - 0.2);
    const g = bristleGeometry(3.2, 0.48);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), outward));
    g.translate(base.x, base.y, base.z);
    poseLeg(g, joints, KO_POSE.leg1_l);
    const right = g.clone().applyMatrix4(mirror);
    const idx = right.index.array;
    for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
    right.computeVertexNormals();
    for (const [side, geometry] of [
      ['l', g],
      ['r', right],
    ]) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `sex-comb-${side}-${tooth}`;
      mesh.castShadow = true;
      group.add(mesh);
    }
  }
  return group;
}

/** A newly eclosed fly's wing before it has inflated: the printed wing shrunk
 * about its hinge (file coordinates) and crumpled into soft folds. */
function unexpandedWing(source) {
  const g = source.clone();
  const hinge = new THREE.Vector3(5.72, 15.72, 2.23);
  const L = new THREE.Vector3(...WING_SEAT.long).normalize();
  const A = new THREE.Vector3(-L.y, L.x, 0);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).sub(hinge);
    const l = v.dot(L),
      a = v.dot(A),
      n = v.z;
    const fold = 2.4 * Math.sin(l * 0.16) * Math.cos(a * 0.22) + 1.2 * Math.sin(a * 0.5 + l * 0.05);
    v.copy(hinge)
      .addScaledVector(L, l * 0.36)
      .addScaledVector(A, a * 0.48);
    v.z += n + fold * THREE.MathUtils.smoothstep(l, 4, 30);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

function bristleGeometry(len, r0) {
  const g = new THREE.CylinderGeometry(r0 * 0.12, r0, len, 6, 10, false);
  g.translate(0, len / 2, 0);
  const p = g.attributes.position;
  // Gentle curve, like a real macrochaete.
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / len;
    p.setZ(i, p.getZ(i) + 0.18 * len * t * t);
  }
  g.computeVertexNormals();
  return g;
}

/** Bristles grown from the notum's sockets, swept back and slightly raised. */
function buildBristles(notum, { lengthScale = 1, thickness = 1 } = {}) {
  notum.updateMatrixWorld();
  const g = notum.geometry;
  const pos = g.attributes.position.array;
  const nor = g.attributes.normal.array;
  const pits = BRISTLE_PITS.flatMap(([x, y, z]) => [
    [x, y, z],
    [x, 2 * NOTUM_MID_Y - y, z],
  ]);
  const mat = new THREE.MeshStandardMaterial({ color: PALETTE.bristle, roughness: 0.35 });
  const group = new THREE.Group();
  group.name = 'bristles';
  const up = new THREE.Vector3(0, 1, 0);
  for (const pit of pits) {
    const sum = new THREE.Vector3();
    for (let i = 0; i < pos.length; i += 3) {
      if (Math.hypot(pos[i] - pit[0], pos[i + 1] - pit[1], pos[i + 2] - pit[2]) < 5)
        sum.add(new THREE.Vector3(nor[i], nor[i + 1], nor[i + 2]));
    }
    const base = new THREE.Vector3(...pit).applyMatrix4(notum.matrixWorld);
    const N = sum.transformDirection(notum.matrixWorld).normalize();
    const back = new THREE.Vector3(1, 0, 0);
    const tangent = back
      .clone()
      .sub(N.clone().multiplyScalar(back.dot(N)))
      .normalize();
    const dir = tangent
      .multiplyScalar(Math.cos(0.45))
      .add(N.clone().multiplyScalar(Math.sin(0.45)))
      .normalize();
    const onHead = base.x < 45;
    const m = new THREE.Mesh(bristleGeometry((onHead ? 26 : 38) * lengthScale, 0.75 * thickness), mat);
    m.position.copy(base);
    m.quaternion.setFromUnitVectors(up, dir);
    // Turn about the shaft so the curve bends back toward the body.
    const side = new THREE.Vector3(0, 0, 1).applyQuaternion(m.quaternion);
    const want = N.clone().negate();
    m.rotateY(Math.atan2(new THREE.Vector3().crossVectors(side, want).dot(dir), side.dot(want)));
    group.add(m);
  }
  return group;
}

/**
 * Build a complete fly. Returns a Group in millimetres (about 2.2 mm long),
 * centred on its body, plus handles for changing markers later.
 */
export const STAGES = ['teneral', 'fresh', 'mature'];

/**
 * `stage`: 'teneral' = just eclosed, wings not yet expanded, palest;
 * 'fresh' = wings expanded, still pale; 'mature' = fully pigmented.
 * `meconium` shows the dark gut contents of the first hours (independent of stage).
 */
export async function buildFly({ sex = 'F', stage = 'mature', meconium = false, eye = 'red', wingSpread = 8, wingRaise = 45, base } = {}) {
  if (!['F', 'M'].includes(sex)) throw new Error(`Unknown sex: ${sex}`);
  if (!STAGES.includes(stage)) throw new Error(`Unknown developmental stage: ${stage}`);
  const teneral = stage === 'teneral';
  // Unexpanded wings lie close along the body rather than being held up.
  if (teneral) {
    wingSpread = 14;
    wingRaise = 22;
  }
  const raw = new THREE.Group(); // in print units, fly frame
  const ids = Object.keys(ASSEMBLY);
  const geoms = await Promise.all(ids.map((id) => loadPart(id, base)));

  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: EYE_COLOURS[eye],
    roughness: eye === 'white' ? 0.5 : 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xff8a70),
  });
  const wingMat = teneral
    ? // Folded, still-wet wing pads are milky and nearly opaque.
      new THREE.MeshPhysicalMaterial({
        color: 0xd9d2bf,
        roughness: 0.45,
        transparent: true,
        opacity: 0.85,
        sheen: 0.3,
        side: THREE.DoubleSide,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xd6d2c4,
        roughness: 0.15,
        transparent: true,
        opacity: 0.36,
        iridescence: 0.45,
        iridescenceIOR: 1.5,
        iridescenceThicknessRange: [250, 650],
        side: THREE.DoubleSide,
        depthWrite: false,
      });
  const cuticle = PALE[stage]?.cuticle || PALETTE.cuticle;
  const materials = {
    body_l: cuticleMaterial(0xffffff, { vertexColors: true }),
    body_r: cuticleMaterial(0xffffff, { vertexColors: true }),
    notum: cuticleMaterial(cuticle),
    pleura: cuticleMaterial(cuticle.clone().multiplyScalar(0.9)),
    eye_l: eyeMat,
    antenna_l: cuticleMaterial(cuticle.clone().multiplyScalar(0.85)),
    wing_l: wingMat,
  };
  const legMat = cuticleMaterial(PALE[stage]?.leg ?? PALETTE.leg);
  const sourceGeoms = [...geoms]; // cached and shared; never disposed per fly
  const wingIndex = ids.indexOf('wing_l');
  if (teneral) geoms[wingIndex] = unexpandedWing(geoms[wingIndex]);

  const placement = (id) => (ASSEMBLY[id].seat ? { ...ASSEMBLY[id], ...wingSeat(wingSpread, wingRaise) } : ASSEMBLY[id]);
  const parts = {};
  ids.forEach((id, i) => {
    // Cache source meshes only: body colour and shape belong to the individual.
    const geometry = id.startsWith('body_') ? geoms[i].clone() : geoms[i];
    const m = new THREE.Mesh(geometry, materials[id]);
    m.name = id;
    applyTransform(m, placement(id));
    m.castShadow = true;
    m.receiveShadow = true;
    raw.add(m);
    parts[id] = m;
    if (ASSEMBLY[id].bilateral) {
      const twin = new THREE.Mesh(geoms[i], materials[id]);
      twin.name = id.replace(/_l$/, '_r');
      applyTransform(twin, { ...placement(id), mirror: true });
      twin.castShadow = true;
      twin.receiveShadow = true;
      raw.add(twin);
      parts[twin.name] = twin;
    }
  });
  parts.wing_l.castShadow = parts.wing_r.castShadow = teneral;
  parts.wing_l.renderOrder = parts.wing_r.renderOrder = 2;

  raw.updateMatrixWorld(true);
  for (const body of [parts.body_l, parts.body_r]) {
    paintBodyHalf(body, { sex, stage, meconium });
    if (sex === 'M') shapeMaleAbdomen(body);
  }
  const bristles = buildBristles(parts.notum);
  bristles.traverse((o) => (o.castShadow = true));
  raw.add(bristles);

  // Legs: seated by their coxa pegs, then posed stiffly down and back (knocked out).
  const mirror = new THREE.Matrix4().makeTranslation(0, 0, 2 * MIDLINE_Z).multiply(new THREE.Matrix4().makeScale(1, 1, -1));
  const legGeoms = await Promise.all(Object.keys(LEG_JOINTS).map((id) => loadPart(id, base)));
  Object.keys(LEG_JOINTS).forEach((id, i) => {
    const M = legRestMatrix(id);
    const joints = LEG_JOINTS[id].map((j) => new THREE.Vector3(...j).applyMatrix4(M));
    const rest = closeSlit(legGeoms[i].clone(), id).applyMatrix4(M);
    if (id === 'leg1_l' && sex === 'M')
      raw.add(buildSexComb(rest, joints, mirror, new THREE.MeshStandardMaterial({ color: PALETTE.bristle, roughness: 0.5 })));
    const left = poseLeg(rest, joints, KO_POSE[id]);
    const right = left.clone().applyMatrix4(mirror);
    // A mirror flips triangle winding; swap two corners to keep faces outward.
    const idx = right.index.array;
    for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
    right.computeVertexNormals();
    for (const [side, g] of [
      ['l', left],
      ['r', right],
    ]) {
      const mesh = new THREE.Mesh(g, legMat);
      mesh.name = id.replace(/_l$/, `_${side}`);
      mesh.castShadow = mesh.receiveShadow = true;
      raw.add(mesh);
      parts[mesh.name] = mesh;
    }
  });

  // Centre on the body and convert print units to millimetres (real fly ~2.2 mm).
  const box = new THREE.Box3().setFromObject(parts.body_l).union(new THREE.Box3().setFromObject(parts.body_r));
  const centre = box.getCenter(new THREE.Vector3());
  raw.position.copy(centre).multiplyScalar(-1);
  const fly = new THREE.Group();
  fly.add(raw);
  // Use a common source scale: shortening a male abdomen must not enlarge his head.
  fly.scale.setScalar(2.2 / 221.1);

  return {
    object: fly,
    parts,
    setEye(colour) {
      eyeMat.color.set(EYE_COLOURS[colour]);
      // White eyes have no screening pigment: paler and less glossy.
      eyeMat.roughness = colour === 'white' ? 0.5 : 0.32;
    },
    dispose() {
      // Source parts are cached and shared. Dispose only instance-owned geometry
      // and materials when changing activities, keeping those sources reusable.
      const sources = new Set([...sourceGeoms, ...legGeoms]);
      const geometries = new Set();
      const materials = new Set();
      fly.traverse((object) => {
        if (!object.isMesh) return;
        if (!sources.has(object.geometry)) geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
}

export function applyTransform(obj, t) {
  obj.position.fromArray(t.pos);
  obj.rotation.set(...t.rot.map((d) => THREE.MathUtils.degToRad(d)), 'XYZ');
  obj.scale.fromArray(t.scale || [1, 1, 1]);
  if (t.mirror) {
    // Reflect the whole placed part across the plane z = MIDLINE_Z.
    obj.updateMatrix();
    const m = new THREE.Matrix4()
      .makeTranslation(0, 0, 2 * MIDLINE_Z)
      .multiply(new THREE.Matrix4().makeScale(1, 1, -1))
      .multiply(obj.matrix);
    m.decompose(obj.position, obj.quaternion, obj.scale);
  }
}
