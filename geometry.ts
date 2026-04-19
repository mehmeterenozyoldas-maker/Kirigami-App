
import { KirigamiPattern, LineSegment, LineType, Face3D, PatternParams, StripData } from './types';

// Global Dimensions
export const PAPER_W = 500;
export const PAPER_H = 600;

// Pseudo-random number generator for deterministic "Noise" mode
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

// --- Helper Types for Fractals ---
interface Point { x: number; y: number; }

// --- Koch Curve Generator ---
const generateKochPoints = (p1: Point, p2: Point, depth: number): Point[] => {
    if (depth === 0) return [p1, p2];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Divide into 3 segments
    const pA = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
    const pB = { x: p1.x + 2 * dx / 3, y: p1.y + 2 * dy / 3 };

    const segX = dx/3;
    const segY = dy/3;
    const sin60 = Math.sin(-Math.PI / 3);
    const cos60 = Math.cos(-Math.PI / 3);
    
    const peakX = pA.x + (segX * cos60 - segY * sin60);
    const peakY = pA.y + (segX * sin60 + segY * cos60);
    const pPeak = { x: peakX, y: peakY };

    return [
        ...generateKochPoints(p1, pA, depth - 1),
        ...generateKochPoints(pA, pPeak, depth - 1).slice(1),
        ...generateKochPoints(pPeak, pB, depth - 1).slice(1),
        ...generateKochPoints(pB, p2, depth - 1).slice(1)
    ];
};

// --- Recursive Step / Cantor Function ---
const getRecursiveHeight = (t: number, depth: number, scale: number): number => {
    if (depth <= 0) return 1.0;

    // Split domain 0..1 into three parts
    const localT = t % 1; 

    if (localT > 0.333 && localT < 0.666) {
        // Center valley
        return scale * getRecursiveHeight((localT - 0.333) * 3, depth - 1, scale);
    } else {
        // Side peaks
        if (localT <= 0.333) {
            return getRecursiveHeight(localT * 3, depth - 1, scale);
        } else {
            return getRecursiveHeight((localT - 0.666) * 3, depth - 1, scale);
        }
    }
};

// Core Math Engine: Calculates the dimensions of each strip based on the mode
export const calculateStrips = (params: PatternParams): StripData[] => {
    const { 
        sliceCount, sliceWidth, gap, minSize, 
        amplitude, frequency, phase,
        mode, spread, center, seed, roughness,
        fractalIteration, fractalZoom, fractalOffsetX, fractalOffsetY,
        branchAngle
    } = params;

    const strips: StripData[] = [];
    const stride = sliceWidth + gap;
    const totalPatternWidth = sliceCount * stride - gap;

    // Pre-calculation for global modes (Koch, L-System)
    let kochPoints: Point[] = [];
    const lSystemHeights = new Array(sliceCount).fill(0);

    if (mode === 'KOCH') {
        const pStart = {x: 0, y: 0};
        const pEnd = {x: 1, y: 0};
        kochPoints = generateKochPoints(pStart, pEnd, Math.min(fractalIteration, 5));
    } else if (mode === 'LSYSTEM') {
         const depth = Math.min(fractalIteration, 5);
         let current = "X";
         for(let i=0; i<depth; i++) current = current.replace(/X/g, "F[+X]F[-X]+X").replace(/F/g, "FF");
         
         let x = 0; 
         let y = 0; 
         let angle = Math.PI / 2;
         const radAngle = (branchAngle || 25) * Math.PI / 180;
         const scale = fractalZoom > 0 ? fractalZoom : 1.0;
         const stepLen = (1.0 / (Math.pow(2, depth) * 2)) * scale;

         const stack: {x: number, y: number, angle: number}[] = [];
         const addSegment = (x1: number, y1: number, x2: number, y2: number) => {
             const numSteps = 20; 
             for(let i=0; i<=numSteps; i++) {
                 const t = i/numSteps;
                 const px = x1 + (x2-x1)*t; 
                 const py = y1 + (y2-y1)*t; 
                 const normX = px + 0.5; 
                 if (normX >= 0 && normX <= 1) {
                     const sliceIdx = Math.floor(normX * sliceCount);
                     if (sliceIdx >= 0 && sliceIdx < sliceCount) {
                         if (py > lSystemHeights[sliceIdx]) {
                             lSystemHeights[sliceIdx] = py;
                         }
                     }
                 }
             }
         };

         for (const char of current) {
             if (char === 'F') {
                 const nx = x + Math.cos(angle) * stepLen;
                 const ny = y + Math.sin(angle) * stepLen;
                 addSegment(x, y, nx, ny);
                 x = nx;
                 y = ny;
             } else if (char === '+') angle -= radAngle;
             else if (char === '-') angle += radAngle;
             else if (char === '[') {
                 stack.push({x, y, angle});
             } else if (char === ']') {
                 const state = stack.pop();
                 if (state) {
                     x = state.x;
                     y = state.y;
                     angle = state.angle;
                 }
             }
         }
    }


    for (let i = 0; i < sliceCount; i++) {
        const t = i / (sliceCount - 1 || 1);
        const x = (-totalPatternWidth / 2) + (i * stride) + (sliceWidth / 2);

        let size = minSize;

        switch (mode) {
            case 'STAIRS':
                size = minSize + t * amplitude;
                break;

            case 'WAVE':
                const angleW = t * Math.PI * 2 * frequency + phase;
                size = minSize + (Math.sin(angleW) + 1) * 0.5 * amplitude;
                break;

            case 'GAUSSIAN':
                const domain = 4; 
                const gX = (t - 0.5) * domain - (center - 0.5) * 2; 
                const sigma = Math.max(0.1, spread); 
                const gauss = Math.exp(-(gX * gX) / (2 * sigma * sigma));
                size = minSize + gauss * amplitude;
                break;

            case 'NOISE':
                const r = seededRandom(seed + i * 13.5);
                size = minSize + r * roughness;
                break;
            
            case 'MANDELBROT':
                const mX = ((t - 0.5) * 3.0 / fractalZoom) + fractalOffsetX - 0.5; 
                const mY = fractalOffsetY;
                let zr = 0, zi = 0;
                let iter = 0;
                const maxIter = 50 * fractalIteration; 
                while (zr*zr + zi*zi <= 4 && iter < maxIter) {
                    const temp = zr*zr - zi*zi + mX;
                    zi = 2*zr*zi + mY;
                    zr = temp;
                    iter++;
                }
                const val = iter === maxIter ? 0 : iter / maxIter; 
                size = minSize + val * amplitude * 2;
                break;

            case 'KOCH':
                if (kochPoints.length > 0) {
                   for(let k=0; k < kochPoints.length - 1; k++) {
                       if (t >= kochPoints[k].x && t <= kochPoints[k+1].x) {
                           const pA = kochPoints[k];
                           const pB = kochPoints[k+1];
                           const span = pB.x - pA.x;
                           const localT = (t - pA.x) / (span || 0.0001);
                           const y = pA.y + (pB.y - pA.y) * localT;
                           size = minSize + Math.abs(y) * amplitude * 2; 
                           break;
                       }
                   }
                }
                break;

            case 'LSYSTEM':
                size = minSize + (lSystemHeights[i] * amplitude * 3); 
                break;

            case 'RECURSIVE': {
                const depth = Math.max(1, Math.min(fractalIteration, 6));
                const scale = Math.max(0.2, Math.min(fractalZoom, 0.8));
                const recVal = getRecursiveHeight(t, depth, scale);
                size = minSize + recVal * amplitude;
                break;
            }

            case 'PYRAMID': {
                const centerIdx = sliceCount / 2;
                const dist = Math.abs(i - centerIdx + 0.5) / (sliceCount / 2);
                const steps = Math.max(2, fractalIteration * 2); 
                const quantizedDist = Math.floor(dist * steps) / steps;
                const shape = Math.max(0, 1.0 - quantizedDist);
                size = minSize + shape * amplitude;
                break;
            }

            case 'FRACTAL_SPIRES': {
                const base = Math.sin(t * Math.PI * 2 * frequency + phase);
                const detailFreq = 5 + (fractalIteration * 3);
                const detail = Math.sin(t * Math.PI * detailFreq);
                const signal = (base + detail * 0.5);
                const steps = 4 + fractalIteration * 2;
                const quantized = Math.floor(Math.abs(signal) * steps) / steps;
                size = minSize + quantized * amplitude;
                break;
            }

            case 'RADIAL_DOME': {
                const centerIdx = sliceCount / 2;
                const distNorm = Math.abs(i - centerIdx + 0.5) / (sliceCount / 2);
                const d = Math.min(1.0, distNorm);
                const sphereProfile = Math.sqrt(Math.max(0, 1.0 - d*d));
                const steps = Math.max(3, fractalIteration * 3);
                const terraced = Math.floor(sphereProfile * steps) / steps;
                size = minSize + terraced * amplitude;
                break;
            }
            
            case 'RIPPLES': {
                // Concentric ripples
                // Distance from center 0..1
                const centerIdx = sliceCount / 2;
                const distNorm = Math.abs(i - centerIdx + 0.5) / (sliceCount / 2);
                // Sine wave based on radial distance
                // Phase animates it outwards
                const rAngle = distNorm * Math.PI * 2 * frequency + phase;
                const wave = (Math.sin(rAngle) + 1) * 0.5;
                size = minSize + wave * amplitude;
                break;
            }

            case 'HEMISPHERE': {
                // Smooth sphere profile
                const centerIdx = sliceCount / 2;
                const distNorm = Math.abs(i - centerIdx + 0.5) / (sliceCount / 2);
                // Use 'spread' as radius control (0.1 to 1.5)
                const radius = Math.max(0.1, spread);
                
                if (distNorm > radius) {
                    size = minSize;
                } else {
                    // x^2 + y^2 = r^2  => y = sqrt(r^2 - x^2)
                    // We normalize x to the radius to get a 0..1 domain for the curve
                    const xLocal = distNorm / radius;
                    const h = Math.sqrt(Math.max(0, 1.0 - xLocal * xLocal));
                    size = minSize + h * amplitude;
                }
                break;
            }

            case 'TORUS': {
                // Torus cross section
                // Uses 'center' as Major Radius (position of ring)
                // Uses 'spread' as Minor Radius (thickness of ring)
                const centerIdx = sliceCount / 2;
                const distNorm = Math.abs(i - centerIdx + 0.5) / (sliceCount / 2);
                
                const majorR = Math.max(0.1, center); // Position of the ring peak
                const minorR = Math.max(0.1, spread * 0.5); // Thickness of ring
                
                const distFromRing = Math.abs(distNorm - majorR);
                
                if (distFromRing > minorR) {
                    size = minSize;
                } else {
                    // Semicircle profile for the tube
                    const xLocal = distFromRing / minorR;
                    const h = Math.sqrt(Math.max(0, 1.0 - xLocal * xLocal));
                    size = minSize + h * amplitude;
                }
                break;
            }
        }

        strips.push({
            index: i,
            x,
            width: sliceWidth,
            rise: size,
            run: size 
        });
    }

    return strips;
};

export const generateKirigamiPattern = (strips: StripData[], params: PatternParams): KirigamiPattern => {
  const { sliceCount, sliceWidth, gap } = params;
  
  const MID_Y = PAPER_H / 2;
  const segments: LineSegment[] = [];
  const faces: Face3D[] = [];

  // 1. Boundary
  segments.push(
    { id: 'b1', p1: { x: 0, y: 0 }, p2: { x: PAPER_W, y: 0 }, type: LineType.BOUNDARY, stepIds: [] },
    { id: 'b2', p1: { x: PAPER_W, y: 0 }, p2: { x: PAPER_W, y: PAPER_H }, type: LineType.BOUNDARY, stepIds: [] },
    { id: 'b3', p1: { x: PAPER_W, y: PAPER_H }, p2: { x: 0, y: PAPER_H }, type: LineType.BOUNDARY, stepIds: [] },
    { id: 'b4', p1: { x: 0, y: PAPER_H }, p2: { x: 0, y: 0 }, type: LineType.BOUNDARY, stepIds: [] }
  );

  const stride = sliceWidth + gap;
  const totalPatternWidth = sliceCount * stride - gap;
  const startX = (PAPER_W - totalPatternWidth) / 2;
  const endX = startX + totalPatternWidth;

  // Center Spine Folds
  segments.push({
      id: 'center_start',
      p1: { x: 0, y: MID_Y },
      p2: { x: startX, y: MID_Y },
      type: LineType.VALLEY,
      stepIds: [3]
  });
  segments.push({
      id: 'center_end',
      p1: { x: endX, y: MID_Y },
      p2: { x: PAPER_W, y: MID_Y },
      type: LineType.VALLEY,
      stepIds: [3]
  });

  for (let i = 0; i < sliceCount - 1; i++) {
      const gapX = startX + i * stride + sliceWidth;
      segments.push({
          id: `center_gap_${i}`,
          p1: { x: gapX, y: MID_Y },
          p2: { x: gapX + gap, y: MID_Y },
          type: LineType.VALLEY,
          stepIds: [3]
      });
  }

  strips.forEach((strip, i) => {
    const stripX = (PAPER_W / 2) + strip.x - (strip.width / 2);
    
    const topY = MID_Y - strip.rise;
    const bottomY = MID_Y + strip.run;
    const rightX = stripX + strip.width;
    
    segments.push({
      id: `cut_l_${i}`,
      p1: { x: stripX, y: topY },
      p2: { x: stripX, y: bottomY },
      type: LineType.CUT,
      stepIds: [1]
    });
    
    segments.push({
      id: `cut_r_${i}`,
      p1: { x: rightX, y: topY },
      p2: { x: rightX, y: bottomY },
      type: LineType.CUT,
      stepIds: [1]
    });
    
    segments.push({
      id: `fold_top_${i}`,
      p1: { x: stripX, y: topY },
      p2: { x: rightX, y: topY },
      type: LineType.VALLEY,
      stepIds: [3]
    });
    
    segments.push({
      id: `fold_knee_${i}`,
      p1: { x: stripX, y: MID_Y },
      p2: { x: rightX, y: MID_Y },
      type: LineType.MOUNTAIN,
      stepIds: [2] 
    });
    
    segments.push({
      id: `fold_bot_${i}`,
      p1: { x: stripX, y: bottomY },
      p2: { x: rightX, y: bottomY },
      type: LineType.VALLEY,
      stepIds: [3]
    });
  });

  return { segments, faces, width: PAPER_W, height: PAPER_H };
};
