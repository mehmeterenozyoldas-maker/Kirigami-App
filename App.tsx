
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { BlueprintCanvas } from './components/BlueprintCanvas';
import { Visualizer3D } from './components/Visualizer3D';
import { PatternParams } from './types';
import { TUTORIAL_STEPS } from './constants';
import { generateKirigamiPattern, calculateStrips } from './geometry';

// Initial Params
const INITIAL_PARAMS: PatternParams = {
  mode: 'WAVE',
  sliceCount: 20,
  sliceWidth: 12,
  gap: 5,
  minSize: 15,
  
  // Wave
  amplitude: 60,
  frequency: 1.0,
  phase: 0,

  // Gaussian
  spread: 0.5,
  center: 0.5,

  // Noise
  seed: 42,
  roughness: 40,

  // Fractals
  fractalIteration: 3,
  fractalZoom: 1.0,
  fractalOffsetX: 0,
  fractalOffsetY: 0,
  branchAngle: 25,

  // Physics / Speculative
  physicsMode: 'REALISTIC',
  showStress: false,
  showGhostTrails: false,
  showScaleRef: false,
  paperMaterial: 'MATTE_CARDSTOCK',

  // Lighting
  lampAngle: 45,
  lampHeight: 400,
  lampDistance: 300,
};

// Custom Hook for Spring Physics on Parameters (Morphing)
const useSmoothParams = (target: PatternParams) => {
  const [current, setCurrent] = useState(target);
  const requestRef = useRef<number>(null);
  
  // We only smooth visual numeric properties. Discrete props (mode, booleans) update instantly.
  useEffect(() => {
    const animate = () => {
      let needsUpdate = false;
      const next = { ...current };

      // Helper for Lerp
      const smooth = (key: keyof PatternParams, speed = 0.1) => {
        const tVal = target[key];
        const cVal = current[key];
        if (typeof tVal === 'number' && typeof cVal === 'number') {
           const diff = tVal - cVal;
           if (Math.abs(diff) > 0.01) {
              // @ts-ignore
              next[key] = cVal + diff * speed;
              needsUpdate = true;
           } else {
              // @ts-ignore
              next[key] = tVal; // Snap
           }
        } else {
            // @ts-ignore
            next[key] = tVal;
        }
      };

      // Apply smoothing to morphable properties
      smooth('amplitude', 0.15);
      smooth('frequency', 0.1);
      smooth('spread', 0.1);
      smooth('center', 0.1);
      smooth('roughness', 0.1);
      smooth('fractalZoom', 0.1);
      
      // Discrete or non-morphable updates (instant)
      next.mode = target.mode;
      next.sliceCount = target.sliceCount; // Changing count re-mounts geometry anyway
      next.sliceWidth = target.sliceWidth;
      next.physicsMode = target.physicsMode;
      next.showStress = target.showStress;
      next.showGhostTrails = target.showGhostTrails;
      next.showScaleRef = target.showScaleRef;
      next.paperMaterial = target.paperMaterial;

      if (needsUpdate) {
         setCurrent(next);
         requestRef.current = requestAnimationFrame(animate);
      } else {
         setCurrent(target);
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [target]); // Re-trigger when target changes, but logic runs in RAF

  return current;
};


function App() {
  const [params, setParams] = useState<PatternParams>(INITIAL_PARAMS);
  const [stepIndex, setStepIndex] = useState(0);
  const [foldProgress, setFoldProgress] = useState(0);

  // Apply Spring Physics for "Settling" effect
  // Note: We only use smoothed params for 3D visualizer to avoid jitter in Blueprint
  const smoothParams = useSmoothParams(params);

  // 1. Math Phase: Calculate abstract geometry (strips)
  // Use smooth params for 3D to get morphing
  const strips3D = useMemo(() => calculateStrips(smoothParams), [smoothParams]);
  
  // Use raw params for Blueprint so lines don't wiggle while settling
  const strips2D = useMemo(() => calculateStrips(params), [params]);

  // 2. Blueprint Phase: Convert strips to 2D lines
  const pattern = useMemo(() => generateKirigamiPattern(strips2D, params), [strips2D, params]);
  
  const currentStep = TUTORIAL_STEPS[stepIndex];

  // Animate Fold Progress when step changes
  useEffect(() => {
    let animationFrameId: number;
    const target = currentStep.targetFoldProgress;
    
    const animate = () => {
      setFoldProgress(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.005) return target;
        return prev + diff * 0.15; // Smooth ease
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [stepIndex, currentStep.targetFoldProgress]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-50">
      
      {/* Left: Controls & Instructions */}
      <ControlPanel 
        params={params} 
        setParams={setParams} 
        currentStepIndex={stepIndex} 
        setStepIndex={setStepIndex}
        steps={TUTORIAL_STEPS}
      />

      {/* Middle: 3D Visualization */}
      <div className="flex-1 relative border-r border-slate-200">
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-slate-600 shadow-sm border border-slate-200 flex gap-2">
           <span>3D Preview</span>
           {params.physicsMode === 'IMPOSSIBLE' && <span className="text-purple-600 font-bold">IMPOSSIBLE MODE</span>}
        </div>
        
        {/* Pass the calculated strips directly to the 3D visualizer */}
        <Visualizer3D 
            params={smoothParams} 
            setParams={setParams} // Pass setter for direct manipulation
            strips={strips3D} 
            foldProgress={foldProgress} 
        />
        
        {/* Manual Fold Slider Overlay for playground feel */}
        {stepIndex === 0 && (
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 w-64">
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block text-center">Manual Fold Preview</label>
             <input 
               type="range" min="0" max="1" step="0.01"
               value={foldProgress}
               onChange={(e) => setFoldProgress(parseFloat(e.target.value))}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
           </div>
        )}
      </div>

      {/* Right: 2D Blueprint */}
      <div className="flex-1 relative md:w-1/3 min-w-[300px] flex flex-col">
        <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-slate-600 shadow-sm border border-slate-200">
          2D Blueprint
        </div>
        <BlueprintCanvas pattern={pattern} currentStep={currentStep} />
      </div>
    </div>
  );
}

export default App;
