
import React, { useRef } from 'react';
import { KirigamiPattern, LineType, TutorialStep } from '../types';
import { COLORS } from '../constants';
import { Download } from 'lucide-react';

interface Props {
  pattern: KirigamiPattern;
  currentStep: TutorialStep;
}

export const BlueprintCanvas: React.FC<Props> = ({ pattern, currentStep }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const padding = 20;
  // Calculate viewBox with padding
  const width = pattern.width + padding * 2;
  const height = pattern.height + padding * 2;

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    // Serialize the SVG DOM to string
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    
    // Add XML namespace if missing (browser usually adds it but good for safety)
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // Create Blob and download link
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `kirigami-pattern.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative flex flex-col h-full bg-white">
      {/* Title / Toolbar */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-lg shadow-sm z-10">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Blueprint Key</h3>
        <div className="space-y-1 text-[10px] text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 relative flex items-center justify-center">
               <div className="absolute inset-0 opacity-30" style={{ 
                   backgroundImage: 'linear-gradient(45deg, #ef4444 25%, transparent 25%, transparent 50%, #ef4444 50%, #ef4444 75%, transparent 75%, transparent)', 
                   backgroundSize: '4px 4px' 
               }}></div>
               <div className="w-full h-0 border-t-2 border-red-500 z-10"></div>
            </div>
            <span>Cut</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 flex items-center justify-center">
                <span className="w-full h-0 border-t-2 border-blue-500 border-dashed"></span>
            </div>
            <span>Mountain Fold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 flex items-center justify-center">
                <span className="w-full h-0 border-t-2 border-green-500 border-dotted"></span>
            </div>
            <span>Valley Fold</span>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button 
        onClick={handleDownload}
        className="absolute bottom-6 right-6 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2 font-medium text-sm z-20 hover:scale-105 active:scale-95"
        title="Download SVG for Printing"
      >
        <Download size={16} />
        <span>Download Blueprint</span>
      </button>

      <div className="flex-1 overflow-auto flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] p-8">
        <svg 
          ref={svgRef}
          width={width} 
          height={height} 
          viewBox={`-${padding} -${padding} ${width} ${height}`}
          className="bg-white shadow-xl max-h-full max-w-full border border-slate-100"
        >
            <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f1f5f9" strokeWidth="0.5"/>
                </pattern>
                {/* Hatch pattern for cuts */}
                <pattern id="cutHatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="4" stroke="#ef4444" strokeWidth="1.5" opacity="0.2" />
                </pattern>
            </defs>
            <rect x="0" y="0" width={pattern.width} height={pattern.height} fill="url(#grid)" />

          {/* Render Lines */}
          {pattern.segments.map((seg) => {
            const isHighlighted = currentStep.highlightTypes.includes(seg.type);
            
            // Base Style
            let stroke = COLORS[seg.type];
            let strokeWidth = 1.5;
            let dashArray = '';

            if (seg.type === LineType.MOUNTAIN) dashArray = '5, 3';
            if (seg.type === LineType.VALLEY) dashArray = '2, 2';

            if (isHighlighted) {
              strokeWidth = 3;
            }
            
            const isDimmed = currentStep.highlightTypes.length > 0 && !isHighlighted && seg.type !== LineType.BOUNDARY;

            return (
              <g key={seg.id} opacity={isDimmed ? 0.3 : 1}>
                {/* Hatch Highlight for CUT lines */}
                {seg.type === LineType.CUT && (
                    <line
                      x1={seg.p1.x}
                      y1={seg.p1.y}
                      x2={seg.p2.x}
                      y2={seg.p2.y}
                      stroke="url(#cutHatch)"
                      strokeWidth="8"
                      strokeLinecap="butt"
                    />
                )}

                <line
                  x1={seg.p1.x}
                  y1={seg.p1.y}
                  x2={seg.p2.x}
                  y2={seg.p2.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
