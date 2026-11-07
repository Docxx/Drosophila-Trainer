// Legs in the knocked-out pose. Each printed leg is split at its joints (coxa,
// femur, tibia, tarsus) and each segment is turned to a fixed direction, so the
// legs hang stiffly down and back under the body like a fly out on CO2.

import * as THREE from 'three';

// Joint points in each leg file's own coordinates (peg, hip, knee, ankle, claw),
// read off the flat-printed meshes.
export const LEG_JOINTS = {
  leg1_l: [[125.83, 14.38, 43.07], [100.7, 14, 3.6], [75.4, 14, 47.3], [50.4, 14, 16.1], [2.38, 12.37, 7.16]],
  leg2_l: [[130.71, 15.75, 18.18], [111, 15, 3.6], [101.3, 15, 58.9], [61, 15, 28.6], [0.9, 15.89, 7.17]],
  leg3_l: [[168.42, 14.14, 22.33], [142.3, 14, 3.6], [100.4, 14, 57.1], [64.6, 14, 24.1], [0.67, 12.01, 6.35]],
};

// Where each left leg's coxa peg seats (fly frame) and which way its coxa hangs.
// Mid/hind sockets are the square holes in the pleura (seated ~4 units deep so
// the coxa top sits flush). The foreleg's long coxa rises through the open floor
// of the prothorax, behind the head. Coxae point down and a little outward so
// left and right legs never cross under the body.
// `sink` pushes the coxa further in along its own axis so the peg and the flat
// tab beside it (both meant to be hidden in the socket) don't show.
export const LEG_SEATS = {
  leg1_l: { socket: [59.3, 66, 20], yaw: 0, coxa: [-0.35, -0.9, 0.28], sink: 18 },
  leg2_l: { socket: [86.32, 49.45, 21.11], yaw: 0, coxa: [0.1, -1, 0.3], sink: 9 },
  leg3_l: { socket: [101.34, 49.58, 18.98], yaw: 0, coxa: [0.3, -1, 0.3], sink: 9 },
};

// Knocked-out pose: direction of each segment (coxa, femur, tibia, tarsus) in the
// fly frame (x = toward the tail, y = dorsal, z = the fly's left).
// Legs sweep back toward the tail and stay close together, tarsi nearly parallel
// to the body. The coxa (null) stays as printed so it stays seated in its socket;
// the femur, tibia and tarsus are turned.
export const KO_POSE = {
  leg1_l: [null, [0.35, -1, 0.22], [1, -0.75, 0.1], [1, -0.3, 0.04]],
  leg2_l: [null, [0.75, -1, 0.22], [1, -0.35, 0.1], [1, -0.1, 0.04]],
  leg3_l: [null, [1, -0.75, 0.2], [1, -0.25, 0.08], [1, -0.05, 0.03]],
};

// Each printed coxa is made of two halves with a 1.6-unit slit between them (two
// parallel flat faces, found in the meshes). Closed at load so no seam shows.
// File coordinates: slit floor/ceiling heights (y) and its x/z extent.
export const LEG_SLITS = {
  leg1_l: { floor: 13.5, ceil: 15.1, x: [106.9, 126.1], z: [23.2, 44] },
  leg2_l: { floor: 14.5, ceil: 16.1, x: [102, 131], z: [2.6, 23.9] },
  leg3_l: { floor: 13.4, ceil: 15.0, x: [148.4, 168.7], z: [7.4, 24.1] },
};

/** Close a leg's coxa slit (file coordinates, before any transform). Mutates geometry. */
export function closeSlit(geometry, id) {
  const s = LEG_SLITS[id];
  const gap = s.ceil - s.floor;
  const FADE = 4;
  const inside = (v, [lo, hi]) => THREE.MathUtils.smoothstep(v, lo - FADE, lo) * (1 - THREE.MathUtils.smoothstep(v, hi, hi + FADE));
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < s.ceil - 0.05) continue;
    const w = inside(pos.getX(i), s.x) * inside(pos.getZ(i), s.z);
    if (w > 0) pos.setY(i, y - gap * w);
  }
  pos.needsUpdate = true;
  return geometry;
}

/** Matrix taking leg-file coordinates into the fly frame, coxa peg in its socket. */
export function legRestMatrix(id) {
  const seat = LEG_SEATS[id];
  const peg = new THREE.Vector3(...LEG_JOINTS[id][0]);
  // File +x (peg axis) -> up, file +z (the way the knee points) -> outward.
  const R = new THREE.Matrix4()
    .makeRotationY(THREE.MathUtils.degToRad(seat.yaw))
    .multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
  if (seat.coxa) {
    // Swing the whole leg about its peg so the coxa hangs the given way.
    const hip = new THREE.Vector3(...LEG_JOINTS[id][1]);
    const restCoxa = hip.applyMatrix4(R).sub(peg.clone().applyMatrix4(R)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(restCoxa, new THREE.Vector3(...seat.coxa).normalize());
    R.premultiply(new THREE.Matrix4().makeRotationFromQuaternion(q));
  }
  const p = peg.clone().applyMatrix4(R);
  const target = new THREE.Vector3(...seat.socket);
  if (seat.sink) target.addScaledVector(new THREE.Vector3(...(seat.coxa || [0, -1, 0])).normalize(), -seat.sink);
  return new THREE.Matrix4().makeTranslation(target.x - p.x, target.y - p.y, target.z - p.z).multiply(R);
}

function closestOnSegment(p, a, b) {
  const ab = b.clone().sub(a);
  const t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1);
  return { t, d: a.clone().addScaledVector(ab, t).distanceTo(p) };
}

/**
 * Re-pose a leg. `geometry` and `joints` are in the fly frame at the rest pose;
 * `dirs` gives each segment's new direction. Each vertex follows the segment it
 * belongs to, blended across joints so the bends stay smooth. Mutates geometry.
 */
export function poseLeg(geometry, joints, dirs) {
  const restDir = [0, 1, 2, 3].map((k) => joints[k + 1].clone().sub(joints[k]).normalize());
  // Chain the segments out from the fixed coxa peg.
  const posed = [joints[0].clone()];
  const turn = [];
  for (let k = 0; k < 4; k++) {
    const len = joints[k].distanceTo(joints[k + 1]);
    const dir = dirs[k] ? new THREE.Vector3(...dirs[k]).normalize() : restDir[k].clone();
    turn.push(new THREE.Quaternion().setFromUnitVectors(restDir[k], dir));
    posed.push(posed[k].clone().addScaledVector(dir, len));
  }
  const move = (v, k) => v.clone().sub(joints[k]).applyQuaternion(turn[k]).add(posed[k]);
  // Across joint k, ease the rotation itself around the joint (k-1 -> k), so the
  // surface bends like a hinge instead of collapsing and cracking.
  const bend = (v, k, t) => v.clone().sub(joints[k]).applyQuaternion(turn[k - 1].clone().slerp(turn[k], t)).add(posed[k]);

  // Each joint is split by the plane that bisects the two segments meeting there,
  // so thick parts (the coxa, the femur's base) can't be claimed by the wrong bone.
  const planes = [1, 2, 3].map((k) => restDir[k - 1].clone().add(restDir[k]).normalize());
  const NEAR = 22; // how close to a joint the plane decides (print units)
  const BLEND = 7; // soft band either side of the plane

  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Coarse: nearest segment.
    let seg = 0;
    let bestD = Infinity;
    for (let s = 0; s < 4; s++) {
      const { d } = closestOnSegment(v, joints[s], joints[s + 1]);
      if (d < bestD) {
        bestD = d;
        seg = s;
      }
    }
    // Fine: near a joint, the bisecting plane decides and the bend is eased.
    let out = null;
    for (let k = 1; k <= 3; k++) {
      if ((seg !== k - 1 && seg !== k) || v.distanceTo(joints[k]) > NEAR) continue;
      const s = v.clone().sub(joints[k]).dot(planes[k - 1]);
      out = bend(v, k, THREE.MathUtils.smoothstep(s, -BLEND, BLEND));
      break;
    }
    if (!out) out = move(v, seg);
    pos.setXYZ(i, out.x, out.y, out.z);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}
