
import React, { useState } from 'react';
import { PatternParams, TutorialStep, DesignMode } from '../types';
import { ChevronRight, ChevronLeft, Settings, Activity, Layers, Maximize, Zap, BarChart3, Binary, Scaling, Move, RefreshCw, Box, Ghost, AlertTriangle, Infinity as InfinityIcon, Lightbulb, Sun, GitBranch, Disc, Globe, PenTool, ToggleRight } from 'lucide-react';

interface Props {
  params: PatternParams;
  setParams: (p: PatternParams) => void;
  currentStepIndex: number;
  setStepIndex: (i: number) => void;
  steps: TutorialStep[];
}

export const ControlPanel: React.FC<Props> = ({ 
  params, setParams, currentStepIndex, setStepIndex, steps 
}) => {
  const [isEngineerMode, setIsEngineerMode] = useState(false);
  
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) setStepIndex(currentStepIndex + 1);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setStepIndex(currentStepIndex - 1);
  };

  const updateParam = (key: keyof PatternParams, value: any) => {
      setParams({ ...params, [key]: value });
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm z-10 w-full md:w-80 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kirigami Lab</h1>
        <p className="text-sm text-slate-500 mt-1">Parametric Pop-up Workshop</p>
      </div>

      {/* Tutorial Card */}
      <div className="p-6 flex-grow flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Step {currentStepIndex + 1} / {steps.length}
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-slate-800">{currentStep.title}</h2>
        <p className="text-slate-600 leading-relaxed text-sm">
          {currentStep.description}
        </p>

        <div className="flex gap-2 mt-4">
          <button 
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" /> Prev
          </button>
          <button 
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200 transition-colors"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Parameters Controls */}
      <div className="p-6 bg-slate-50 border-t border-slate-200">
        
        {/* Progressive Disclosure Toggle */}
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2 text-slate-800">
              <Settings size={18} />
              <h3 className="font-semibold text-sm">Design Config</h3>
           </div>
           <button 
              onClick={() => setIsEngineerMode(!isEngineerMode)}
              className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 transition-all ${isEngineerMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}
           >
              {isEngineerMode ? 'Engineer Mode' : 'Simple Mode'}
              <ToggleRight size={14} />
           </button>
        </div>

        <div className="space-y-6">
          
          {/* Design Mode Selector - Always Visible */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pattern Logic</label>
             <div className="relative">
                 <select 
                    value={params.mode}
                    onChange={(e) => updateParam('mode', e.target.value as DesignMode)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                 >
                     <optgroup label="Basics">
                        <option value="STAIRS">Classic Stairs</option>
                        <option value="WAVE">Sine Wave</option>
                     </optgroup>
                     <optgroup label="Spherical & Circular">
                        <option value="RIPPLES">Radial Ripples</option>
                        <option value="HEMISPHERE">Smooth Hemisphere</option>
                        <option value="TORUS">Torus / Donut</option>
                     </optgroup>
                     <optgroup label="Ullagami / Architectural">
                        <option value="RECURSIVE">Recursive City</option>
                        <option value="PYRAMID">Stepped Pyramid</option>
                        <option value="FRACTAL_SPIRES">Fractal Spires</option>
                        <option value="RADIAL_DOME">Radial Dome (Voxel)</option>
                     </optgroup>
                     <optgroup label="Math & Stats">
                        <option value="GAUSSIAN">Gaussian Pulse</option>
                        <option value="NOISE">Computational Noise</option>
                        <option value="HEART">Cardioid Heart</option>
                     </optgroup>
                     <optgroup label="Advanced Fractals">
                        <option value="MANDELBROT">Mandelbrot Set</option>
                        <option value="KOCH">Koch Snowflake</option>
                        <option value="LSYSTEM">L-System Tree</option>
                        <option value="CITYSCAPE">Generative Cityscape</option>
                     </optgroup>
                 </select>
                 <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                     <Settings size={14} />
                 </div>
             </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Paper Material Selector */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paper Material</label>
             <div className="flex gap-2">
                <button 
                  onClick={() => updateParam('paperMaterial', 'MATTE_CARDSTOCK')}
                  className={`flex-1 py-2 text-xs font-medium rounded-md border ${params.paperMaterial === 'MATTE_CARDSTOCK' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  Matte
                </button>
                <button 
                  onClick={() => updateParam('paperMaterial', 'TRANSLUCENT_VELLUM')}
                  className={`flex-1 py-2 text-xs font-medium rounded-md border ${params.paperMaterial === 'TRANSLUCENT_VELLUM' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  Vellum
                </button>
                <button 
                  onClick={() => updateParam('paperMaterial', 'HOLOGRAPHIC_FOIL')}
                  className={`flex-1 py-2 text-xs font-medium rounded-md border ${params.paperMaterial === 'HOLOGRAPHIC_FOIL' ? 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 text-slate-900 border-purple-400' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  Foil
                </button>
             </div>
          </div>

          {/* Scale Ref - UX Improvement */}
          <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                   <PenTool size={14}/> Show Scale Ref (Pencil)
                </label>
                <button 
                   onClick={() => updateParam('showScaleRef', !params.showScaleRef)}
                   className={`w-10 h-5 rounded-full relative transition-colors ${params.showScaleRef ? 'bg-slate-700' : 'bg-slate-300'}`}
                >
                   <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${params.showScaleRef ? 'translate-x-5' : ''}`} />
                </button>
          </div>

          {/* Macro Controls - Always Visible */}
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="flex justify-between text-xs font-medium text-slate-600">
                  <span className="flex items-center gap-1"><Layers size={14}/> Slices</span>
                  <span className="bg-slate-200 px-1.5 rounded text-[10px]">{params.sliceCount}</span>
                </label>
                <input 
                  type="range" min="3" max="50" step="1"
                  value={params.sliceCount}
                  onChange={(e) => updateParam('sliceCount', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
             </div>
             
             <div className="space-y-2">
                <label className="flex justify-between text-xs font-medium text-slate-600">
                   <span className="flex items-center gap-1"><Maximize size={14}/> Amplitude / Height</span>
                   <span className="bg-slate-200 px-1.5 rounded text-[10px]">{Math.round(params.amplitude)}</span>
                </label>
                <input 
                  type="range" min="10" max={params.physicsMode === 'IMPOSSIBLE' ? "400" : "150"} step="5"
                  value={params.amplitude}
                  onChange={(e) => updateParam('amplitude', Number(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${params.physicsMode === 'IMPOSSIBLE' ? 'bg-purple-200 accent-purple-600' : 'bg-slate-200 accent-blue-600'}`}
                />
             </div>
          </div>

          {/* Advanced / Engineer Mode Section */}
          {isEngineerMode && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                
                <div className="h-px bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Detailed Params</span>

                {/* Conditional Params based on Mode */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4 shadow-sm">
                    {/* Wave / Ripples */}
                    {(params.mode === 'WAVE' || params.mode === 'RIPPLES' || params.mode === 'FRACTAL_SPIRES') && (
                    <>
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-medium text-slate-600">
                                <span className="flex items-center gap-1"><Activity size={14}/> Frequency</span>
                                <span>{params.frequency.toFixed(1)}</span>
                            </label>
                            <input type="range" min="0.2" max="4.0" step="0.1" value={params.frequency} onChange={(e) => updateParam('frequency', Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500" />
                        </div>
                        {(params.mode === 'WAVE' || params.mode === 'RIPPLES') && (
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-medium text-slate-600">Phase / Animation</label>
                            <input type="range" min="0" max="6.28" step="0.1" value={params.phase} onChange={(e) => updateParam('phase', Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500" />
                        </div>
                        )}
                    </>
                    )}

                    {/* Gaussian / Spherical Radius Controls */}
                    {(params.mode === 'GAUSSIAN' || params.mode === 'HEMISPHERE' || params.mode === 'TORUS') && (
                    <>
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-medium text-slate-600">
                                <span className="flex items-center gap-1">
                                    {params.mode === 'GAUSSIAN' ? <BarChart3 size={14}/> : <Disc size={14}/>} 
                                    {params.mode === 'TORUS' ? 'Ring Thickness (Spread)' : params.mode === 'HEMISPHERE' ? 'Dome Radius' : 'Spread'}
                                </span>
                                <span>{params.spread.toFixed(1)}</span>
                            </label>
                            <input type="range" min="0.1" max="2.0" step="0.1" value={params.spread} onChange={(e) => updateParam('spread', Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-medium text-slate-600">
                                {params.mode === 'TORUS' ? 'Ring Radius (Offset)' : 'Center Offset'}
                            </label>
                            <input type="range" min="0" max="1" step="0.05" value={params.center} onChange={(e) => updateParam('center', Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500" />
                        </div>
                    </>
                    )}

                    {params.mode === 'NOISE' && (
                    <>
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-medium text-slate-600">
                                <span className="flex items-center gap-1"><Zap size={14}/> Roughness</span>
                                <span>{params.roughness}</span>
                            </label>
                            <input type="range" min="10" max="100" step="5" value={params.roughness} onChange={(e) => updateParam('roughness', Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-medium text-slate-600">
                                <span className="flex items-center gap-1"><Binary size={14}/> Seed</span>
                                <span>{params.seed}</span>
                            </label>
                            <input type="range" min="1" max="100" step="1" value={params.seed} onChange={(e) => updateParam('seed', Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500" />
                        </div>
                    </>
                    )}

                    {/* Fractal Controls */}
                    {['MANDELBROT', 'KOCH', 'LSYSTEM', 'RECURSIVE', 'PYRAMID', 'FRACTAL_SPIRES', 'RADIAL_DOME'].includes(params.mode) && (
                        <>
                        <div className="space-y-2">
                            <label className="flex justify-between text-xs font-medium text-slate-600">
                                <span className="flex items-center gap-1"><RefreshCw size={14}/> Steps / Detail</span>
                                <span>{params.fractalIteration}</span>
                            </label>
                            <input type="range" min="1" max="6" step="1" value={params.fractalIteration} onChange={(e) => updateParam('fractalIteration', Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500" />
                        </div>
                        
                        {['RECURSIVE', 'MANDELBROT', 'KOCH', 'FRACTAL_SPIRES', 'LSYSTEM'].includes(params.mode) && (
                            <div className="space-y-2">
                                <label className="flex justify-between text-xs font-medium text-slate-600">
                                    <span className="flex items-center gap-1"><Scaling size={14}/> {params.mode === 'RECURSIVE' ? 'Floor Scale' : 'Zoom'}</span>
                                    <span>{params.fractalZoom.toFixed(1)}</span>
                                </label>
                                <input type="range" min="0.2" max="1.5" step="0.1" value={params.fractalZoom} onChange={(e) => updateParam('fractalZoom', Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500" />
                            </div>
                        )}
                        </>
                    )}
                </div>

                {/* Physics & Speculative Design Section */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-3">
                    <div className="flex items-center gap-2 mb-1 text-purple-900">
                        <Box size={14} />
                        <h3 className="font-bold text-[10px] uppercase tracking-wider">Speculative & Physics</h3>
                    </div>
                    
                    {/* Impossible Mode */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-purple-800 flex items-center gap-1">
                        <InfinityIcon size={12}/> Impossible Geometry
                        </label>
                        <button 
                        onClick={() => updateParam('physicsMode', params.physicsMode === 'REALISTIC' ? 'IMPOSSIBLE' : 'REALISTIC')}
                        className={`w-10 h-5 rounded-full relative transition-colors ${params.physicsMode === 'IMPOSSIBLE' ? 'bg-purple-600' : 'bg-slate-300'}`}
                        >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${params.physicsMode === 'IMPOSSIBLE' ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {/* Stress Map */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-purple-800 flex items-center gap-1">
                        <AlertTriangle size={12}/> Stress Heatmap
                        </label>
                        <button 
                        onClick={() => updateParam('showStress', !params.showStress)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${params.showStress ? 'bg-red-500' : 'bg-slate-300'}`}
                        >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${params.showStress ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {/* Ghost Trails */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-purple-800 flex items-center gap-1">
                        <Ghost size={12}/> 4D Ghost Trails
                        </label>
                        <button 
                        onClick={() => updateParam('showGhostTrails', !params.showGhostTrails)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${params.showGhostTrails ? 'bg-blue-500' : 'bg-slate-300'}`}
                        >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${params.showGhostTrails ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Lighting & Atmosphere */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 space-y-3">
                    <div className="flex items-center gap-2 mb-1 text-amber-900">
                        <Sun size={14} />
                        <h3 className="font-bold text-[10px] uppercase tracking-wider">Lighting & Atmosphere</h3>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="flex justify-between text-xs font-medium text-amber-800">
                            <span className="flex items-center gap-1">Lamp Angle</span>
                            <span>{params.lampAngle}°</span>
                        </label>
                        <input type="range" min="0" max="360" step="5" value={params.lampAngle} onChange={(e) => updateParam('lampAngle', Number(e.target.value))} className="w-full h-1.5 bg-amber-200 rounded-lg accent-amber-600" />
                    </div>

                    <div className="space-y-2">
                        <label className="flex justify-between text-xs font-medium text-amber-800">
                            <span className="flex items-center gap-1">Lamp Height</span>
                            <span>{params.lampHeight}</span>
                        </label>
                        <input type="range" min="100" max="800" step="50" value={params.lampHeight} onChange={(e) => updateParam('lampHeight', Number(e.target.value))} className="w-full h-1.5 bg-amber-200 rounded-lg accent-amber-600" />
                    </div>

                    <div className="space-y-2">
                        <label className="flex justify-between text-xs font-medium text-amber-800">
                            <span className="flex items-center gap-1">Lamp Distance</span>
                            <span>{params.lampDistance}</span>
                        </label>
                        <input type="range" min="100" max="800" step="50" value={params.lampDistance} onChange={(e) => updateParam('lampDistance', Number(e.target.value))} className="w-full h-1.5 bg-amber-200 rounded-lg accent-amber-600" />
                    </div>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
