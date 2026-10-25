import * as THREE from 'three';
import type { RelicDefinition } from './types';

const shellGeometry = new THREE.SphereGeometry(0.9, 24, 18);
const coreGeometries = [
  new THREE.SphereGeometry(0.44, 20, 16),
  new THREE.OctahedronGeometry(0.52, 1),
  new THREE.IcosahedronGeometry(0.47, 1),
];
const haloGeometry = new THREE.TorusGeometry(0.78, 0.035, 8, 40);
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(36);
for (let index = 0; index < particlePositions.length; index += 3) {
  const angle = (index / 3) * 2.399963;
  const radius = 0.72 + ((index / 3) % 3) * 0.11;
  particlePositions[index] = Math.cos(angle) * radius;
  particlePositions[index + 1] = Math.sin(angle * 1.7) * 0.42;
  particlePositions[index + 2] = Math.sin(angle) * radius;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

export function createArtifact(definition: RelicDefinition): THREE.Group {
  const group = new THREE.Group();
  group.name = `artifact:${definition.id}`;
  const color = new THREE.Color(definition.color);
  const shell = new THREE.Mesh(
    shellGeometry,
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.14,
      metalness: 0.1,
      transmission: 0.44,
      thickness: 0.6,
      transparent: true,
      opacity: 0.33,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      depthWrite: false,
    })
  );
  shell.scale.set(1, 1.12, 0.9);
  group.add(shell);

  const core = new THREE.Mesh(
    coreGeometries[relicIndex(definition.id) % coreGeometries.length],
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.92,
      roughness: 0.22,
      metalness: 0.18,
    })
  );
  core.name = 'artifactCore';
  group.add(core);

  const halo = new THREE.Mesh(
    haloGeometry,
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.28,
      roughness: 0.38,
      metalness: 0.44,
    })
  );
  halo.name = 'artifactHalo';
  halo.rotation.set(Math.PI * 0.33, 0, Math.PI * 0.12);
  group.add(halo);

  const secondHalo = new THREE.Mesh(
    haloGeometry,
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.38, depthWrite: false })
  );
  secondHalo.scale.setScalar(1.27);
  secondHalo.rotation.set(-Math.PI * 0.28, Math.PI * 0.38, 0);
  group.add(secondHalo);

  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color,
      size: 0.075,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  particles.name = 'artifactParticles';
  group.add(particles);
  if (definition.id === 'pearl-of-passage') {
    const light = new THREE.PointLight(color, 5.5, 10, 2);
    light.name = 'artifactLight';
    group.add(light);
  }
  group.userData.artifactColor = color;
  return group;
}

function relicIndex(id: string): number {
  return id.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0);
}
