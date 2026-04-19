
export enum LineType {
  CUT = 'CUT',
  MOUNTAIN = 'MOUNTAIN',
  VALLEY = 'VALLEY',
  BOUNDARY = 'BOUNDARY',
  NONE = 'NONE' // For helper lines if needed
}

export type DesignMode = 
  | 'STAIRS' 
  | 'WAVE' 
  | 'GAUSSIAN' 
  | 'NOISE' 
  | 'MANDELBROT' 
  | 'KOCH' 
  | 'LSYSTEM'
  | 'RECURSIVE' // Cantor style
  | 'PYRAMID'   // Concentric/Stepped
  | 'FRACTAL_SPIRES' // New: Ullagami Ex 1 (Complex Asymmetric)
  | 'RADIAL_DOME'    // New: Ullagami Ex 2 (Geometric Sphere)
  | 'RIPPLES'        // New: Concentric Waves
  | 'TORUS'          // New: Donut shape
  | 'HEMISPHERE';    // New: Smooth Dome

export interface Point2D {
  x: number;
  y: number;
}

export interface LineSegment {
  id: string;
  p1: Point2D;
  p2: Point2D;
  type: LineType;
  stepIds: number[]; // Which tutorial steps highlight this line
}

export interface Face3D {
  id: string;
  vertices: [number, number, number][]; // 4 vertices for a quad
  color: string;
  type: 'base' | 'riser' | 'tread';
}

export interface KirigamiPattern {
  segments: LineSegment[];
  faces: Face3D[];
  width: number;
  height: number;
}

export interface PatternParams {
  mode: DesignMode;
  sliceCount: number; // Number of strips
  sliceWidth: number; // Width of each strip
  gap: number;        // Gap between strips
  minSize: number;    // Base depth/height
  
  // Wave Params
  amplitude: number;  
  frequency: number;  
  phase: number;
  
  // Gaussian Params
  spread: number;     // Width of the bell curve
  center: number;     // Offset of the peak
  
  // Noise Params
  seed: number;       // Random seed
  roughness: number;  // Magnitude of jitter

  // Fractal / Computational Params
  fractalIteration: number; // Detail level (1-6)
  fractalZoom: number;      // Scale factor
  fractalOffsetX: number;   // Pan X
  fractalOffsetY: number;   // Pan Y (or Imaginary component)
  branchAngle: number;      // Angle in degrees for L-System

  // Physics & Speculative Params
  physicsMode: 'REALISTIC' | 'IMPOSSIBLE';
  showStress: boolean;
  showGhostTrails: boolean;
  showScaleRef: boolean; // New: Toggle for the pencil scale reference

  // Lighting & Atmosphere
  lampAngle: number;    // 0-360 degrees around the object
  lampHeight: number;   // Height of the light
  lampDistance: number; // Distance from center
}

// Intermediate structure to share math between 2D and 3D
export interface StripData {
  index: number;
  x: number;      // Center X position relative to pattern center
  width: number;
  rise: number;   // Height of the riser
  run: number;    // Depth of the tread
}

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  highlightTypes: LineType[]; // Which line types to highlight in this step
  targetFoldProgress: number; // 0 (flat) to 1 (folded)
}
