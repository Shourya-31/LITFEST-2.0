import * as THREE from 'three';
import { abyssalLandmarks, relics } from './Landmarks';
import type { RelicDefinition } from './types';

export interface WorldAssembly {
  root: THREE.Group;
  landmarkMeshes: Map<string, THREE.Group>;
  relicMeshes: Map<string, THREE.Object3D>;
  animatedLights: THREE.Object3D[];
  causticTime: { value: number };
  swimmingSchools: Array<{ group: THREE.Group; x: number; y: number; z: number; phase: number }>;
  swayingKelp: Array<{ group: THREE.Group; phase: number }>;
}

const rockGeometry = new THREE.SphereGeometry(1, 16, 12);
const rockPositions = rockGeometry.attributes.position;
rockGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(rockPositions.count * 3).fill(1), 3));
for (let index = 0; index < rockPositions.count; index += 1) {
  const x = rockPositions.getX(index);
  const y = rockPositions.getY(index);
  const z = rockPositions.getZ(index);
  const variation = 1 + Math.sin(x * 11 + z * 7) * 0.09 + Math.cos(y * 13 + x * 5) * 0.055;
  rockPositions.setXYZ(index, x * variation, y * variation, z * variation);
}
rockGeometry.computeVertexNormals();
const rockMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.98, vertexColors: true });
const stoneMaterial = new THREE.MeshStandardMaterial({ color: '#637e83', roughness: 0.91, metalness: 0.04 });
const darkStoneMaterial = new THREE.MeshStandardMaterial({ color: '#344f5a', roughness: 0.97 });
const kelpMaterial = new THREE.MeshStandardMaterial({ color: '#347c67', roughness: 0.91, side: THREE.DoubleSide });
const coralMaterials = [
  new THREE.MeshStandardMaterial({ color: '#df8c77', roughness: 0.82 }),
  new THREE.MeshStandardMaterial({ color: '#c17fbb', roughness: 0.79 }),
  new THREE.MeshStandardMaterial({ color: '#e4ba82', roughness: 0.86 }),
  new THREE.MeshStandardMaterial({ color: '#76c8b5', roughness: 0.78 }),
];
const oysterOuterMaterial = new THREE.MeshStandardMaterial({
  color: '#637f91', roughness: 0.42, metalness: 0.12, side: THREE.DoubleSide,
});
const oysterInnerMaterial = new THREE.MeshStandardMaterial({
  color: '#f3cbd2', roughness: 0.28, metalness: 0.06, emissive: '#b37f9c', emissiveIntensity: 0.08, side: THREE.DoubleSide,
});
const branchGeometry = new THREE.CylinderGeometry(0.12, 0.26, 1, 7);
const kelpLeafGeometry = createLeafGeometry();

function createOysterBowlGeometry(width: number, depth: number, height: number, lid = false) {
  const radialSegments = 24;
  const angularSegments = 64;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let radial = 0; radial <= radialSegments; radial += 1) {
    const radius = radial / radialSegments;
    for (let angular = 0; angular <= angularSegments; angular += 1) {
      const angle = (angular / angularSegments) * Math.PI * 2;
      const rib = Math.cos(angle * 12) * 0.035 * radius;
      const x = (width + rib) * radius * Math.cos(angle);
      const z = (depth + rib) * radius * Math.sin(angle);
      const y = lid
        ? height * Math.sqrt(Math.max(0, 1 - radius * radius))
        : height * (radius * radius * 0.9 - 0.42);
      positions.push(x, y, z);
    }
  }

  for (let radial = 0; radial < radialSegments; radial += 1) {
    for (let angular = 0; angular < angularSegments; angular += 1) {
      const a = radial * (angularSegments + 1) + angular;
      const b = a + angularSegments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createOysterRidges(width: number, depth: number, height: number, lid = false) {
  const positions: number[] = [];
  const ridgeCount = 24;
  const segments = 10;
  for (let ridge = 0; ridge < ridgeCount; ridge += 1) {
    const angle = (ridge / ridgeCount) * Math.PI * 2;
    for (let segment = 0; segment < segments; segment += 1) {
      const startRadius = 0.18 + (segment / segments) * 0.78;
      const endRadius = 0.18 + ((segment + 1) / segments) * 0.78;
      for (const radius of [startRadius, endRadius]) {
        const x = width * radius * Math.cos(angle);
        const z = depth * radius * Math.sin(angle);
        const y = lid
          ? height * Math.sqrt(Math.max(0, 1 - radius * radius)) + 0.018
          : height * (radius * radius * 0.9 - 0.42) + 0.018;
        positions.push(x, y, z);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createLeafGeometry() {
  const geometry = new THREE.BufferGeometry();
  const segments = 8;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const width = Math.sin(Math.PI * t) * 0.28;
    const curve = Math.sin(t * Math.PI) * 0.16;
    positions.push(-width, t, curve, width, t, curve);
    if (index < segments) {
      const base = index * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addCoral(parent: THREE.Object3D, x: number, z: number, scale: number, seed: number, y = -9.5) {
  const coral = new THREE.Group();
  coral.position.set(x, y, z);
  coral.scale.setScalar(scale);
  const material = coralMaterials[seed % coralMaterials.length];
  const branches = new THREE.InstancedMesh(branchGeometry, material, 9);
  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  let branchIndex = 0;
  const addBranch = (start: THREE.Vector3, end: THREE.Vector3, radius: number) => {
    const direction = end.clone().sub(start);
    dummy.position.copy(start).addScaledVector(direction, 0.5);
    dummy.scale.set(radius, direction.length(), radius);
    dummy.quaternion.setFromUnitVectors(up, direction.normalize());
    dummy.updateMatrix();
    branches.setMatrixAt(branchIndex, dummy.matrix);
    branchIndex += 1;
  };
  const trunkEnd = new THREE.Vector3(0, 2.2, 0);
  addBranch(new THREE.Vector3(0, 0, 0), trunkEnd, 0.9);

  for (let branch = 0; branch < 4; branch += 1) {
    const angle = branch * Math.PI * 0.5 + seed * 0.37;
    const origin = new THREE.Vector3(Math.cos(angle) * 0.35, 0.75 + (branch % 2) * 0.38, Math.sin(angle) * 0.35);
    const tip = new THREE.Vector3(Math.cos(angle) * (1.35 + (branch % 2) * 0.25), 2.5 + (branch % 3) * 0.3, Math.sin(angle) * (1.35 + (branch % 2) * 0.25));
    addBranch(origin, tip, 0.58);
    addBranch(tip, tip.clone().add(new THREE.Vector3(Math.cos(angle + 0.8) * 0.62, 0.9, Math.sin(angle + 0.8) * 0.62)), 0.38);
  }

  branches.instanceMatrix.needsUpdate = true;
  coral.add(branches);
  parent.add(coral);
}

function addKelp(parent: THREE.Object3D, x: number, z: number, height: number, seed: number) {
  const kelp = new THREE.Group();
  kelp.position.set(x, -9.2, z);
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, height, 7), kelpMaterial);
  spine.position.y = height * 0.5;
  kelp.add(spine);

  const leaves = new THREE.InstancedMesh(kelpLeafGeometry, kelpMaterial, 7);
  const leafTransform = new THREE.Object3D();
  for (let leafIndex = 0; leafIndex < 7; leafIndex += 1) {
    const side = leafIndex % 2 === 0 ? 1 : -1;
    leafTransform.position.set(side * (0.12 + leafIndex * 0.035), height * (0.16 + leafIndex * 0.1), 0);
    leafTransform.rotation.set(0, seed * 0.31, side * (0.55 + (seed % 4) * 0.06));
    leafTransform.scale.set(1.4 + (leafIndex % 3) * 0.2, 2.3 + (seed % 3) * 0.25, 1);
    leafTransform.updateMatrix();
    leaves.setMatrixAt(leafIndex, leafTransform.matrix);
  }

  leaves.instanceMatrix.needsUpdate = true;
  kelp.add(leaves);
  parent.add(kelp);
  return kelp;
}

function addFishSchool(parent: THREE.Object3D, x: number, y: number, z: number, scale: number, phase: number) {
  const school = new THREE.Group();
  const fishMaterial = new THREE.MeshBasicMaterial({ color: '#b7dfe0', transparent: true, opacity: 0.44 });
  const bodyGeometry = new THREE.SphereGeometry(0.42, 10, 7);
  const tailGeometry = new THREE.ConeGeometry(0.22, 0.42, 5);

  for (let index = 0; index < 9; index += 1) {
    const fish = new THREE.Group();
    const body = new THREE.Mesh(bodyGeometry, fishMaterial);
    body.scale.set(1.15, 0.42, 0.42);
    fish.add(body);
    const tail = new THREE.Mesh(tailGeometry, fishMaterial);
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -0.48;
    fish.add(tail);
    fish.position.set((index % 3) * 1.35 - 1.35, Math.sin(index * 1.8) * 0.7, Math.floor(index / 3) * 1.15 - 1.15);
    fish.rotation.y = Math.sin(index * 2.1) * 0.1;
    fish.scale.setScalar(scale * (0.7 + (index % 3) * 0.16));
    school.add(fish);
  }

  school.position.set(x, y, z);
  parent.add(school);
  return { group: school, x, y, z, phase };
}

function addArchive(group: THREE.Group) {
  const columnGeometry = new THREE.CylinderGeometry(0.72, 1.08, 9, 12);
  for (const side of [-1, 1]) {
    for (let index = 0; index < 4; index += 1) {
      const column = new THREE.Mesh(columnGeometry, stoneMaterial);
      column.position.set(side * 5.4, 0, (index - 1.5) * 3.6);
      column.rotation.z = side * (0.04 + index * 0.015);
      group.add(column);
      const capital = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.92, 0.55, 12), darkStoneMaterial);
      capital.position.set(side * 5.4, 4.15, (index - 1.5) * 3.6);
      group.add(capital);
    }
  }

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(12.5, 1.4, 15.2), stoneMaterial);
  lintel.position.set(0, 4.7, 0);
  group.add(lintel);
  for (let index = 0; index < 3; index += 1) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(5.25, 0.65, 10, 32, Math.PI), stoneMaterial);
    arch.position.set(0, 4.4, -5.4 + index * 5.4);
    group.add(arch);
  }

  for (let index = 0; index < 9; index += 1) {
    const tablet = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 2.8 + (index % 3) * 0.45, 1.45),
      index % 2 ? stoneMaterial : darkStoneMaterial
    );
    tablet.position.set(-3.2 + (index % 5) * 1.6, 0.1, -5 + Math.floor(index / 5) * 9);
    tablet.rotation.z = (index % 2 ? -1 : 1) * 0.08;
    group.add(tablet);
  }

  const altar = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.1, 2.2), darkStoneMaterial);
  altar.position.set(0, -3.3, -2);
  group.add(altar);
  for (let index = 0; index < 4; index += 1) {
    addCoral(group, (index - 1.5) * 5.4, 7 + (index % 2) * 2, 0.65 + (index % 2) * 0.18, index + 2, -8.2);
  }
}

function addAmphitheatre(group: THREE.Group) {
  const seatMaterial = stoneMaterial;
  for (let row = 0; row < 5; row += 1) {
    const radius = 6 + row * 2;
    const arc = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.58, 8, 64, Math.PI * 1.35), seatMaterial);
    arc.rotation.x = Math.PI / 2;
    arc.position.set(0, -2.2 + row * 0.82, 0);
    arc.rotation.z = -Math.PI * 0.18;
    group.add(arc);
  }

  const stage = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.1, 0.7, 32), darkStoneMaterial);
  stage.position.set(0, -1.2, -3);
  group.add(stage);

  for (let index = 0; index < 5; index += 1) {
    addCoral(group, -7 + index * 3.5, -8.5, 0.45 + (index % 3) * 0.12, index + 5);
  }
}

function addLighthouse(group: THREE.Group, animatedLights: THREE.Object3D[]) {
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 2.4, 15, 12), stoneMaterial);
  tower.position.y = 5;
  group.add(tower);

  const balcony = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.35, 8, 32), darkStoneMaterial);
  balcony.rotation.x = Math.PI / 2;
  balcony.position.y = 11;
  group.add(balcony);

  const lantern = new THREE.Group();
  lantern.position.y = 13;
  const chamber = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 2.5, 12), new THREE.MeshStandardMaterial({
    color: '#b79b6a', roughness: 0.7, metalness: 0.15, emissive: '#b58f50', emissiveIntensity: 0.13,
  }));
  lantern.add(chamber);
  const lens = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshStandardMaterial({ color: '#ffe1a1', emissive: '#e8aa50', emissiveIntensity: 0.75, roughness: 0.55 })
  );
  lens.scale.set(1.05, 0.8, 1.05);
  lantern.add(lens);
  const beam = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 3.2, 36, 20, 1, true),
    new THREE.MeshBasicMaterial({ color: '#e9c984', transparent: true, opacity: 0.075, side: THREE.DoubleSide, depthWrite: false })
  );
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = -17;
  beam.add(shaft);
  beam.position.y = 13;
  lantern.add(beam);
  group.add(lantern);
  animatedLights.push(beam);
}

function addGateway(group: THREE.Group, animatedLights: THREE.Object3D[]) {
  for (const side of [-1, 1]) {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.8, 13, 12), stoneMaterial);
    pier.position.set(side * 7, 5.6, 0);
    group.add(pier);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 3.2), darkStoneMaterial);
    cap.position.set(side * 7, 12.7, 0);
    group.add(cap);
  }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(7, 1.1, 12, 48, Math.PI), stoneMaterial);
  arch.position.y = 12.8;
  group.add(arch);
  const innerArch = new THREE.Mesh(
    new THREE.TorusGeometry(5.35, 0.12, 8, 48, Math.PI),
    new THREE.MeshStandardMaterial({ color: '#9feeff', emissive: '#55cee8', emissiveIntensity: 0.48, roughness: 0.48 })
  );
  innerArch.position.set(0, 12.8, 0.25);
  group.add(innerArch);
  const gatewayGlow = new THREE.PointLight('#78dff0', 18, 28, 2);
  gatewayGlow.position.set(0, 9, 2);
  group.add(gatewayGlow);
  const capstone = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), stoneMaterial);
  capstone.position.set(0, 20.5, 0);
  group.add(capstone);
  const beacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.9, 1),
    new THREE.MeshStandardMaterial({ color: '#d5f9ff', emissive: '#6fe2f6', emissiveIntensity: 0.5 })
  );
  beacon.position.set(0, 22.2, 0);
  group.add(beacon);
  animatedLights.push(innerArch);
}

function addGalleon(group: THREE.Group) {
  const hullWood = new THREE.MeshStandardMaterial({ color: '#55443a', roughness: 0.96 });
  const timber = new THREE.MeshStandardMaterial({ color: '#77604a', roughness: 0.92 });
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), hullWood);
  hull.scale.set(10, 2.2, 3.25);
  hull.position.y = 0;
  group.add(hull);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.9, 5.1), timber);
  deck.position.y = 2;
  group.add(deck);
  const prow = new THREE.Mesh(new THREE.ConeGeometry(2.2, 5, 6), hullWood);
  prow.rotation.z = -Math.PI / 2;
  prow.position.set(-11.2, 0.1, 0);
  group.add(prow);
  const stern = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.3, 4.2), timber);
  stern.position.set(8.1, 2.4, 0);
  group.add(stern);
  for (let index = 0; index < 7; index += 1) {
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 6.2, 7), timber);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(-7 + index * 2.15, 0.15, 0);
    group.add(beam);
  }
  for (const mastPosition of [-4.8, 2.4]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.42, 14, 8), timber);
    mast.position.set(mastPosition, 8.5, 0);
    group.add(mast);
    const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 7.5, 7), timber);
    yard.rotation.z = Math.PI / 2;
    yard.position.set(mastPosition, 10, 0);
    group.add(yard);
    const sail = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 5.5),
      new THREE.MeshStandardMaterial({ color: '#b7b8a2', roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
    );
    sail.position.set(mastPosition, 7, 0.12);
    group.add(sail);
  }
  for (const side of [-1, 1]) {
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.3), new THREE.MeshStandardMaterial({
      color: '#8d7045', roughness: 0.72, metalness: 0.18,
    }));
    chest.position.set(side * 3, 2.8, -1.45);
    group.add(chest);
  }
}

function addOracle(group: THREE.Group) {
  const patina = new THREE.MeshStandardMaterial({ color: '#668a83', roughness: 0.84, metalness: 0.12 });
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 2.2, 16), darkStoneMaterial);
  pedestal.position.y = -0.7;
  group.add(pedestal);
  const robe = new THREE.Mesh(new THREE.ConeGeometry(3.1, 8, 12), stoneMaterial);
  robe.position.y = 4.1;
  group.add(robe);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 2.15, 4.6, 12), patina);
  torso.position.y = 7.2;
  group.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.25, 16, 12), patina);
  head.position.set(0, 10.7, -0.15);
  group.add(head);
  const crown = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.22, 8, 24), stoneMaterial);
  crown.position.set(0, 11.55, -0.1);
  group.add(crown);
  const armGeometry = new THREE.CylinderGeometry(0.62, 0.85, 5.8, 9);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(armGeometry, patina);
    arm.position.set(side * 2.3, 7.9, -0.15);
    arm.rotation.z = side * -0.38;
    group.add(arm);
    const wrist = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), patina);
    wrist.position.set(side * 4.1, 8.2, -0.15);
    group.add(wrist);
  }
  const trident = new THREE.Group();
  trident.position.set(4.3, 7.7, 0.1);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 12.5, 8), new THREE.MeshStandardMaterial({
    color: '#bd9b5f', roughness: 0.48, metalness: 0.62,
  }));
  trident.add(shaft);
  for (let tine = -1; tine <= 1; tine += 1) {
    const prong = new THREE.Mesh(new THREE.ConeGeometry(0.24, 2.4, 7), new THREE.MeshStandardMaterial({
      color: '#d8bd82', roughness: 0.44, metalness: 0.58,
    }));
    prong.position.set(tine * 0.65, 7.2 - Math.abs(tine) * 0.45, 0);
    trident.add(prong);
    if (tine !== 0) {
      const tineStem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 2.2, 7), patina);
      tineStem.position.set(tine * 0.4, 6.5, 0);
      tineStem.rotation.z = tine * 0.3;
      trident.add(tineStem);
    }
  }
  group.add(trident);
  const crownGlow = new THREE.PointLight('#9de9de', 15, 25, 2);
  crownGlow.position.set(0, 12.5, 2);
  group.add(crownGlow);
}

function addFestivalBeacon(group: THREE.Group, accent: string, animatedLights: THREE.Object3D[]) {
  const support = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.25, 10.2, 20), stoneMaterial);
  support.position.y = 5.1;
  group.add(support);
  for (const y of [0.5, 9.7]) {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(y === 0.5 ? 3.1 : 2.4, 0.22, 8, 32), darkStoneMaterial);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = y;
    group.add(collar);
  }
  const display = new THREE.Group();
  display.position.y = 10.5;
  group.add(display);

  const pedestal = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 6.3, 1.5, 32), darkStoneMaterial);
  base.position.y = 0.55;
  pedestal.add(base);
  const upperStep = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 5, 0.8, 32), stoneMaterial);
  upperStep.position.y = 1.65;
  pedestal.add(upperStep);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 4.2, 0.38, 32), oysterInnerMaterial);
  top.position.y = 2.24;
  pedestal.add(top);
  display.add(pedestal);

  const lowerShell = new THREE.Mesh(createOysterBowlGeometry(4.1, 2.65, 1.55), oysterOuterMaterial);
  lowerShell.position.set(0, 2.6, 0.05);
  display.add(lowerShell);
  const lowerRidges = new THREE.LineSegments(
    createOysterRidges(3.82, 2.42, 1.42),
    new THREE.LineBasicMaterial({ color: '#ffe7db', transparent: true, opacity: 0.42 })
  );
  lowerRidges.position.set(0, 2.72, 0.05);
  display.add(lowerRidges);
  const innerBowl = new THREE.Mesh(createOysterBowlGeometry(3.82, 2.42, 1.42), oysterInnerMaterial);
  innerBowl.position.set(0, 2.72, 0.05);
  display.add(innerBowl);

  const raisedShell = new THREE.Group();
  raisedShell.position.set(0, 5.05, -1.35);
  raisedShell.rotation.x = 2.55;
  const lid = new THREE.Mesh(createOysterBowlGeometry(4.25, 2.75, 2.6, true), oysterOuterMaterial);
  raisedShell.add(lid);
  const lidRidges = new THREE.LineSegments(
    createOysterRidges(4.25, 2.75, 2.6, true),
    new THREE.LineBasicMaterial({ color: '#bed3d9', transparent: true, opacity: 0.52 })
  );
  raisedShell.add(lidRidges);
  const innerLid = new THREE.Mesh(createOysterBowlGeometry(3.9, 2.48, 2.35, true), oysterInnerMaterial);
  innerLid.position.y = -0.07;
  raisedShell.add(innerLid);
  const hinge = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.13, 10, 24), oysterOuterMaterial);
  hinge.position.set(0, 0.1, -2.55);
  raisedShell.add(hinge);
  display.add(raisedShell);

  const pearlMaterial = new THREE.MeshStandardMaterial({
    color: '#fff3e9', roughness: 0.16, metalness: 0.12, emissive: '#83e9ff', emissiveIntensity: 0.48,
  });
  const pearl = new THREE.Mesh(new THREE.SphereGeometry(1.08, 32, 24), pearlMaterial);
  pearl.position.set(0, 4.2, 0.7);
  pearl.scale.set(1, 0.94, 0.96);
  display.add(pearl);
  const pearlHalo = new THREE.Mesh(
    new THREE.SphereGeometry(1.72, 24, 16),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false })
  );
  pearlHalo.position.copy(pearl.position);
  display.add(pearlHalo);
  const pearlLight = new THREE.PointLight(accent, 18, 26, 2);
  pearlLight.position.set(0, 5.1, 1.8);
  display.add(pearlLight);
  animatedLights.push(pearl, pearlHalo);

  const shellRidgeGeometry = new THREE.TorusGeometry(1, 0.035, 5, 48);
  for (let ridgeIndex = 0; ridgeIndex < 5; ridgeIndex += 1) {
    const ridge = new THREE.Mesh(shellRidgeGeometry, oysterInnerMaterial);
    ridge.scale.set(0.55 + ridgeIndex * 0.12, 0.82 + ridgeIndex * 0.1, 1);
    ridge.position.set(0, 2.42 + ridgeIndex * 0.09, 0.1);
    ridge.rotation.x = Math.PI / 2;
    display.add(ridge);
  }

  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2;
    const coralScale = 0.5 + (index % 3) * 0.16;
    addCoral(display, Math.cos(angle) * 6.1, Math.sin(angle) * 4.8, coralScale, index + 2, 0.1);
  }

  const orbit = new THREE.Group();
  orbit.position.y = 7.8;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.06, 8, 48), new THREE.MeshStandardMaterial({
    color: '#d1b783', roughness: 0.65, metalness: 0.35, emissive: '#715d38', emissiveIntensity: 0.12,
  }));
  ring.rotation.x = Math.PI / 2.6;
  orbit.add(ring);
  display.add(orbit);
  animatedLights.push(orbit);
}

export function createUnderwaterWorld(): WorldAssembly {
  const root = new THREE.Group();
  const landmarkMeshes = new Map<string, THREE.Group>();
  const relicMeshes = new Map<string, THREE.Object3D>();
  const animatedLights: THREE.Object3D[] = [];
  const causticTime = { value: 0 };
  const swayingKelp: Array<{ group: THREE.Group; phase: number }> = [];
  const swimmingSchools = [
    addFishSchool(root, -48, 12, -58, 0.54, 0),
    addFishSchool(root, 51, 16, -94, 0.72, 2.1),
    addFishSchool(root, 65, 9, 32, 0.46, 4.4),
  ];

  const terrain = new THREE.PlaneGeometry(360, 360, 132, 132);
  const positions = terrain.attributes.position;
  const colors: number[] = [];
  const deep = new THREE.Color('#153e4a');
  const shelf = new THREE.Color('#3d686b');
  const crest = new THREE.Color('#789284');
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = -positions.getY(index);
    const hillOne = Math.exp(-((x + 36) ** 2 / 470 + (z - 14) ** 2 / 180)) * 7.5;
    const hillTwo = Math.exp(-((x - 28) ** 2 / 550 + (z + 34) ** 2 / 220)) * 5.2;
    const shelfRidge = Math.exp(-((x - 58) ** 2 / 950 + (z + 10) ** 2 / 180)) * 4.2;
    const trench = -Math.exp(-((x + 48) ** 2 / 820 + (z - 42) ** 2 / 460)) * 3.2;
    const ridge = Math.sin(x * 0.12 + Math.cos(z * 0.08)) * 1.05 + Math.cos(z * 0.16) * 0.55;
    const height = hillOne + hillTwo + shelfRidge + trench + ridge + Math.sin(x * 0.31 + z * 0.17) * 0.28;
    positions.setZ(index, height);
    const color = deep.clone().lerp(shelf, THREE.MathUtils.clamp((height + 1.2) / 7, 0, 0.75));
    if (height > 4.5) color.lerp(crest, (height - 4.5) * 0.13);
    colors.push(color.r, color.g, color.b);
  }
  terrain.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrain.computeVertexNormals();
  const terrainMesh = new THREE.Mesh(
    terrain,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.02 })
  );
  const terrainMaterial = terrainMesh.material as THREE.MeshStandardMaterial;
  terrainMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uCausticTime = causticTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vAbyssalWorldPosition;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvAbyssalWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;'
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vAbyssalWorldPosition;\nuniform float uCausticTime;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
          vec2 causticUv = vAbyssalWorldPosition.xz * 0.10;
          float causticA = sin(causticUv.x * 12.0 + sin(causticUv.y * 4.0 + uCausticTime * 0.10) * 1.7);
          float causticB = sin(causticUv.y * 11.0 - sin(causticUv.x * 3.5 - uCausticTime * 0.08) * 1.5);
          float causticC = sin((causticUv.x + causticUv.y) * 7.0 + uCausticTime * 0.05);
          float caustics = pow(max(0.0, causticA * causticB + causticC * 0.18), 7.0);
          diffuseColor.rgb += vec3(0.08, 0.3, 0.34) * caustics * 0.22;`
      );
  };
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.position.y = -11.5;
  terrainMesh.receiveShadow = true;
  root.add(terrainMesh);

  const rockInstances = new THREE.InstancedMesh(rockGeometry, rockMaterial, 24);
  const dummy = new THREE.Object3D();
  const rockColors = ['#54747b', '#6a8178', '#476b79', '#8a8270'].map((color) => new THREE.Color(color));
  for (let index = 0; index < 24; index += 1) {
    const angle = index * 2.399963 + Math.sin(index * 4.7) * 0.24;
    const radius = 54 + (index % 6) * 8.8 + Math.sin(index * 12.2) * 3.8;
    let x = Math.cos(angle) * radius + Math.sin(index * 8.3) * 5.5;
    const z = Math.sin(angle) * radius + Math.cos(index * 7.1) * 6.5;
    if (Math.abs(x) < 37 && z > -75 && z < 32) x += index % 2 === 0 ? -40 : 40;
    const scale = 0.68 + ((index * 17) % 12) * 0.14;
    dummy.position.set(x, -10.3 + (index % 4) * 0.32, z);
    dummy.rotation.set(index * 0.71, index * 1.23, index * 0.47);
    dummy.scale.set(scale * (1 + (index % 3) * 0.25), scale, scale * (0.75 + (index % 4) * 0.15));
    dummy.updateMatrix();
    rockInstances.setMatrixAt(index, dummy.matrix);
    rockInstances.setColorAt(index, rockColors[index % rockColors.length]);
  }
  rockInstances.instanceMatrix.needsUpdate = true;
  root.add(rockInstances);

  const distantOutcrops = new THREE.InstancedMesh(rockGeometry, rockMaterial, 24);
  for (let index = 0; index < 24; index += 1) {
    const angle = index * 2.399963;
    const radius = 124 + (index % 7) * 7 + Math.sin(index * 6.2) * 5;
    const scale = 5.5 + (index % 4) * 2.2;
    dummy.position.set(Math.cos(angle) * radius, -9.8, Math.sin(angle) * radius);
    dummy.rotation.set(index * 0.32, index * 0.71, index * 0.17);
    dummy.scale.set(scale * 1.4, scale, scale * (0.8 + (index % 3) * 0.25));
    dummy.updateMatrix();
    distantOutcrops.setMatrixAt(index, dummy.matrix);
    distantOutcrops.setColorAt(index, rockColors[(index + 1) % rockColors.length]);
  }
  distantOutcrops.instanceMatrix.needsUpdate = true;
  if (distantOutcrops.instanceColor) distantOutcrops.instanceColor.needsUpdate = true;
  root.add(distantOutcrops);

  const shaftGeometry = new THREE.ConeGeometry(1.9, 28, 18, 1, true);
  const shaftMaterial = new THREE.MeshBasicMaterial({
    color: '#a5eff1',
    transparent: true,
    opacity: 0.032,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  for (let index = 0; index < 4; index += 1) {
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.set(-30 + index * 19, 14, -14 - (index % 2) * 24);
    shaft.rotation.z = 0.13 + (index % 3) * 0.035;
    shaft.rotation.x = index % 2 === 0 ? -0.07 : 0.07;
    root.add(shaft);
    animatedLights.push(shaft);
  }

  for (let index = 0; index < 11; index += 1) {
    const angle = index * 2.4;
    const radius = 28 + (index % 4) * 11;
    addCoral(root, Math.cos(angle) * radius, Math.sin(angle) * radius, 0.6 + (index % 4) * 0.24, index);
  }
  for (let index = 0; index < 12; index += 1) {
    const angle = index * 2.399;
    const kelp = addKelp(root, Math.cos(angle) * (34 + (index % 5) * 8), Math.sin(angle) * (30 + (index % 4) * 7), 7 + (index % 4) * 1.7, index);
    kelp.rotation.y = angle;
    swayingKelp.push({ group: kelp, phase: index * 0.8 });
  }

  for (const landmark of abyssalLandmarks) {
    const group = new THREE.Group();
    group.position.set(landmark.position[0], -8.8, landmark.position[2]);
    group.rotation.y = Math.atan2(-landmark.position[0], -landmark.position[2]);

    const foundation = new THREE.Mesh(new THREE.CylinderGeometry(7, 8, 1.1, 24), darkStoneMaterial);
    foundation.position.y = 0;
    group.add(foundation);

    if (landmark.kind === 'gateway') addGateway(group, animatedLights);
    if (landmark.kind === 'archive') addArchive(group);
    if (landmark.kind === 'amphitheatre') addAmphitheatre(group);
    if (landmark.kind === 'lighthouse') addLighthouse(group, animatedLights);
    if (landmark.kind === 'galleon') addGalleon(group);
    if (landmark.kind === 'oracle') addOracle(group);
    if (landmark.kind === 'festival') addFestivalBeacon(group, landmark.accent, animatedLights);

    const marker = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.04, 8, 24),
      new THREE.MeshStandardMaterial({ color: landmark.accent, emissive: landmark.accent, emissiveIntensity: 0.15, roughness: 0.62 })
    );
    marker.name = 'discoveryMarker';
    marker.position.set(0, landmark.kind === 'lighthouse' ? 15.5 : 1.8, 0);
    marker.rotation.x = Math.PI / 2;
    marker.visible = false;
    group.add(marker);

    landmarkMeshes.set(landmark.id, group);
    root.add(group);
  }

  for (const relic of relics as RelicDefinition[]) {
    const [x, y, z] = relic.position;
    const relicGroup = new THREE.Group();
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.75, 1),
      new THREE.MeshStandardMaterial({ color: relic.color, roughness: 0.45, metalness: 0.13, emissive: relic.color, emissiveIntensity: 0.12 })
    );
    shell.scale.set(0.8, 1.25, 0.55);
    relicGroup.add(shell);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.035, 6, 24),
      new THREE.MeshBasicMaterial({ color: relic.color, transparent: true, opacity: 0.52 })
    );
    halo.rotation.x = Math.PI / 2.5;
    relicGroup.add(halo);
    relicGroup.position.set(x, y, z);
    relicMeshes.set(relic.id, relicGroup);
    root.add(relicGroup);
  }

  return { root, landmarkMeshes, relicMeshes, animatedLights, causticTime, swimmingSchools, swayingKelp };
}
