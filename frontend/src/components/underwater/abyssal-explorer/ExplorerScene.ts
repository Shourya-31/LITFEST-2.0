import * as THREE from 'three';
import { abyssalLandmarks, relics } from './Landmarks';
import { createUnderwaterWorld } from './UnderwaterWorld';
import { VehicleController, type PlayerInput } from './VehicleController';
import type { ExplorerTelemetry, LandmarkDefinition } from './types';

export interface ExplorerSceneCallbacks {
  onTelemetry?: (telemetry: ExplorerTelemetry) => void;
  onLandmarkDiscovered?: (landmark: LandmarkDefinition) => void;
  onArtifactCollected?: (artifactId: string) => boolean;
  onVictory?: () => void;
}

export interface ExplorerSceneOptions {
  container: HTMLDivElement;
  callbacks?: ExplorerSceneCallbacks;
  collectedArtifactIds?: string[];
  discoveredLandmarkIds?: string[];
}

const SONAR_COOLDOWN_MS = 1400;
const LANDMARK_INTERACTION_RADIUS = 13;
const ARTIFACT_INTERACTION_RADIUS = 7.5;

interface ObjectTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

interface ArtifactAnimationParts {
  core?: THREE.Mesh;
  halo?: THREE.Object3D;
  light?: THREE.PointLight;
}

const relicById = new Map(relics.map((artifact) => [artifact.id, artifact]));

export class ExplorerScene {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private resizeObserver?: ResizeObserver;
  private animationFrame = 0;
  private lastFrameTime = 0;
  private elapsed = 0;
  private running = false;
  private paused = false;
  private disposed = false;
  private motionQuery: MediaQueryList;
  private reducedMotion = false;
  private vehicle = new VehicleController();
  private input: PlayerInput = {
    forward: false,
    reverse: false,
    left: false,
    right: false,
    boost: false,
    interact: false,
    sonar: false,
  };
  private lastInteractTime = -Infinity;
  private lastSonarTime = -Infinity;
  private nearbyLandmark?: LandmarkDefinition;
  private nearbyArtifactId?: string;
  private navigationTarget?: LandmarkDefinition;
  private selectedNavigationTargetId?: string;
  private navigationDistance = 0;
  private navigationBearing = 0;
  private submarine: THREE.Group;
  private propellers: THREE.Group[] = [];
  private wakePositions!: THREE.BufferAttribute;
  private wakeMaterial!: THREE.PointsMaterial;
  private sonarWave: THREE.Mesh;
  private victoryWave: THREE.Mesh;
  private victoryStartedAt?: number;
  private victoryArtifactId?: string;
  private victoryCallbackFired = false;
  private sonarOrigin = new THREE.Vector3();
  private sonarActive = false;
  private particleField: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private particleBasePositions: Float32Array;
  private artifactCollected: Set<string>;
  private callbacks: ExplorerSceneCallbacks;
  private discoveredLandmarkIds: Set<string>;
  private landmarkPositions = new Map<string, THREE.Vector3>();
  private landmarkMarkers = new Map<string, THREE.Mesh>();
  private artifactMeshes: Map<string, THREE.Group>;
  private artifactPositions = new Map<string, THREE.Vector3>();
  private artifactAnimationParts = new Map<string, ArtifactAnimationParts>();
  private artifactInitialTransforms = new Map<string, Map<THREE.Object3D, ObjectTransform>>();
  private artifactCollectionStart = new Map<string, number>();
  private animatedLights: THREE.Object3D[];
  private causticTime: { value: number };
  private swimmingSchools: Array<{ group: THREE.Group; x: number; y: number; z: number; phase: number }>;
  private swayingKelp: Array<{ group: THREE.Group; phase: number }>;
  private cameraPositionTarget = new THREE.Vector3();
  private cameraLookTarget = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private readonly cameraOffset = new THREE.Vector3();
  private readonly cameraLook = new THREE.Vector3();
  private readonly sonarHighlight = new Set<string>();
  private sonarTimeouts = new Set<number>();
  private telemetryAccumulator = 0;
  private readonly onResize = () => this.resize();
  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      this.clearInputs();
      this.stopLoop();
    } else if (!this.paused) {
      this.startLoop();
    }
  };
  private readonly onMotionPreferenceChange = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;
  };

  constructor({ container, callbacks = {}, collectedArtifactIds = [], discoveredLandmarkIds = [] }: ExplorerSceneOptions) {
    this.container = container;
    this.callbacks = callbacks;
    this.artifactCollected = new Set(collectedArtifactIds);
    this.discoveredLandmarkIds = new Set(discoveredLandmarkIds);
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#176078');
    this.scene.fog = new THREE.FogExp2('#164a60', 0.0046);

    this.camera = new THREE.PerspectiveCamera(54, 1, 0.1, 380);
    this.camera.position.set(0, 12, 23);

    this.renderer = new THREE.WebGLRenderer({
      antialias: window.innerWidth > 768,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor('#176078', 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;
    this.renderer.setPixelRatio(this.getPixelRatio());
    this.renderer.setSize(this.container.clientWidth || 960, this.container.clientHeight || 540);
    this.container.appendChild(this.renderer.domElement);

    const hemisphere = new THREE.HemisphereLight('#a8eff5', '#24434a', 1.8);
    const sun = new THREE.DirectionalLight('#d7f5e9', 2.6);
    sun.position.set(-30, 62, -42);
    sun.castShadow = false;
    const fill = new THREE.PointLight('#55c8d8', 54, 145, 2);
    fill.position.set(4, 16, -18);
    const openingFill = new THREE.PointLight('#7de3df', 36, 96, 2);
    openingFill.position.set(-30, 9, 10);
    this.scene.add(hemisphere, sun, fill, openingFill);

    const world = createUnderwaterWorld();
    this.scene.add(world.root);
    this.artifactMeshes = world.artifactMeshes;
    this.animatedLights = world.animatedLights;
    this.causticTime = world.causticTime;
    this.swimmingSchools = world.swimmingSchools;
    this.swayingKelp = world.swayingKelp;

    for (const landmark of abyssalLandmarks) {
      this.landmarkPositions.set(
        landmark.id,
        new THREE.Vector3(landmark.position[0], landmark.position[1], landmark.position[2])
      );
      const group = world.landmarkMeshes.get(landmark.id);
      const marker = group?.getObjectByName('discoveryMarker');
      if (marker instanceof THREE.Mesh) {
        this.landmarkMarkers.set(landmark.id, marker);
      }
    }
    world.root.updateMatrixWorld(true);
    for (const artifact of relics) {
      const mesh = this.artifactMeshes.get(artifact.id);
      if (!mesh) continue;
      this.artifactPositions.set(artifact.id, mesh.getWorldPosition(new THREE.Vector3()));
      const core = mesh.getObjectByName('artifactCore');
      const halo = mesh.getObjectByName('artifactHalo');
      const light = mesh.getObjectByName('artifactLight');
      this.artifactAnimationParts.set(artifact.id, {
        core: core instanceof THREE.Mesh ? core : undefined,
        halo,
        light: light instanceof THREE.PointLight ? light : undefined,
      });
      const transforms = new Map<THREE.Object3D, ObjectTransform>();
      mesh.traverse((object) => {
        transforms.set(object, {
          position: object.position.clone(),
          rotation: object.rotation.clone(),
          scale: object.scale.clone(),
        });
      });
      this.artifactInitialTransforms.set(artifact.id, transforms);
    }

    this.submarine = this.createSubmarine();
    this.scene.add(this.submarine);

    const waveMaterial = new THREE.MeshBasicMaterial({
      color: '#a5e7ef',
      transparent: true,
      opacity: 0,
      wireframe: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.sonarWave = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), waveMaterial);
    this.sonarWave.visible = false;
    this.scene.add(this.sonarWave);
    this.victoryWave = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.13, 8, 64),
      new THREE.MeshBasicMaterial({ color: '#c4faff', transparent: true, opacity: 0, depthWrite: false })
    );
    this.victoryWave.rotation.x = Math.PI / 2;
    this.victoryWave.visible = false;
    this.scene.add(this.victoryWave);

    const particleCount = 240;
    this.particleBasePositions = new Float32Array(particleCount * 3);
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const seed = index + 1;
      const x = ((seed * 37.719) % 170) - 85;
      const y = ((seed * 12.9898) % 46) - 17;
      const z = ((seed * 61.531) % 170) - 85;
      const offset = index * 3;
      this.particleBasePositions[offset] = x;
      this.particleBasePositions[offset + 1] = y;
      this.particleBasePositions[offset + 2] = z;
      particlePositions[offset] = x;
      particlePositions[offset + 1] = y;
      particlePositions[offset + 2] = z;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    this.particleField = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: '#b0dce0',
        size: 0.13,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
        depthWrite: false,
      })
    );
    this.scene.add(this.particleField);

    this.artifactCollected.forEach((id) => {
      const mesh = this.artifactMeshes.get(id);
      if (mesh) mesh.visible = false;
    });

    this.resizeObserver = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(this.onResize);
    this.resizeObserver?.observe(this.container);
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.motionQuery.addEventListener('change', this.onMotionPreferenceChange);
    this.updateLandmarkProximity();
    this.emitTelemetry();
  }

  public setInputState(action: keyof PlayerInput, active: boolean) {
    if (this.paused || this.disposed) return;
    if (action === 'sonar' && active) {
      this.triggerSonar();
      return;
    }
    if (action === 'interact' && active) {
      this.tryInteract();
      return;
    }
    this.input[action] = active;
  }

  public setPaused(paused: boolean) {
    if (this.paused === paused) return;
    this.paused = paused;
    if (paused) {
      this.clearInputs();
      this.stopLoop();
    } else {
      this.startLoop();
    }
  }

  public restartCheckpoint() {
    this.vehicle.reset();
    this.nearbyLandmark = undefined;
    this.selectedNavigationTargetId = undefined;
    this.sonarActive = false;
    this.sonarWave.visible = false;
    this.clearInputs();
    this.updateVehicleTransform();
    this.updateLandmarkProximity();
    this.emitTelemetry();
  }

  public selectNavigationTarget(landmarkId: string) {
    const landmark = abyssalLandmarks.find((entry) => entry.id === landmarkId);
    if (!landmark) {
      throw new Error(`Unknown Abyssal Voyage landmark: ${landmarkId}`);
    }
    this.selectedNavigationTargetId = landmarkId;
    this.navigationTarget = landmark;
    const position = this.landmarkPositions.get(landmarkId);
    if (position) {
      this.navigationDistance = position.distanceTo(this.submarine.position);
      const dx = position.x - this.submarine.position.x;
      const dz = position.z - this.submarine.position.z;
      this.navigationBearing = (THREE.MathUtils.radToDeg(Math.atan2(dx, -dz)) + 360) % 360;
    }
    this.emitTelemetry();
  }

  public resetCollectedRelics() {
    this.artifactCollected.clear();
    this.artifactCollectionStart.clear();
    this.discoveredLandmarkIds.clear();
    this.victoryStartedAt = undefined;
    this.victoryArtifactId = undefined;
    this.victoryCallbackFired = false;
    this.victoryWave.visible = false;
    for (const [id, mesh] of this.artifactMeshes) {
      for (const [object, transform] of this.artifactInitialTransforms.get(id) ?? []) {
        object.position.copy(transform.position);
        object.rotation.copy(transform.rotation);
        object.scale.copy(transform.scale);
      }
      mesh.visible = true;
      mesh.userData.sonarUntil = undefined;
      const parts = this.artifactAnimationParts.get(id);
      if (parts?.core?.material instanceof THREE.MeshStandardMaterial) {
        parts.core.material.emissiveIntensity = 0.92;
      }
      if (parts?.light) parts.light.intensity = 5.5;
    }
    for (const [id, marker] of this.landmarkMarkers) {
      marker.visible = false;
      (marker.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15;
      this.sonarHighlight.delete(id);
    }
    this.sonarTimeouts.forEach((timeout) => window.clearTimeout(timeout));
    this.sonarTimeouts.clear();
    this.sonarActive = false;
    this.sonarWave.visible = false;
    this.emitTelemetry();
  }

  public start() {
    this.startLoop();
  }

  public dispose() {
    if (this.disposed) return;
    this.disposed = true;
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.motionQuery.removeEventListener('change', this.onMotionPreferenceChange);
    this.resizeObserver?.disconnect();
    this.stopLoop();
    this.sonarTimeouts.forEach((timeout) => window.clearTimeout(timeout));
    this.sonarTimeouts.clear();

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Points)) return;
      geometries.add(object.geometry);
      const material = object.material;
      if (Array.isArray(material)) material.forEach((item) => materials.add(item));
      else materials.add(material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  private startLoop() {
    if (this.running || this.paused || this.disposed || document.hidden) return;
    this.running = true;
    this.lastFrameTime = 0;
    this.animationFrame = window.requestAnimationFrame(this.animate);
  }

  private stopLoop() {
    if (!this.running) return;
    this.running = false;
    window.cancelAnimationFrame(this.animationFrame);
  }

  private readonly animate = (time: number) => {
    if (!this.running || this.disposed) return;
    if (this.lastFrameTime === 0) this.lastFrameTime = time;
    const delta = THREE.MathUtils.clamp((time - this.lastFrameTime) / 1000, 0, 0.033);
    this.lastFrameTime = time;
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = window.requestAnimationFrame(this.animate);
  };

  private clearInputs() {
    this.input.forward = false;
    this.input.reverse = false;
    this.input.left = false;
    this.input.right = false;
    this.input.boost = false;
    this.input.interact = false;
    this.input.sonar = false;
  }

  private resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width < 1 || height < 1) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(this.getPixelRatio());
    this.renderer.setSize(width, height);
  }

  private getPixelRatio() {
    return Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1.25 : 1.5);
  }

  private triggerSonar() {
    const now = performance.now();
    if (now - this.lastSonarTime < SONAR_COOLDOWN_MS) return;
    this.lastSonarTime = now;
    this.sonarOrigin.copy(this.submarine.position);
    this.sonarWave.position.copy(this.sonarOrigin);
    this.sonarWave.scale.setScalar(1);
    this.sonarWave.visible = true;
    (this.sonarWave.material as THREE.MeshBasicMaterial).opacity = 0.4;
    this.sonarActive = true;
  }

  private tryInteract() {
    const now = performance.now();
    const artifactId = this.nearbyArtifactId;
    if (!artifactId || this.artifactCollected.has(artifactId) || now - this.lastInteractTime < 800) return;
    const artifact = relics.find((entry) => entry.id === artifactId);
    const position = this.artifactPositions.get(artifactId);
    if (!artifact || !position || position.distanceTo(this.submarine.position) > ARTIFACT_INTERACTION_RADIUS) {
      this.nearbyArtifactId = undefined;
      return;
    }
    this.lastInteractTime = now;
    this.artifactCollected.add(artifactId);
    this.artifactCollectionStart.set(artifactId, this.elapsed);
    this.callbacks.onArtifactCollected?.(artifactId);
    if (this.artifactCollected.size === relics.length && this.victoryStartedAt === undefined) {
      this.victoryStartedAt = this.elapsed;
      this.victoryArtifactId = artifactId;
      if (position) this.victoryWave.position.copy(position);
      this.victoryWave.scale.setScalar(0.12);
      this.victoryWave.visible = true;
    }
  }

  private update(delta: number) {
    this.elapsed += delta;
    if (!this.reducedMotion) {
      this.causticTime.value = this.elapsed;
      for (const { group, x, y, z, phase } of this.swimmingSchools) {
        group.position.set(
          x + Math.sin(this.elapsed * 0.12 + phase) * 10,
          y + Math.sin(this.elapsed * 0.35 + phase) * 1.2,
          z + Math.cos(this.elapsed * 0.1 + phase) * 7
        );
        group.rotation.y = Math.sin(this.elapsed * 0.16 + phase) * 0.11;
      }
      for (const { group, phase } of this.swayingKelp) {
        group.rotation.z = Math.sin(this.elapsed * 0.48 + phase) * 0.055;
      }
    }
    this.vehicle.update(delta, this.input);
    this.updateVehicleTransform();
    this.updatePropellers(delta);
    this.updateParticles();
    this.updateSonar();
    this.updateArtifacts(delta);
    this.updateCollectionAnimations();
    this.updateLandmarkProximity();
    this.updateVictorySequence();
    this.updateCamera(delta);
    this.telemetryAccumulator += delta;
    if (this.telemetryAccumulator >= 0.12) {
      this.telemetryAccumulator = 0;
      this.emitTelemetry();
    }
  }

  private updateVehicleTransform() {
    this.submarine.position.set(this.vehicle.position.x, this.vehicle.position.y, this.vehicle.position.z);
    this.submarine.rotation.y = this.vehicle.yaw;
    this.submarine.rotation.x = this.vehicle.pitch;
    this.submarine.rotation.z = this.vehicle.roll;
  }

  private updatePropellers(delta: number) {
    const rotationSpeed = Math.abs(this.vehicle.velocity.z) * 0.9 + 0.3;
    const reducedFactor = this.reducedMotion ? 0.25 : 1;
    for (let index = 0; index < this.propellers.length; index += 1) {
      const propeller = this.propellers[index];
      propeller.rotation.z += rotationSpeed * delta * reducedFactor * (index ? -1 : 1);
    }
    for (let index = 0; index < this.animatedLights.length; index += 1) {
      this.animatedLights[index].rotation.y += delta * (this.reducedMotion ? 0.08 : 0.22);
    }
    const wake = this.wakePositions.array as Float32Array;
    const wakeLength = Math.min(Math.abs(this.vehicle.velocity.z) * 0.28, 7);
    this.wakeMaterial.opacity = Math.min(Math.abs(this.vehicle.velocity.z) / 18, 1) * 0.4;
    for (let index = 0; index < wake.length; index += 3) {
      const bubble = Math.floor(index / 3);
      const phase = (this.elapsed * 1.25 + bubble * 0.73) % 1;
      wake[index] = Math.sin(this.elapsed * 1.8 + bubble * 1.7) * 0.28;
      wake[index + 1] = -0.15 + phase * 0.8;
      wake[index + 2] = 4.6 + phase * wakeLength;
    }
    this.wakePositions.needsUpdate = true;
  }

  private updateParticles() {
    if (this.reducedMotion) return;
    const positions = this.particleField.geometry.attributes.position as THREE.BufferAttribute;
    const values = positions.array as Float32Array;
    for (let index = 0; index < values.length; index += 3) {
      const baseY = this.particleBasePositions[index + 1];
      values[index] = this.particleBasePositions[index] + Math.sin(this.elapsed * 0.18 + index) * 0.12;
      values[index + 1] = baseY + Math.sin(this.elapsed * 0.3 + index * 0.37) * 0.45;
      values[index + 2] = this.particleBasePositions[index + 2];
    }
    positions.needsUpdate = true;
  }

  private updateSonar() {
    if (!this.sonarActive) return;
    const progress = Math.min((performance.now() - this.lastSonarTime) / 1800, 1);
    const radius = 1 + progress * 43;
    this.sonarWave.scale.setScalar(radius);
    const material = this.sonarWave.material as THREE.MeshBasicMaterial;
    material.opacity = (1 - progress) * 0.42;

    for (const landmark of abyssalLandmarks) {
      const position = this.landmarkPositions.get(landmark.id);
      const marker = this.landmarkMarkers.get(landmark.id);
      if (!position || !marker) continue;
      const distance = position.distanceTo(this.sonarOrigin);
      const wasHit = this.sonarHighlight.has(landmark.id);
      if (!wasHit && distance <= radius) {
        this.sonarHighlight.add(landmark.id);
        const markerMaterial = marker.material as THREE.MeshStandardMaterial;
        markerMaterial.emissiveIntensity = 0.9;
        marker.visible = true;
        if (!this.discoveredLandmarkIds.has(landmark.id)) {
          this.discoveredLandmarkIds.add(landmark.id);
          this.callbacks.onLandmarkDiscovered?.(landmark);
        }
        const timeout = window.setTimeout(() => {
          if (this.disposed) return;
          markerMaterial.emissiveIntensity = 0.15;
          marker.visible = false;
          this.sonarHighlight.delete(landmark.id);
          this.sonarTimeouts.delete(timeout);
        }, 1150);
        this.sonarTimeouts.add(timeout);
      }
    }
    for (const artifact of relics) {
      if (this.artifactCollected.has(artifact.id)) continue;
      const position = this.artifactPositions.get(artifact.id);
      const mesh = this.artifactMeshes.get(artifact.id);
      if (position && mesh && position.distanceTo(this.sonarOrigin) <= radius) {
        mesh.userData.sonarUntil = this.elapsed + 1.3;
      }
    }
    if (progress >= 1) this.sonarActive = false;
  }

  private updateArtifacts(delta: number) {
    let nearestId: string | undefined;
    let nearestDistance = ARTIFACT_INTERACTION_RADIUS;
    for (const artifact of relics) {
      if (this.artifactCollected.has(artifact.id)) continue;
      const position = this.artifactPositions.get(artifact.id);
      const mesh = this.artifactMeshes.get(artifact.id);
      if (!position || !mesh) continue;
      const distance = position.distanceTo(this.submarine.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = artifact.id;
      }
      if (!this.reducedMotion) {
        mesh.rotation.y += delta * 0.32;
        mesh.position.y = artifact.position[1] + Math.sin(this.elapsed * 1.25 + position.x) * 0.13;
        const parts = this.artifactAnimationParts.get(artifact.id);
        if (parts?.core) parts.core.rotation.y += delta * 0.34;
        if (parts?.halo) parts.halo.rotation.z += delta * 0.2;
        if (parts?.light) {
          const revealed = (mesh.userData.sonarUntil as number | undefined) ?? -Infinity;
          parts.light.intensity = this.elapsed < revealed ? 6 : 5.5;
        }
      }
    }
    this.nearbyArtifactId = nearestId;
  }

  private updateCollectionAnimations() {
    for (const [id, startedAt] of this.artifactCollectionStart) {
      const mesh = this.artifactMeshes.get(id);
      if (!mesh) continue;
      const progress = Math.min((this.elapsed - startedAt) / 0.72, 1);
      mesh.scale.setScalar(1 + progress * 0.45);
      const artifact = relicById.get(id);
      if (artifact && id === 'pearl-of-passage') mesh.position.y = artifact.position[1] + progress * 1.1;
      const light = this.artifactAnimationParts.get(id)?.light;
      if (light) light.intensity = 5.5 + progress * 8;
      if (progress >= 1) {
        mesh.visible = false;
        this.artifactCollectionStart.delete(id);
      }
    }
  }

  private updateVictorySequence() {
    if (this.victoryStartedAt === undefined) return;
    const progress = Math.min((this.elapsed - this.victoryStartedAt) / 2.4, 1);
    const waveMaterial = this.victoryWave.material as THREE.MeshBasicMaterial;
    this.victoryWave.scale.setScalar(0.12 + progress * 13);
    waveMaterial.opacity = (1 - progress) * 0.7;

    const core = this.victoryArtifactId
      ? this.artifactAnimationParts.get(this.victoryArtifactId)?.core
      : undefined;
    if (core?.material instanceof THREE.MeshStandardMaterial) {
      core.material.emissiveIntensity = 0.9 + Math.sin(progress * Math.PI) * 2.4;
    }
    let index = 0;
    for (const artifact of relics) {
      const marker = this.landmarkMarkers.get(artifact.landmarkId);
      if (marker) {
        const beat = progress * relics.length - index;
        marker.visible = beat >= 0 && beat < 0.8;
        (marker.material as THREE.MeshStandardMaterial).emissiveIntensity = marker.visible ? 1.4 : 0.15;
      }
      index += 1;
    }

    if (progress >= 1) {
      this.victoryWave.visible = false;
      if (!this.victoryCallbackFired) {
        this.victoryCallbackFired = true;
        this.callbacks.onVictory?.();
      }
    }
  }

  private updateLandmarkProximity() {
    let nearestLandmark: LandmarkDefinition | undefined;
    let nearestDistance = Infinity;
    let nearbyLandmark: LandmarkDefinition | undefined;
    let nearbyDistance = LANDMARK_INTERACTION_RADIUS;
    for (const landmark of abyssalLandmarks) {
      const position = this.landmarkPositions.get(landmark.id);
      if (!position) continue;
      const distance = position.distanceTo(this.submarine.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestLandmark = landmark;
      }
      if (distance < nearbyDistance) {
        nearbyDistance = distance;
        nearbyLandmark = landmark;
      }
    }
    this.navigationTarget = this.selectedNavigationTargetId
      ? abyssalLandmarks.find((entry) => entry.id === this.selectedNavigationTargetId) ?? nearestLandmark
      : nearestLandmark;
    const targetPosition = this.navigationTarget && this.landmarkPositions.get(this.navigationTarget.id);
    this.navigationDistance = targetPosition ? targetPosition.distanceTo(this.submarine.position) : nearestDistance;
    this.nearbyLandmark = nearbyLandmark;
    for (const [id, marker] of this.landmarkMarkers) {
      if (id === nearbyLandmark?.id) {
        marker.visible = true;
        (marker.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.42;
        if (!this.discoveredLandmarkIds.has(id)) {
          const discoveredLandmark = abyssalLandmarks.find((entry) => entry.id === id);
          if (discoveredLandmark) {
            this.discoveredLandmarkIds.add(id);
            this.callbacks.onLandmarkDiscovered?.(discoveredLandmark);
          }
        }
      } else if (!this.sonarHighlight.has(id)) {
        marker.visible = false;
        (marker.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15;
      }
    }
    if (targetPosition) {
      const dx = targetPosition.x - this.submarine.position.x;
      const dz = targetPosition.z - this.submarine.position.z;
      this.navigationBearing = (THREE.MathUtils.radToDeg(Math.atan2(dx, -dz)) + 360) % 360;
    }
  }

  private updateCamera(delta: number) {
    this.forward.set(-Math.sin(this.vehicle.yaw), 0, -Math.cos(this.vehicle.yaw));
    this.cameraOffset.set(Math.sin(this.vehicle.yaw) * 17.5, 6.5, Math.cos(this.vehicle.yaw) * 17.5);
    this.cameraPositionTarget.copy(this.submarine.position).add(this.cameraOffset);
    this.camera.position.lerp(this.cameraPositionTarget, 1 - Math.exp(-3.2 * delta));

    this.cameraLook.copy(this.submarine.position).addScaledVector(this.forward, 11.5);
    this.cameraLook.y += 0.5;
    const targetPosition = this.navigationTarget && this.landmarkPositions.get(this.navigationTarget.id);
    if (targetPosition && this.navigationDistance < 44) {
      this.cameraLook.x = THREE.MathUtils.lerp(this.cameraLook.x, targetPosition.x, 0.24);
      this.cameraLook.z = THREE.MathUtils.lerp(this.cameraLook.z, targetPosition.z, 0.24);
    }
    this.cameraLookTarget.lerp(this.cameraLook, 1 - Math.exp(-4.5 * delta));
    this.camera.lookAt(this.cameraLookTarget);
  }

  private createSubmarine() {
    const group = new THREE.Group();
    group.scale.setScalar(0.78);
    const hullMaterial = new THREE.MeshStandardMaterial({
      color: '#1e5265',
      roughness: 0.49,
      metalness: 0.32,
      emissive: '#082936',
      emissiveIntensity: 0.16,
    });
    const brass = new THREE.MeshStandardMaterial({ color: '#a88b5d', roughness: 0.48, metalness: 0.58 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#80c6d5',
      roughness: 0.2,
      metalness: 0.18,
      clearcoat: 0.28,
      clearcoatRoughness: 0.36,
      transparent: true,
      opacity: 0.78,
    });
    const darkMetal = new THREE.MeshStandardMaterial({ color: '#203843', roughness: 0.7, metalness: 0.64 });

    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(1.65, 5.2, 8, 20), hullMaterial);
    hull.rotation.x = Math.PI / 2;
    group.add(hull);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(1.55, 2.5, 24), hullMaterial);
    bow.rotation.x = -Math.PI / 2;
    bow.position.z = -4.1;
    group.add(bow);
    const sternCollar = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.13, 8, 28), brass);
    sternCollar.rotation.x = Math.PI / 2;
    sternCollar.position.z = 3.1;
    group.add(sternCollar);

    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(1.28, 28, 20), glass);
    cockpit.scale.set(0.9, 0.83, 1.18);
    cockpit.position.set(0, 1.05, -1.75);
    group.add(cockpit);
    const cockpitRim = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.12, 10, 32), brass);
    cockpitRim.scale.set(0.92, 1, 1.12);
    cockpitRim.position.set(0, 1.05, -1.75);
    group.add(cockpitRim);

    for (const side of [-1, 1]) {
      for (let port = 0; port < 3; port += 1) {
        const porthole = new THREE.Group();
        porthole.position.set(side * 1.5, 0.2, 0.35 + port * 1.2);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 8, 20), brass);
        ring.rotation.y = Math.PI / 2;
        porthole.add(ring);
        const lens = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), glass);
        lens.scale.x = 0.4;
        porthole.add(lens);
        group.add(porthole);
      }

      const stabilizer = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 1.5), hullMaterial);
      stabilizer.position.set(side * 1.55, -0.35, 2.75);
      stabilizer.rotation.y = side * 0.13;
      group.add(stabilizer);

      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.5, 4), hullMaterial);
      fin.scale.set(0.55, 1, 1.25);
      fin.rotation.z = side * Math.PI / 2;
      fin.position.set(side * 1.45, 0.1, 2.6);
      group.add(fin);

      const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.64, 2.1, 16), darkMetal);
      thruster.rotation.x = Math.PI / 2;
      thruster.position.set(side * 1.1, -0.3, 3.7);
      group.add(thruster);
      const nozzle = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.11, 8, 24), brass);
      nozzle.position.set(side * 1.1, -0.3, 4.78);
      group.add(nozzle);
      const propeller = this.createPropeller(brass);
      propeller.position.set(side * 1.1, -0.3, 4.9);
      group.add(propeller);
      this.propellers.push(propeller);

      const headlamp = new THREE.SpotLight('#d9f2e9', 72, 42, Math.PI / 7, 0.52, 1.4);
      headlamp.position.set(side * 0.75, 0.15, -3.9);
      const target = new THREE.Object3D();
      target.position.set(side * 1.5, -0.8, -24);
      group.add(headlamp, target);
      headlamp.target = target;
      headlamp.castShadow = false;
      const lampHousing = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), brass);
      lampHousing.position.copy(headlamp.position);
      group.add(lampHousing);
      const lens = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 12, 10),
        new THREE.MeshBasicMaterial({ color: '#e2f5d9' })
      );
      lens.position.copy(headlamp.position);
      lens.position.z -= 0.08;
      group.add(lens);
    }

    const dorsalFin = new THREE.Mesh(new THREE.ConeGeometry(0.84, 1.8, 4), hullMaterial);
    dorsalFin.scale.set(0.8, 1, 0.6);
    dorsalFin.position.set(0, 1.65, 2.1);
    group.add(dorsalFin);

    const keel = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.2, 2.3), hullMaterial);
    keel.position.set(0, -1.3, 1.9);
    group.add(keel);

    const navigationRed = new THREE.PointLight('#d97870', 2, 8, 2);
    navigationRed.position.set(-1.7, 0.2, 1.8);
    const navigationGreen = new THREE.PointLight('#73c7aa', 2, 8, 2);
    navigationGreen.position.set(1.7, 0.2, 1.8);
    group.add(navigationRed, navigationGreen);

    const wakeGeometry = new THREE.BufferGeometry();
    this.wakePositions = new THREE.BufferAttribute(new Float32Array(42), 3);
    wakeGeometry.setAttribute('position', this.wakePositions);
    this.wakeMaterial = new THREE.PointsMaterial({
      color: '#b7e6e4',
      size: 0.22,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const wake = new THREE.Points(wakeGeometry, this.wakeMaterial);
    wake.frustumCulled = false;
    group.add(wake);

    return group;
  }

  private createPropeller(material: THREE.Material) {
    const propeller = new THREE.Group();
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.46, 12), material);
    hub.rotation.x = Math.PI / 2;
    propeller.add(hub);
    for (let bladeIndex = 0; bladeIndex < 4; bladeIndex += 1) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.9, 0.16), material);
      blade.rotation.z = bladeIndex * Math.PI / 2;
      blade.position.y = 0.42;
      propeller.add(blade);
    }
    return propeller;
  }

  private emitTelemetry() {
    this.callbacks.onTelemetry?.({
      speed: Math.abs(this.vehicle.velocity.z) * 2.4,
      depth: Math.max(22, 32 - this.submarine.position.y * 3.5),
      heading: (360 - THREE.MathUtils.radToDeg(this.vehicle.yaw) + 360) % 360,
      boost: this.input.boost,
      sonarReady: performance.now() - this.lastSonarTime >= SONAR_COOLDOWN_MS,
      discoveryCount: this.artifactCollected.size,
      interactionLabel: this.nearbyArtifactId ? 'PRESS E TO COLLECT' : 'APPROACH AN ARTIFACT',
      nearbyArtifact: this.nearbyArtifactId
        ? relics.find((artifact) => artifact.id === this.nearbyArtifactId)
        : undefined,
      nearbyLandmark: this.nearbyLandmark,
      navigationTarget: this.navigationTarget,
      navigationDistance: this.navigationDistance,
      navigationBearing: this.navigationBearing,
      statusMessage: this.nearbyLandmark
        ? `${this.nearbyLandmark.name} in range`
        : this.navigationTarget
          ? `${this.navigationTarget.name} · ${Math.round(this.navigationDistance)} m`
          : 'Cruising the abyssal shelf',
    });
  }
}
