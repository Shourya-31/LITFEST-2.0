import * as THREE from 'three';
import { abyssalLandmarks, relics } from './Landmarks';
import { createArtifact } from './ArtifactFactory';
import type { RelicDefinition } from './types';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import plantPackUrl from '../../../assets/media/underwater_plant_pack.glb';
import whaleUrl from '../../../assets/media/blue_whale_-_textured.glb';
import columnUrl from '../../../assets/media/greek_underwater_column_2.glb';
import schoolOfFishUrl from '../../../assets/media/school_of_fish.glb';
import wreckedShipUrl from '../../../assets/media/wrecked_ship.glb';
import sharkUrl from '../../../assets/media/shark.glb';
import aboutImg from '../../../assets/media/about_clean.png';
import scheduleImg from '../../../assets/media/schedule_clean.png';
import nemoImg from '../../../assets/media/nemo.png';

export interface WhaleController {
  group: THREE.Group;
  mixer?: THREE.AnimationMixer;
  centerX: number;
  centerY: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase?: number;
  scale?: number;
}

export interface FishSchoolController {
  group: THREE.Group;
  mixer?: THREE.AnimationMixer;
  centerX: number;
  centerY: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  scale: number;
  verticalAmplitude?: number;
  verticalFrequency?: number;
}

export interface SharkController {
  group: THREE.Group;
  mixer?: THREE.AnimationMixer;
  centerX: number;
  centerY: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  scale?: number;
  verticalAmplitude?: number;
  verticalFrequency?: number;
}

export interface WorldAssembly {
  root: THREE.Group;
  landmarkMeshes: Map<string, THREE.Group>;
  artifactMeshes: Map<string, THREE.Group>;
  animatedLights: THREE.Object3D[];
  causticTime: { value: number };
  swimmingSchools: Array<{ group: THREE.Group; x: number; y: number; z: number; phase: number }>;
  swayingKelp: Array<{ group: THREE.Group; phase: number }>;
  blueWhales?: WhaleController[];
  fishSchools?: FishSchoolController[];
  sharks?: SharkController[];
  nemoSwimmers?: Array<{
    group: THREE.Group;
    centerX: number;
    centerY: number;
    centerZ: number;
    radiusX: number;
    radiusZ: number;
    speed: number;
    phase: number;
    scale: number;
  }>;
}

function loadTextureSafely(url: string): THREE.Texture | null {
  if (typeof window === 'undefined') return null;
  try {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  } catch {
    return null;
  }
}

function getTerrainHeight(x: number, z: number): number {
  const hillOne = Math.exp(-((x + 36) ** 2 / 470 + (z - 14) ** 2 / 180)) * 7.5;
  const hillTwo = Math.exp(-((x - 28) ** 2 / 550 + (z + 34) ** 2 / 220)) * 5.2;
  const shelfRidge = Math.exp(-((x - 58) ** 2 / 950 + (z + 10) ** 2 / 180)) * 4.2;
  const trench = -Math.exp(-((x + 48) ** 2 / 820 + (z - 42) ** 2 / 460)) * 3.2;
  const ridge = Math.sin(x * 0.12 + Math.cos(z * 0.08)) * 1.05 + Math.cos(z * 0.16) * 0.55;
  const height = hillOne + hillTwo + shelfRidge + trench + ridge + Math.sin(x * 0.31 + z * 0.17) * 0.28;
  return -11.5 + height;
}

function loadUnderwaterPlants(parent: THREE.Group) {
  if (typeof window === 'undefined') return;
  try {
    const loader = new GLTFLoader();
    loader.load(
      plantPackUrl,
      (gltf) => {
        gltf.scene.updateMatrixWorld(true);

        const meshInfos: Array<{ mesh: THREE.Mesh; matrix: THREE.Matrix4 }> = [];
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.roughness = 0.58;
                  mat.metalness = 0.12;
                  mat.emissive = new THREE.Color('#0d3e48');
                  mat.emissiveIntensity = 0.25;
                }
              });
            }
            meshInfos.push({ mesh: child, matrix: child.matrixWorld.clone() });
          }
        });

        if (meshInfos.length === 0) return;

        // Generate plant clusters covering ~40% of the seabed surface
        const CLUSTER_COUNT = 240;
        const dummy = new THREE.Object3D();
        const instanceMatrix = new THREE.Matrix4();

        // Landmark exclusion zones to keep immediate interiors clear
        const landmarkCenters = abyssalLandmarks.map((lm) => ({
          x: lm.position[0],
          z: lm.position[2],
          radius: lm.kind === 'galleon' ? 10 : 7.2,
        }));

        const positions: Array<{ x: number; y: number; z: number; scale: number; rotY: number }> = [];

        // Golden-ratio spiral with clustered Poisson-like spread across -130 to +130
        for (let i = 0; i < CLUSTER_COUNT * 2 && positions.length < CLUSTER_COUNT; i += 1) {
          const angle = i * 2.399963 + Math.sin(i * 3.7) * 0.45;
          const radius = Math.sqrt((i + 1) / (CLUSTER_COUNT * 2)) * 135;
          const x = Math.cos(angle) * radius + Math.sin(i * 1.7) * 8;
          const z = Math.sin(angle) * radius + Math.cos(i * 2.3) * 8;

          // Keep interiors of structures uncluttered
          const nearLandmark = landmarkCenters.some(
            (lm) => (x - lm.x) ** 2 + (z - lm.z) ** 2 < lm.radius ** 2
          );
          if (nearLandmark) continue;

          // Anchor directly onto the seabed terrain surface
          const y = getTerrainHeight(x, z);
          // Scale variation: from 0.20 to 0.36
          const scale = 0.2 + ((i * 7) % 17) * 0.01;
          const rotY = (i * 1.618) % (Math.PI * 2);

          positions.push({ x, y, z, scale, rotY });
        }

        const count = positions.length;

        // InstancedMesh rendering: single draw call per plant species for high performance
        for (const { mesh, matrix } of meshInfos) {
          const instanced = new THREE.InstancedMesh(mesh.geometry, mesh.material, count);
          instanced.castShadow = true;
          instanced.receiveShadow = true;

          for (let i = 0; i < count; i += 1) {
            const pt = positions[i];
            dummy.position.set(pt.x, pt.y, pt.z);
            dummy.scale.setScalar(pt.scale);
            dummy.rotation.set(0, pt.rotY, 0);
            dummy.updateMatrix();

            instanceMatrix.multiplyMatrices(dummy.matrix, matrix);
            instanced.setMatrixAt(i, instanceMatrix);
          }

          instanced.instanceMatrix.needsUpdate = true;
          parent.add(instanced);
        }
      },
      undefined,
      (err) => {
        console.warn('Failed to load underwater plant pack 3D model:', err);
      }
    );
  } catch (err) {
    console.warn('GLTFLoader error:', err);
  }
}


function loadGreekColumns(parent: THREE.Group) {
  if (typeof window === 'undefined') return;
  try {
    const loader = new GLTFLoader();
    loader.load(
      columnUrl,
      (gltf) => {
        gltf.scene.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const minY = box.min.y;

        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = true;
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.roughness = 0.72;
                  mat.metalness = 0.08;
                  mat.emissive = new THREE.Color('#0d3b48');
                  mat.emissiveIntensity = 0.24;
                }
              });
            }
          }
        });

        // 4 Monumental Greek Ruin Columns
        const columnLocations = [
          // Gateway portal left column (grand entry)
          { x: -8.5, z: -10, scale: 0.025, rotY: 0.3, rotZ: 0.04, rotX: 0 },
          // Gateway portal right column
          { x: 8.5, z: -10, scale: 0.026, rotY: 1.8, rotZ: -0.03, rotX: 0.02 },
          // Temple of Atlantis ruined colonnade (partially tilted)
          { x: -30, z: -42, scale: 0.027, rotY: 1.1, rotZ: 0.08, rotX: -0.05 },
          // Sunken Amphitheatre ancient column
          { x: -22, z: 46, scale: 0.025, rotY: 2.5, rotZ: -0.06, rotX: 0.04 },
        ];

        for (const pt of columnLocations) {
          const pivot = new THREE.Group();
          const clone = gltf.scene.clone(true);
          clone.position.set(-center.x, -minY, -center.z);
          pivot.add(clone);

          const y = getTerrainHeight(pt.x, pt.z);
          pivot.position.set(pt.x, y, pt.z);
          pivot.scale.setScalar(pt.scale);
          pivot.rotation.set(pt.rotX, pt.rotY, pt.rotZ);

          const columnGlow = new THREE.PointLight('#7dd3fc', 1.2, 14);
          columnGlow.position.set(0, 3, 0);
          pivot.add(columnGlow);

          parent.add(pivot);
        }
      },
      undefined,
      (err) => {
        console.warn('Failed to load greek underwater column 3D model:', err);
      }
    );
  } catch (err) {
    console.warn('GLTFLoader error (greek column):', err);
  }
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

  const aboutTexture = loadTextureSafely(aboutImg);
  if (aboutTexture) {
    const monolithFrame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.8, 0.4), darkStoneMaterial);
    monolithFrame.position.set(0, 0.5, -2);
    group.add(monolithFrame);

    const muralMat = new THREE.MeshStandardMaterial({
      map: aboutTexture,
      transparent: true,
      roughness: 0.35,
      emissive: '#ffffff',
      emissiveIntensity: 0.22,
      side: THREE.DoubleSide,
    });
    const mural = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.5), muralMat);
    mural.position.set(0, 0.5, -1.81);
    group.add(mural);

    const backMural = mural.clone();
    backMural.position.set(0, 0.5, -2.19);
    backMural.rotation.y = Math.PI;
    group.add(backMural);

    const tabletLight = new THREE.PointLight('#7dd3fc', 1.8, 10);
    tabletLight.position.set(0, 0.5, -0.6);
    group.add(tabletLight);
  }

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
  const beaconLight = new THREE.PointLight('#ffe1a1', 3.5, 45);
  beaconLight.position.set(0, 13, 0);
  lantern.add(beaconLight);
  group.add(lantern);

  const scheduleTexture = loadTextureSafely(scheduleImg);
  if (scheduleTexture) {
    const scheduleMonolith = new THREE.Group();
    scheduleMonolith.position.set(4.5, 1.8, 4.5);
    scheduleMonolith.rotation.y = -Math.PI / 4;

    const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.2, 0.45), darkStoneMaterial);
    scheduleMonolith.add(baseFrame);

    const scheduleMat = new THREE.MeshStandardMaterial({
      map: scheduleTexture,
      transparent: true,
      roughness: 0.32,
      emissive: '#ffd580',
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide,
    });
    const front = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 4.8), scheduleMat);
    front.position.z = 0.24;
    scheduleMonolith.add(front);

    const back = front.clone();
    back.position.z = -0.24;
    back.rotation.y = Math.PI;
    scheduleMonolith.add(back);

    const scheduleLight = new THREE.PointLight('#fbbf24', 2.2, 12);
    scheduleLight.position.set(0, 0.5, 1.2);
    scheduleMonolith.add(scheduleLight);

    group.add(scheduleMonolith);
  }
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

function loadWreckedShip(parent: THREE.Group) {
  if (typeof window === 'undefined') return;
  try {
    const loader = new GLTFLoader();
    loader.load(
      wreckedShipUrl,
      (gltf) => {
        gltf.scene.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const minY = box.min.y;

        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = true;
            if (child.material) {
              const oldMat = child.material as THREE.MeshBasicMaterial;
              child.material = new THREE.MeshStandardMaterial({
                map: oldMat.map ?? null,
                roughness: 0.82,
                metalness: 0.08,
                emissive: new THREE.Color('#08242a'),
                emissiveIntensity: 0.22,
                side: THREE.DoubleSide,
              });
            }
          }
        });

        const pivot = new THREE.Group();
        // Center horizontally and align keel to base
        gltf.scene.position.set(-center.x, -minY, -center.z);
        pivot.add(gltf.scene);

        // Scale to ~24m length, 13m height
        pivot.scale.setScalar(0.045);
        // Tilt realistically into the trench sand
        pivot.rotation.set(-0.06, 0.38, 0.12);
        pivot.position.set(0, -0.4, 0);

        // Ambient bioluminescent lantern glow inside the sunken ship hold
        const holdGlow = new THREE.PointLight('#70c9e6', 2.8, 28);
        holdGlow.position.set(0, 4.5, 0);
        pivot.add(holdGlow);

        parent.add(pivot);
      },
      undefined,
      (err) => {
        console.warn('Failed to load wrecked ship 3D model:', err);
      }
    );
  } catch (err) {
    console.warn('GLTFLoader error (wrecked ship):', err);
  }
}

function addGalleon(group: THREE.Group) {
  loadWreckedShip(group);

  const chestWood = new THREE.MeshStandardMaterial({ color: '#8d7045', roughness: 0.72, metalness: 0.18 });
  const chestTrim = new THREE.MeshStandardMaterial({ color: '#c3a266', roughness: 0.42, metalness: 0.56 });
  for (const side of [-1, 1]) {
    const chest = new THREE.Group();
    chest.position.set(side * 3.8, 0.8, -2.2);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.05, 1.3), chestWood);
    chest.add(body);
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.14, 1.38), chestTrim);
    band.position.y = 0.24;
    chest.add(band);
    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.12), chestTrim);
    latch.position.set(0, 0.04, 0.71);
    chest.add(latch);

    if (side === 1) {
      const interior = new THREE.Mesh(
        new THREE.BoxGeometry(1.56, 0.12, 1.06),
        new THREE.MeshStandardMaterial({ color: '#302b28', roughness: 0.9 })
      );
      interior.position.y = 0.55;
      chest.add(interior);
      const openLid = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.16), chestWood);
      openLid.position.set(0, 1.05, -0.67);
      openLid.rotation.x = 0.88;
      chest.add(openLid);
      const lidBand = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.2), chestTrim);
      lidBand.position.set(0, 1.05, -0.67);
      lidBand.rotation.x = 0.88;
      chest.add(lidBand);
      const chestLight = new THREE.PointLight('#38bdf8', 2.2, 10);
      chestLight.position.set(0, 1.2, 0);
      chest.add(chestLight);
    } else {
      const closedLid = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.3, 1.36), chestWood);
      closedLid.position.y = 0.67;
      chest.add(closedLid);
    }
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

  const pearlLight = new THREE.PointLight(accent, 18, 26, 2);
  pearlLight.position.set(0, 5.1, 1.8);
  display.add(pearlLight);

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

function loadBlueWhale(parent: THREE.Group, controller: WhaleController) {
  if (typeof window === 'undefined') return;
  try {
    const loader = new GLTFLoader();
    loader.load(
      whaleUrl,
      (gltf) => {
        const whale = gltf.scene;
        // Scale whale according to controller spec (~22-26 meters)
        whale.scale.setScalar(controller.scale ?? 0.018);

        whale.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.roughness = 0.42;
                  mat.metalness = 0.16;
                  mat.emissive = new THREE.Color('#0a2e38');
                  mat.emissiveIntensity = 0.22;
                }
              });
            }
          }
        });

        // Add soft bioluminescent belly point light
        const whaleLight = new THREE.PointLight('#38bdf8', 2.5, 40);
        whaleLight.position.set(0, -2, 0);
        whale.add(whaleLight);

        // Setup skeletal swimming animation
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(whale);
          const swimClip = gltf.animations.find((a) => a.name.toLowerCase().includes('swim')) || gltf.animations[0];
          const action = mixer.clipAction(swimClip);
          action.setEffectiveTimeScale(0.72 + (controller.phase ? 0.06 : 0));
          action.play();
          controller.mixer = mixer;
        }

        parent.add(whale);
      },
      undefined,
      (err) => {
        console.warn('Failed to load blue whale 3D model:', err);
      }
    );
  } catch (err) {
    console.warn('GLTFLoader error (whale):', err);
  }
}

function loadFishSchools(parent: THREE.Group, controllers: FishSchoolController[]) {
  if (typeof window === 'undefined') return;
  try {
    const loader = new GLTFLoader();
    loader.load(
      schoolOfFishUrl,
      (gltf) => {
        gltf.scene.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());

        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = true;
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.roughness = 0.42;
                  mat.metalness = 0.12;
                  mat.emissive = new THREE.Color('#082e38');
                  mat.emissiveIntensity = 0.18;
                }
              });
            }
          }
        });

        const clip = gltf.animations.find((a) => a.name.toLowerCase().includes('swim')) || gltf.animations[0];

        controllers.forEach((ctrl, idx) => {
          const clonedScene = cloneSkeleton(gltf.scene);
          // Pivot precisely around center of the fish school cluster
          clonedScene.position.set(-center.x, -center.y, -center.z);
          ctrl.group.add(clonedScene);
          ctrl.group.scale.setScalar(ctrl.scale);

          // Initial placement
          const t = ctrl.phase;
          const posX = ctrl.centerX + Math.cos(t) * ctrl.radiusX;
          const posZ = ctrl.centerZ + Math.sin(t) * ctrl.radiusZ;
          const posY = ctrl.centerY;
          ctrl.group.position.set(posX, posY, posZ);

          if (clip) {
            const mixer = new THREE.AnimationMixer(clonedScene);
            const action = mixer.clipAction(clip);
            action.setEffectiveTimeScale(0.85 + (idx % 3) * 0.08);
            action.play();
            ctrl.mixer = mixer;
          }
        });
      },
      undefined,
      (err) => {
        console.warn('Failed to load school of fish 3D model:', err);
      }
    );
  } catch (err) {
    console.warn('GLTFLoader error (school of fish):', err);
  }
}

function loadShark(parent: THREE.Group, controller: SharkController) {
  if (typeof window === 'undefined') return;
  try {
    const loader = new GLTFLoader();
    loader.load(
      sharkUrl,
      (gltf) => {
        gltf.scene.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());

        // Center mesh around its pivot so rotational swimming is natural
        const sharkMesh = gltf.scene;
        sharkMesh.position.set(-center.x, -center.y, -center.z);

        sharkMesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.roughness = 0.38;
                  mat.metalness = 0.08;
                }
              });
            }
          }
        });

        const pivot = new THREE.Group();
        pivot.add(sharkMesh);
        pivot.scale.setScalar(controller.scale ?? 0.007);

        // Soft predatory deep-water ambient point light
        const sharkGlow = new THREE.PointLight('#38bdf8', 1.0, 22);
        sharkGlow.position.set(0, 0, 2);
        pivot.add(sharkGlow);

        // Setup skeletal swimming animation
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(sharkMesh);
          const swimClip = gltf.animations.find((a) => a.name.toLowerCase().includes('swim')) || gltf.animations[0];
          const action = mixer.clipAction(swimClip);
          action.setEffectiveTimeScale(1.15); // Predatory tail stroke rate
          action.play();
          controller.mixer = mixer;
        }

        parent.add(pivot);
      },
      undefined,
      (err) => {
        console.warn('Failed to load shark 3D model:', err);
      }
    );
  } catch (err) {
    console.warn('GLTFLoader error (shark):', err);
  }
}

function createNemoSwimmer(
  parent: THREE.Group,
  centerX: number,
  centerY: number,
  centerZ: number,
  radiusX: number,
  radiusZ: number,
  speed: number,
  phase: number,
  scale: number,
  texture: THREE.Texture | null
) {
  const nemoGroup = new THREE.Group();
  nemoGroup.scale.setScalar(scale);

  // 3D Volumetric body core
  const bodyMat = new THREE.MeshStandardMaterial({
    color: '#ff6820',
    roughness: 0.35,
    metalness: 0.12,
    emissive: '#ea580c',
    emissiveIntensity: 0.2,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 10), bodyMat);
  body.scale.set(0.42, 0.68, 1.35);
  nemoGroup.add(body);

  // White clownfish stripes on 3D body
  const stripeMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.3,
    metalness: 0.05,
    emissive: '#ffffff',
    emissiveIntensity: 0.15,
  });
  const headBand = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.24, 14, 1, true), stripeMat);
  headBand.rotation.x = Math.PI / 2;
  headBand.position.z = 0.28;
  nemoGroup.add(headBand);

  const midBand = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.32, 14, 1, true), stripeMat);
  midBand.rotation.x = Math.PI / 2;
  midBand.position.z = -0.15;
  nemoGroup.add(midBand);

  // 3D Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.2 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.1 });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), eyeMat);
    eye.position.set(side * 0.28, 0.16, 0.52);
    nemoGroup.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), pupilMat);
    pupil.position.set(side * 0.34, 0.16, 0.56);
    nemoGroup.add(pupil);
  }

  // 3D Pectoral fins (wings)
  const finMat = new THREE.MeshStandardMaterial({
    color: '#ff7a2f',
    roughness: 0.3,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.7, 4), finMat);
    fin.rotation.z = side * 1.1;
    fin.rotation.y = side * 0.4;
    fin.position.set(side * 0.35, -0.05, 0.08);
    nemoGroup.add(fin);
  }

  // Dorsal fin on top
  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.9, 4), finMat);
  dorsal.rotation.x = -0.65;
  dorsal.position.set(0, 0.52, -0.1);
  nemoGroup.add(dorsal);

  // If nemo.png texture is available, also wrap with translucent textured profile for exact likeness
  if (texture) {
    const nemoMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.04,
      roughness: 0.35,
      metalness: 0.08,
      side: THREE.DoubleSide,
      emissive: '#ea580c',
      emissiveMap: texture,
      emissiveIntensity: 0.25,
    });

    const planeGeo = new THREE.PlaneGeometry(2.3, 1.5);
    const plane = new THREE.Mesh(planeGeo, nemoMat);
    plane.rotation.y = -Math.PI / 2;
    nemoGroup.add(plane);
  }

  // Subtle warm orange radiance
  const nemoGlow = new THREE.PointLight('#f97316', 1.4, 7);
  nemoGlow.position.set(0, 0.1, 0);
  nemoGroup.add(nemoGlow);

  parent.add(nemoGroup);
  return {
    group: nemoGroup,
    centerX,
    centerY,
    centerZ,
    radiusX,
    radiusZ,
    speed,
    phase,
    scale,
  };
}

export function createUnderwaterWorld(): WorldAssembly {
  const root = new THREE.Group();
  const landmarkMeshes = new Map<string, THREE.Group>();
  const artifactMeshes = new Map<string, THREE.Group>();
  const animatedLights: THREE.Object3D[] = [];
  const causticTime = { value: 0 };
  const swayingKelp: Array<{ group: THREE.Group; phase: number }> = [];
  const swimmingSchools = [
    addFishSchool(root, -48, 12, -58, 0.54, 0),
    addFishSchool(root, 51, 16, -94, 0.72, 2.1),
    addFishSchool(root, 65, 9, 32, 0.46, 4.4),
  ];

  // Load the 3D Underwater models
  loadUnderwaterPlants(root);
  loadGreekColumns(root);

  // Spawn pair of majestic 3D Blue Whales
  const blueWhales: WhaleController[] = [
    // Elder Matriarch Whale: outer ocean perimeter circuit above temple & lighthouse
    {
      group: new THREE.Group(),
      centerX: 0,
      centerY: 9,
      centerZ: -15,
      radiusX: 78,
      radiusZ: 88,
      speed: 0.11,
      phase: 0,
      scale: 0.018,
    },
    // Companion Whale: complementary orbit through sunlit waters & southern canyons
    {
      group: new THREE.Group(),
      centerX: 12,
      centerY: 13,
      centerZ: 10,
      radiusX: 64,
      radiusZ: 72,
      speed: 0.125,
      phase: Math.PI * 0.85,
      scale: 0.015,
    },
  ];

  for (const whale of blueWhales) {
    root.add(whale.group);
    loadBlueWhale(whale.group, whale);
  }

  // Spawn 5 distinct 3D Schools of Fish (school_of_fish.glb)
  const fishSchools: FishSchoolController[] = [
    // School 1: Central coral garden & sunlit shallows (near start gateway arch)
    {
      group: new THREE.Group(),
      centerX: 6,
      centerY: 3.5,
      centerZ: 38,
      radiusX: 17,
      radiusZ: 14,
      speed: 0.22,
      phase: 0,
      scale: 4.8,
      verticalAmplitude: 1.6,
      verticalFrequency: 1.4,
    },
    // School 2: The Sunken Galleon & Deep Trench canyon
    {
      group: new THREE.Group(),
      centerX: -48,
      centerY: 1.2,
      centerZ: -20,
      radiusX: 20,
      radiusZ: 16,
      speed: 0.18,
      phase: 1.3,
      scale: 5.2,
      verticalAmplitude: 1.8,
      verticalFrequency: 1.2,
    },
    // School 3: Lost Temple of Atlantis Ruined Colonnade
    {
      group: new THREE.Group(),
      centerX: 35,
      centerY: 3.2,
      centerZ: 24,
      radiusX: 18,
      radiusZ: 15,
      speed: 0.21,
      phase: 3.8,
      scale: 5.0,
      verticalAmplitude: 1.7,
      verticalFrequency: 1.3,
    },
    // School 4: Coral Amphitheatre & Kelp Forest
    {
      group: new THREE.Group(),
      centerX: 28,
      centerY: 4.0,
      centerZ: -40,
      radiusX: 22,
      radiusZ: 18,
      speed: 0.20,
      phase: 2.6,
      scale: 4.6,
      verticalAmplitude: 1.5,
      verticalFrequency: 1.6,
    },
    // School 5: Oracle of Poseidon Reef & Shimmering Waters
    {
      group: new THREE.Group(),
      centerX: -36,
      centerY: 2.6,
      centerZ: 28,
      radiusX: 19,
      radiusZ: 17,
      speed: 0.19,
      phase: 5.1,
      scale: 4.5,
      verticalAmplitude: 1.4,
      verticalFrequency: 1.5,
    },
  ];

  for (const school of fishSchools) {
    root.add(school.group);
  }
  loadFishSchools(root, fishSchools);

  // Spawn 1 apex predator Shark cruising the sunken galleon shipwreck trench
  const sharks: SharkController[] = [
    {
      group: new THREE.Group(),
      centerX: -48,
      centerY: 4.5,
      centerZ: -18,
      radiusX: 32,
      radiusZ: 38,
      speed: 0.16,
      phase: 0.5,
      scale: 0.007,
      verticalAmplitude: 1.6,
      verticalFrequency: 1.1,
    },
  ];

  for (const shark of sharks) {
    root.add(shark.group);
    loadShark(shark.group, shark);
  }

  const nemoTexture = loadTextureSafely(nemoImg);
  const nemoSwimmers = [
    // Hero Nemo: playful loop right in front of start gateway / coral garden
    createNemoSwimmer(root, 0, 1.2, 6, 11, 8, 0.48, 0, 1.2, nemoTexture),
    // Playful companion Nemo exploring near start arch
    createNemoSwimmer(root, -10, 2.4, 12, 6.5, 5.5, 0.62, 1.8, 0.85, nemoTexture),
    // Clownfish swimming among corals near amphitheatre
    createNemoSwimmer(root, -26, 0.5, 48, 8.5, 7.5, 0.52, 3.1, 0.95, nemoTexture),
    // Clownfish exploring near the Oracle reef
    createNemoSwimmer(root, 36, 2.1, 26, 8, 7, 0.55, 4.6, 0.9, nemoTexture),
    // Curious Nemo near the sunken galleon wreck
    createNemoSwimmer(root, -46, 0.8, 10, 9, 7.5, 0.44, 2.4, 1.05, nemoTexture),
    // Nemo swimming deep in the canyon near the lighthouse path
    createNemoSwimmer(root, 24, 3.2, -42, 9.5, 8, 0.5, 5.2, 1.0, nemoTexture),
  ];

  const terrain = new THREE.PlaneGeometry(360, 360, 72, 72);
  const positions = terrain.attributes.position;
  const colors: number[] = [];
  const deep = new THREE.Color('#af8c68');
  const shelf = new THREE.Color('#cbb18f');
  const crest = new THREE.Color('#ebd9bf');
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
          diffuseColor.rgb += vec3(0.36, 0.32, 0.22) * caustics * 0.24;`
      );
  };
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.position.y = -11.5;
  terrainMesh.receiveShadow = true;
  root.add(terrainMesh);

  const rockInstances = new THREE.InstancedMesh(rockGeometry, rockMaterial, 24);
  const dummy = new THREE.Object3D();
  const rockColors = ['#876f53', '#9e8568', '#7c6448', '#af977a'].map((color) => new THREE.Color(color));
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
    if (landmark.kind === 'galleon') group.position.y = -10.5;
    group.rotation.y = Math.atan2(-landmark.position[0], -landmark.position[2]);

    if (landmark.kind !== 'galleon') {
      const foundation = new THREE.Mesh(new THREE.CylinderGeometry(7, 8, 1.1, 24), darkStoneMaterial);
      foundation.position.y = 0;
      group.add(foundation);
    }

    if (landmark.kind === 'gateway') addGateway(group, animatedLights);
    if (landmark.kind === 'archive') addArchive(group);
    if (landmark.kind === 'amphitheatre') addAmphitheatre(group);
    if (landmark.kind === 'lighthouse') addLighthouse(group, animatedLights);
    if (landmark.kind === 'galleon') addGalleon(group);
    if (landmark.kind === 'oracle') addOracle(group);
    if (landmark.kind === 'festival') addFestivalBeacon(group, landmark.accent, animatedLights);

    for (const artifact of relics as RelicDefinition[]) {
      if (artifact.landmarkId !== landmark.id) continue;
      const artifactGroup = createArtifact(artifact);
      artifactGroup.position.set(...artifact.position);
      group.add(artifactGroup);
      artifactMeshes.set(artifact.id, artifactGroup);
    }

    const marker = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.04, 8, 24),
      new THREE.MeshStandardMaterial({ color: landmark.accent, emissive: landmark.accent, emissiveIntensity: 0.15, roughness: 0.62 })
    );
    marker.name = 'discoveryMarker';
    marker.position.set(0, landmark.kind === 'lighthouse' ? 15.5 : landmark.kind === 'galleon' ? 6.5 : 1.8, 0);
    marker.rotation.x = Math.PI / 2;
    marker.visible = false;
    group.add(marker);

    landmarkMeshes.set(landmark.id, group);
    root.add(group);
  }

  return { root, landmarkMeshes, artifactMeshes, animatedLights, causticTime, swimmingSchools, swayingKelp, blueWhales, fishSchools, nemoSwimmers, sharks };
}
