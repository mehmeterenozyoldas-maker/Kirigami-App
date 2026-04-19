
import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Edges, ContactShadows, Environment, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PatternParams, StripData } from '../types';
import { PAPER_W, PAPER_H } from '../geometry';

interface Props {
  params: PatternParams;
  setParams: (p: PatternParams) => void;
  strips: StripData[];
  foldProgress: number; // 0 (Flat) to 1 (Open 90 degrees)
}

const EPSILON = 0.01;

// Helper to ensure numbers are safe for Three.js
const isSafe = (n: any): n is number => {
  return typeof n === 'number' && Number.isFinite(n) && !Number.isNaN(n);
};

// --- Scale Reference: A simple pencil model ---
const PencilReference: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return null;
    // Standard pencil is ~190mm long, 7mm wide.
    // Assuming our unit is 1 unit = 1mm approx (PAPER_W = 500 implies 50cm or 500mm).
    return (
        <group position={[PAPER_W/2 + 40, 0, 100]} rotation={[0, 0, -Math.PI/12]}>
             <Center top>
                <group rotation={[Math.PI/2, 0, 0]}>
                    {/* Body */}
                    <mesh position={[0, 75, 0]}>
                        <cylinderGeometry args={[3.5, 3.5, 150, 6]} />
                        <meshStandardMaterial color="#fcd34d" />
                    </mesh>
                    {/* Metal Ferrule */}
                    <mesh position={[0, 155, 0]}>
                        <cylinderGeometry args={[3.5, 3.5, 10, 16]} />
                        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
                    </mesh>
                    {/* Eraser */}
                    <mesh position={[0, 165, 0]}>
                        <cylinderGeometry args={[3.5, 3.5, 10, 16]} />
                        <meshStandardMaterial color="#fca5a5" />
                    </mesh>
                    {/* Wood Tip */}
                    <mesh position={[0, -10, 0]}>
                        <cylinderGeometry args={[3.5, 0.5, 20, 6]} />
                        <meshStandardMaterial color="#fde68a" />
                    </mesh>
                    {/* Lead */}
                    <mesh position={[0, -21, 0]}>
                        <coneGeometry args={[0.5, 2, 16]} />
                        <meshStandardMaterial color="#1f2937" />
                    </mesh>
                </group>
            </Center>
            <Html position={[0, -100, 0]} center>
                <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm whitespace-nowrap">
                    Scale Ref (~190mm)
                </div>
            </Html>
        </group>
    );
};

// --- Direct Manipulation Handles ---
const DragHandle: React.FC<{ 
    position: [number, number, number], 
    axis: 'y' | 'x', 
    onDrag: (delta: number) => void,
    label: string 
}> = ({ position, axis, onDrag, label }) => {
    const [hovered, setHovered] = useState(false);
    const [dragging, setDragging] = useState(false);
    const planeRef = useRef<THREE.Mesh>(null);
    const { camera, raycaster, pointer } = useThree();
    
    // We use an invisible plane to raycast against during drag
    // This is a simplified drag implementation
    const startValRef = useRef(0);

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
        setDragging(true);
        // Record starting pointer value
        startValRef.current = axis === 'y' ? e.point.y : e.point.x;
        // document.body.style.cursor = 'grabbing';
    };

    const handlePointerUp = () => {
        setDragging(false);
        // document.body.style.cursor = 'default';
    };

    useFrame(() => {
        if (dragging) {
            raycaster.setFromCamera(pointer, camera);
            // We need a virtual plane to intersect. 
            // If dragging Y, plane is vertical facing camera? No, simplified:
            // Just map pointer movement delta roughly or intersect a giant invisible plane at the handle's depth.
            // For robustness in this code-only environment, we'll use the pointer delta logic from the event if possible, 
            // but strict Three.js drag usually requires a plane intersection.
            
            // Create a virtual plane at the handle's position facing the camera
            const normal = new THREE.Vector3();
            camera.getWorldDirection(normal);
            const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), new THREE.Vector3(...position));
            
            const target = new THREE.Vector3();
            raycaster.ray.intersectPlane(plane, target);
            
            if (target) {
                // Determine Delta
                // This is tricky without 'use-gesture'. We will try a simpler approach:
                // We'll rely on the invisible plane mesh we render below.
            }
        }
    });

    return (
        <group position={position}>
            <mesh 
                onPointerOver={() => { setHovered(true); document.body.style.cursor = 'grab'; }}
                onPointerOut={() => { if(!dragging) { setHovered(false); document.body.style.cursor = 'default'; }}}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    setDragging(true);
                    startValRef.current = axis === 'y' ? e.point.y : e.point.x;
                }}
                onPointerUp={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                    setDragging(false);
                }}
                onPointerMove={(e) => {
                    if (dragging) {
                        const current = axis === 'y' ? e.point.y : e.point.x;
                        const delta = current - startValRef.current;
                        onDrag(delta);
                        startValRef.current = current; // Reset for relative delta
                    }
                }}
            >
                <sphereGeometry args={[8, 16, 16]} />
                <meshStandardMaterial 
                    color={hovered || dragging ? "#3b82f6" : "#cbd5e1"} 
                    emissive={hovered || dragging ? "#3b82f6" : "#000"}
                    emissiveIntensity={0.5}
                    transparent opacity={0.8}
                />
            </mesh>
            {(hovered || dragging) && (
                <Html position={[0, 15, 0]} center pointerEvents="none">
                     <div className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold whitespace-nowrap">
                         {label}
                     </div>
                </Html>
            )}
            
            {/* Invisible large plane for easier dragging surface if needed, 
                but direct sphere drag works okay for small tweaks if camera is steady */}
             {dragging && (
                 <mesh visible={false}>
                     <planeGeometry args={[1000, 1000]} />
                 </mesh>
             )}
        </group>
    );
};


// A safe strip component that doesn't render if dimensions are invalid
const PaperStrip: React.FC<{
  width: number;
  height: number;
  color: string;
  tension?: number;
  isGhost?: boolean;
  showStress?: boolean;
  opacity?: number;
}> = ({ width, height, color, tension = 0, isGhost = false, showStress = false, opacity = 1.0 }) => {
  
  // STRICT GUARD: Prevent invalid geometry creation
  if (!isSafe(width) || !isSafe(height) || width < EPSILON || height < EPSILON) {
    return null;
  }

  const meshRef = useRef<THREE.Mesh>(null);

  // Reactive Stress: Pulse effect
  useFrame(({ clock }) => {
      if (meshRef.current && showStress && !isGhost && tension > 0.5) {
          const mat = meshRef.current.material as THREE.MeshStandardMaterial;
          // Pulse speed depends on tension
          const t = Math.sin(clock.getElapsedTime() * (5 + tension * 10)) * 0.5 + 0.5; 
          // Interpolate emissive color
          const stressColor = new THREE.Color('#ef4444');
          mat.emissive.lerpColors(new THREE.Color('#000000'), stressColor, t * (tension - 0.4));
          mat.emissiveIntensity = t * 2;
      } else if (meshRef.current) {
          (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
  });

  const materialColor = useMemo(() => {
    const c = new THREE.Color(color);
    if (showStress && !isGhost) {
      // Static base color interpolation
      const t = Math.min(1.0, Math.max(0, tension || 0));
      c.lerp(new THREE.Color('#ef4444'), t * t * 0.5); 
    }
    return c;
  }, [color, showStress, isGhost, tension]);

  const edgeColor = isGhost ? "#a0a0a0" : "#cbd5e1";

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color={materialColor}
        side={THREE.DoubleSide}
        roughness={0.8}
        metalness={0.1}
        transparent={opacity < 1.0}
        opacity={opacity}
        polygonOffset={true}
        polygonOffsetFactor={isGhost ? 2 : 1}
      />
      {!isGhost && <Edges color={edgeColor} threshold={15} />}
    </mesh>
  );
};

// Calculates the 3D position of all strips based on fold progress
const KirigamiMesh: React.FC<{
  params: PatternParams;
  strips: StripData[];
  foldProgress: number;
  opacity?: number;
  isGhost?: boolean;
}> = ({ params, strips, foldProgress, opacity = 1.0, isGhost = false }) => {
  const { gap, physicsMode, showStress } = params;
  
  // Convert progress (0..1) to angle (-90deg .. 0deg) relative to flat paper
  const currentAngle = -Math.PI / 2 + (foldProgress * Math.PI / 2);

  const elements = useMemo(() => {
    if (!strips || strips.length === 0) return null;

    const els: React.ReactNode[] = [];
    
    // Helper to add a strip to the list
    const addStrip = (
        key: string, 
        w: number, 
        h: number, 
        pos: [number, number, number], 
        rot: [number, number, number], 
        col: string, 
        tension = 0
    ) => {
        if (!isSafe(w) || !isSafe(h)) return;
        els.push(
            <group key={key} position={pos} rotation={rot}>
                <PaperStrip width={w} height={h} color={col} tension={tension} isGhost={isGhost} showStress={showStress} opacity={opacity} />
            </group>
        );
    };

    // Calculate bounding box for margins
    const firstStrip = strips[0];
    const lastStrip = strips[strips.length - 1];
    
    if (!firstStrip || !lastStrip) return null;

    const minX = firstStrip.x - firstStrip.width / 2;
    const maxX = lastStrip.x + lastStrip.width / 2;
    const totalPatternWidth = maxX - minX;
    
    const marginWidth = Math.max(0, (PAPER_W - totalPatternWidth) / 2);
    const leftMarginX = -PAPER_W/2 + marginWidth/2;
    const rightMarginX = PAPER_W/2 - marginWidth/2;

    const halfH = PAPER_H / 2;

    // --- 1. Static Base Margins ---
    const botZ = halfH / 2;
    addStrip('margin_l_bot', marginWidth, halfH, [leftMarginX, 0, botZ], [-Math.PI/2, 0, 0], '#fdfbf7');
    addStrip('margin_r_bot', marginWidth, halfH, [rightMarginX, 0, botZ], [-Math.PI/2, 0, 0], '#fdfbf7');

    // --- 2. Rotating Top Margins ---
    const topY = halfH / 2; 
    
    if (isSafe(marginWidth) && marginWidth > EPSILON) {
        els.push(
            <group key="margins_top" rotation={[currentAngle, 0, 0]}>
                <group position={[leftMarginX, topY, 0]}>
                    <PaperStrip width={marginWidth} height={halfH} color='#fdfbf7' isGhost={isGhost} opacity={opacity} />
                </group>
                <group position={[rightMarginX, topY, 0]}>
                    <PaperStrip width={marginWidth} height={halfH} color='#fdfbf7' isGhost={isGhost} opacity={opacity} />
                </group>
            </group>
        );
    }

    // --- 3. The Strips ---
    strips.forEach((strip, i) => {
        const x = strip.x;
        const rise = strip.rise;
        const run = strip.run;
        const w = strip.width;

        // Top Sheet Segment
        const topSegLen = halfH - rise;
        if ((topSegLen > EPSILON || physicsMode === 'IMPOSSIBLE') && isSafe(topSegLen)) {
            const h = Math.max(EPSILON, Math.abs(topSegLen));
            const y = rise + h/2;
            els.push(
                <group key={`s_top_${i}`} rotation={[currentAngle, 0, 0]}>
                     <group position={[x, y, 0]}>
                        <PaperStrip width={w} height={h} color="#fdfbf7" isGhost={isGhost} opacity={opacity} />
                     </group>
                </group>
            );
        }

        // Bottom Sheet Segment
        const botSegLen = halfH - run;
        if ((botSegLen > EPSILON || physicsMode === 'IMPOSSIBLE') && isSafe(botSegLen)) {
            const h = Math.max(EPSILON, Math.abs(botSegLen));
            const z = run + h/2;
            addStrip(`s_bot_${i}`, w, h, [x, 0, z], [-Math.PI/2, 0, 0], "#fdfbf7");
        }

        // --- The Pop-up Mechanism (Knee) ---
        const pTop = new THREE.Vector3(
            x,
            rise * Math.cos(currentAngle),
            rise * Math.sin(currentAngle)
        );
        const pBot = new THREE.Vector3(x, 0, run);

        if (isNaN(pTop.y) || isNaN(pTop.z)) return;

        const dist = pTop.distanceTo(pBot);
        const maxLen = rise + run;

        let tension = 0;
        if (maxLen > EPSILON) tension = (dist / maxLen - 0.95) * 20;

        let pKnee: THREE.Vector3 | null = null;
        let isBroken = false;

        if (dist > maxLen && physicsMode === 'REALISTIC') {
             pKnee = new THREE.Vector3().lerpVectors(pTop, pBot, rise / maxLen);
             tension = 1.0 + (dist - maxLen) * 0.1; // Extra tension visual
        } else if (dist > maxLen && physicsMode === 'IMPOSSIBLE') {
             isBroken = true;
             pKnee = new THREE.Vector3().lerpVectors(pTop, pBot, rise / maxLen);
        } else {
             const dVec = new THREE.Vector3().subVectors(pBot, pTop); 
             const r1 = rise;
             const r2 = run;
             const d = dist;
             
             if (d > EPSILON) {
                 const a = (r1*r1 - r2*r2 + d*d) / (2*d);
                 const hArg = r1*r1 - a*a;
                 const h = Math.sqrt(Math.max(0, hArg));
                 
                 const P2 = new THREE.Vector3().copy(pTop).add(dVec.clone().multiplyScalar(a/d));
                 const y2 = P2.y;
                 const z2 = P2.z;
                 const dy = pBot.y - pTop.y;
                 const dz = pBot.z - pTop.z;
                 const knee1 = new THREE.Vector3(x, y2 + h * (dz/d), z2 - h * (dy/d));
                 const knee2 = new THREE.Vector3(x, y2 - h * (dz/d), z2 + h * (dy/d));
                 pKnee = (knee1.y > knee2.y) ? knee1 : knee2;
             }
        }

        if (pKnee && isSafe(pKnee.x) && isSafe(pKnee.y) && isSafe(pKnee.z)) {
             const riserColor = isBroken ? '#a855f7' : '#fdfbf7';
             const treadColor = isBroken ? '#d8b4fe' : '#fdfbf7';

             const riserVec = new THREE.Vector3().subVectors(pKnee, pTop);
             const riserLen = riserVec.length();
             if (riserLen > EPSILON) {
                 const mid = new THREE.Vector3().addVectors(pTop, pKnee).multiplyScalar(0.5);
                 const rotX = Math.atan2(riserVec.z, riserVec.y);
                 if (isSafe(rotX)) {
                    addStrip(`riser_${i}`, w, riserLen, [mid.x, mid.y, mid.z], [rotX, 0, 0], riserColor, tension);
                 }
             }

             const treadVec = new THREE.Vector3().subVectors(pBot, pKnee);
             const treadLen = treadVec.length();
             if (treadLen > EPSILON) {
                 const mid = new THREE.Vector3().addVectors(pKnee, pBot).multiplyScalar(0.5);
                 const rotX = Math.atan2(treadVec.z, treadVec.y);
                 if (isSafe(rotX)) {
                     addStrip(`tread_${i}`, w, treadLen, [mid.x, mid.y, mid.z], [rotX, 0, 0], treadColor, tension);
                 }
             }
        }

        if (i < strips.length - 1 && gap > 0) {
            const gapX = x + w/2 + gap/2;
            addStrip(`gap_b_${i}`, gap, halfH, [gapX, 0, botZ], [-Math.PI/2, 0, 0], '#fdfbf7');
            els.push(
               <group key={`gap_t_${i}`} rotation={[currentAngle, 0, 0]}>
                   <group position={[gapX, topY, 0]}>
                       <PaperStrip width={gap} height={halfH} color='#fdfbf7' isGhost={isGhost} opacity={opacity} />
                   </group>
               </group>
            );
        }
    });

    return els;
  }, [strips, currentAngle, physicsMode, showStress, isGhost, opacity, gap]);

  return <>{elements}</>;
};

const SceneContent: React.FC<Props> = (props) => {
    // Determine handle positions
    // Max Amplitude handle at the top center of the shape
    const maxAmplitudeY = props.strips.reduce((max, s) => Math.max(max, s.rise), 0);
    const amplitudeHandlePos: [number, number, number] = [0, maxAmplitudeY + 20, 0];
    
    // Width handle at the right edge
    const lastStrip = props.strips[props.strips.length - 1];
    const widthX = lastStrip ? lastStrip.x + lastStrip.width + 20 : 100;
    const widthHandlePos: [number, number, number] = [widthX, 0, 0];

    return (
        <>
            <group position={[0, -50, 0]}>
                <Center top>
                    {props.params.showGhostTrails && (
                        <>
                            <KirigamiMesh {...props} foldProgress={props.foldProgress * 0.3} opacity={0.2} isGhost />
                            <KirigamiMesh {...props} foldProgress={props.foldProgress * 0.6} opacity={0.3} isGhost />
                        </>
                    )}
                    <KirigamiMesh {...props} />

                    {/* Direct Manipulation Handles */}
                    {props.foldProgress < 0.9 && (
                       <>
                         <DragHandle 
                            position={amplitudeHandlePos} 
                            axis='y' 
                            label="Amplitude"
                            onDrag={(delta) => {
                                // Sensitivity adjustment
                                const newAmp = Math.max(10, Math.min(200, props.params.amplitude + delta));
                                props.setParams({ ...props.params, amplitude: newAmp });
                            }} 
                         />
                          {/* Only show Width handle if we aren't in a chaotic mode where width is ambiguous */}
                         <DragHandle 
                            position={widthHandlePos} 
                            axis='x' 
                            label="Slices"
                            onDrag={(delta) => {
                                if (Math.abs(delta) > 10) {
                                    // Step slice count
                                    const step = delta > 0 ? 1 : -1;
                                    const newCount = Math.max(5, Math.min(50, props.params.sliceCount + step));
                                    props.setParams({ ...props.params, sliceCount: newCount });
                                }
                            }} 
                         />
                       </>
                    )}
                </Center>
            </group>

            <PencilReference visible={props.params.showScaleRef} />

            <Environment preset="city" />
            <ContactShadows 
                position={[0, -50, 0]} 
                opacity={0.4} 
                scale={1000} 
                blur={2.5} 
                far={100} 
            />

            <OrbitControls 
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 1.8}
                minDistance={100}
                maxDistance={1200}
                makeDefault
            />
        </>
    );
};

export const Visualizer3D: React.FC<Props> = (props) => {
  return (
    <div className="h-full w-full bg-slate-50">
      <Canvas 
        shadows={false} 
        dpr={[1, 1.5]} 
        camera={{ position: [300, 300, 300], fov: 40 }}
      >
          <SceneContent {...props} />
      </Canvas>
    </div>
  );
};
