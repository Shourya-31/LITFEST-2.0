export interface LandmarkDefinition {
  id: string;
  kind: 'gateway' | 'archive' | 'amphitheatre' | 'lighthouse' | 'galleon' | 'oracle' | 'festival';
  name: string;
  description: string;
  position: [number, number, number];
  accent: string;
  route?: string;
}

export type AbyssalNavigationTarget =
  | 'home'
  | 'timeline'
  | 'about'
  | 'arcade'
  | 'sponsors'
  | 'faq'
  | 'contact'
  | 'events'
  | 'register';

export interface RelicDefinition {
  id: string;
  name: string;
  landmarkId: string;
  destination: string;
  route: AbyssalNavigationTarget;
  position: [number, number, number];
  color: string;
}

export interface GlobalProgress {
  collected: string[];
}

export interface ExplorerTelemetry {
  speed: number;
  depth: number;
  heading: number;
  boost: boolean;
  sonarReady: boolean;
  discoveryCount: number;
  interactionLabel: string;
  nearbyArtifact?: RelicDefinition;
  nearbyLandmark?: LandmarkDefinition;
  navigationTarget?: LandmarkDefinition;
  navigationDistance?: number;
  navigationBearing?: number;
  statusMessage: string;
}
