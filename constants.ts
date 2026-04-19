
import { LineType, TutorialStep } from './types';

export const COLORS = {
  paper: '#fdfbf7', // Warm white
  highlight: '#facc15', // Yellow for active step
  [LineType.CUT]: '#ef4444', // Red
  [LineType.MOUNTAIN]: '#3b82f6', // Blue
  [LineType.VALLEY]: '#22c55e', // Green
  [LineType.BOUNDARY]: '#94a3b8', // Slate 400
  [LineType.NONE]: '#e2e8f0',
};

export const LINE_STYLES = {
  [LineType.CUT]: 'stroke-red-500',
  [LineType.MOUNTAIN]: 'stroke-blue-500 stroke-dasharray-4-2', // Dashed
  [LineType.VALLEY]: 'stroke-green-500 stroke-dasharray-2-2', // Dotted
  [LineType.BOUNDARY]: 'stroke-slate-400',
  [LineType.NONE]: 'stroke-slate-200',
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 0,
    title: "Parametric Design",
    description: "Choose a Pattern Logic from the dropdown to start. Try 'Sine Wave' for fluids or 'Gaussian' for specific shapes.",
    highlightTypes: [],
    targetFoldProgress: 0,
  },
  {
    id: 1,
    title: "Cut the Slots",
    description: "Using a craft knife, cut the vertical RED lines. These separate the paper into individual flexible strips.",
    highlightTypes: [LineType.CUT],
    targetFoldProgress: 0,
  },
  {
    id: 2,
    title: "Mountain Fold Knees",
    description: "The central horizontal lines form the 'Knees' of the structure. Fold these UPWARDS (Mountain fold) so they point towards you.",
    highlightTypes: [LineType.MOUNTAIN],
    targetFoldProgress: 0.2,
  },
  {
    id: 3,
    title: "Valley Fold Anchors",
    description: "The top and bottom horizontal lines connect the strips to the base card. Fold these DOWNWARDS (Valley fold) to create the hinge.",
    highlightTypes: [LineType.VALLEY],
    targetFoldProgress: 0.2,
  },
  {
    id: 4,
    title: "Pop-up & Reveal",
    description: "Carefully fold the card to 90 degrees. The strips will naturally find their varying heights, revealing the computed form.",
    highlightTypes: [],
    targetFoldProgress: 1.0,
  },
];
