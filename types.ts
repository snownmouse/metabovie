
// Core Domain Models

export enum NodeType {
  METABOLITE = 'metabolite',
  ENZYME = 'enzyme',
  COFACTOR = 'cofactor'
}

export interface Node {
  id: string;
  name: { en: string; zh: string };
  type: NodeType;
  formula?: string;
  description?: { en: string; zh: string };
  // Visual properties for D3 simulation
  x?: number;
  y?: number;
  fx?: number; // Fixed X for layout
  fy?: number; // Fixed Y for layout
  group?: string; // For coloring nodes by pathway in merged view
  compartment?: 'cytosol' | 'mitochondria'; // Subcellular localization
}

export interface Link {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  enzyme?: { en: string; zh: string }; // Forward enzyme
  enzymeReverse?: { en: string; zh: string }; // Reverse enzyme (for distinct bidirectional steps like PFK-1/FBPase-1)
  isReversible: boolean;
  // Simulation properties
  flux: number; // 0 to 1, determines thickness
  isActive: boolean;
  // Education properties
  examPoint?: { en: string; zh: string };
  isRateLimiting?: boolean; // Show Star for Key Regulatory Enzymes
}

export enum PathwayCategory {
  CARBOHYDRATE = 'carbohydrate',
  ENERGY = 'energy',
  LIPID = 'lipid',
  AMINO_ACID = 'amino_acid',
  NUCLEOTIDE = 'nucleotide',
  HEME = 'heme',
  INTEGRATION = 'integration'
}

export interface Pathway {
  id: string;
  category: PathwayCategory;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  nodes: Node[];
  links: Link[];
}

export enum AppMode {
  RESEARCH = 'research',
  EDUCATION = 'education'
}

export enum PhysioState {
  NORMAL = 'normal',
  STARVATION = 'starvation',
  FED = 'fed',
  EXERCISE = 'exercise',
  DIABETES = 'diabetes'
}

export type Language = 'en' | 'zh';

export interface SimulationRule {
  state: PhysioState;
  pathwayId: string; // Can be '*' for all
  fluxMultipliers: Record<string, number>; // LinkID -> Multiplier
}
