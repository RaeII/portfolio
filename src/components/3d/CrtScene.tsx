import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { PcModel } from './PcModel';
import { CrtFallback } from './CrtFallback';
import { ScreenOverlay } from './ScreenOverlay';
import { Terminal } from '../Terminal';
import { useIsMobile } from '@/hooks/use-mobile';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { type Vec3 } from './DecalPositionControls';

function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// Posições padrão da câmera
const DEFAULT_CAM_POS = new THREE.Vector3(-4, 1.5, 3);
const DEFAULT_CAM_LOOK = new THREE.Vector3(0.1, 0.8, 0);
const FOCUS_CAM_POS = new THREE.Vector3(-2.6, 1.3, 0);
const FOCUS_CAM_LOOK = new THREE.Vector3(0, 0.85, 0);

function CameraController({ focusTerminal }: { focusTerminal: boolean }) {
  const { camera, controls } = useThree();
  const targetPos = useRef(DEFAULT_CAM_POS.clone());
  const targetLook = useRef(DEFAULT_CAM_LOOK.clone());
  const lookAt = useRef(DEFAULT_CAM_LOOK.clone());

  useEffect(() => {
    if (focusTerminal) {
      targetPos.current.copy(FOCUS_CAM_POS);
      targetLook.current.copy(FOCUS_CAM_LOOK);
    } else {
      targetPos.current.copy(DEFAULT_CAM_POS);
      targetLook.current.copy(DEFAULT_CAM_LOOK);
    }
  }, [focusTerminal]);

  // Quando os controls são (re)montados (HMR, etc), forçar o target correto
  useEffect(() => {
    if (controls) {
      const orbitControls = controls as unknown as OrbitControlsImpl;
      orbitControls.target.copy(DEFAULT_CAM_LOOK);
      orbitControls.update();
    }
  }, [controls]);

  useFrame((_, delta) => {
    const speed = focusTerminal ? 2.5 * delta : 3.0 * delta;
    camera.position.lerp(targetPos.current, speed);
    lookAt.current.lerp(targetLook.current, speed);

    // Sincronizar o target do OrbitControls — ISSO é a chave.
    // O OrbitControls sobrescreve camera.lookAt() internamente.
    // Se não atualizarmos controls.target, ele usa o target antigo/default (0,0,0)
    // e a câmera gira, fazendo o terminal "subir".
    if (controls) {
      const orbitControls = controls as unknown as OrbitControlsImpl;
      orbitControls.target.copy(lookAt.current);
      orbitControls.update();
    } else {
      camera.lookAt(lookAt.current);
    }
  });

  return null;
}

function EnvironmentLight({
  mainLightPosition,
  mainLightIntensity,
}: {
  mainLightPosition: Vec3;
  mainLightIntensity: number;
}) {
  return (
    <>
      <ambientLight intensity={0.35} color="#e8dfe0" />
      <directionalLight position={mainLightPosition} intensity={mainLightIntensity} color="#ffe0c0" />
      <directionalLight position={[4, 3, 3]} intensity={0.3} color="#d4cfc8" />
      <directionalLight position={[0, 4, -5]} intensity={0.35} color="#d6d0d0" />
      <pointLight position={[-1, 0.8, 2]} intensity={0.15} color="#00ff88" distance={4} />
      <hemisphereLight args={['#c8c4c0', '#1a1410', 0.3]} />
    </>
  );
}

//Posição do terminal
// Screen world BB (with model scale=0.45, y offset=-1):
// min [-0.03, 0.12, -0.86] max [0.36, 1.56, 0.86]
// Center: ~(0.17, 0.84, 0), Z width ~1.72, Y height ~1.44
// Normal faces -X direction
function ScreenTerminal({ onInteract, portalContainer }: { onInteract: () => void; portalContainer: HTMLDivElement | null }) {
  return (
    <group position={[0.13, 0.86, 0.0]} rotation={[0, -Math.PI / 2, 0]}>
      <group rotation={[-0.217, 0, 0]}>
      <Html
        transform
        occlude={false}
        position={[0, 0, 0]}
        scale={0.1}
        portal={portalContainer ? { current: portalContainer } : undefined}
        style={{
          width: '620px',
          height: '530px',
          overflow: 'hidden',
          borderRadius: '4px',
          fontSize: '5px',
        }}
      >
        <div
          style={{ width: '620px', height: '530px' }}
          onMouseDown={onInteract}
          onFocus={onInteract}
        >
          <ScreenOverlay>
            <Terminal embedded />
          </ScreenOverlay>
        </div>
      </Html>
      </group>
    </group>
  );
}

// Defaults
const DEFAULT_DECAL_POS: Vec3 = [0.99, 1.96, 1.05];
const DEFAULT_DECAL_ROT: Vec3 = [0, 109.41, 0];
const DEFAULT_LIGHT_POS: Vec3 = [-7.7, 2.2, 1.5];
const DEFAULT_LIGHT_INT = 2.20;
const DEFAULT_BTC_ROUGH = 0.35;
const DEFAULT_BTC_METAL = 0.66;

export function CrtScene() {
  const [webgl, setWebgl] = useState(true);
  const [focusTerminal, setFocusTerminal] = useState(false);
  const isMobile = useIsMobile();
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  const handleTerminalFocus = useCallback(() => {
    setFocusTerminal(true);
  }, []);

  if (!webgl || isMobile) {
    return <CrtFallback />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#000000' }}>
      {/* DecalPositionControls comentado — serviu apenas para calibrar os valores padrão.
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <DecalPositionControls
          position={decalPosition}
          onChange={setDecalPosition}
          rotationDeg={decalRotationDeg}
          onRotationChange={setDecalRotationDeg}
          lightPosition={lightPosition}
          lightIntensity={lightIntensity}
          onLightPositionChange={setLightPosition}
          onLightIntensityChange={setLightIntensity}
          btcRoughness={btcRoughness}
          btcMetalness={btcMetalness}
          onBtcRoughnessChange={setBtcRoughness}
          onBtcMetalnessChange={setBtcMetalness}
          onReset={() => {
            setDecalPosition(DEFAULT_DECAL_POS);
            setDecalRotationDeg(DEFAULT_DECAL_ROT);
            setLightPosition(DEFAULT_LIGHT_POS);
            setLightIntensity(DEFAULT_LIGHT_INT);
            setBtcRoughness(DEFAULT_BTC_ROUGH);
            setBtcMetalness(DEFAULT_BTC_METAL);
          }}
        />
      </div>
      */}

      {/* Portal container fixo para o Html do drei — evita que o container
          seja recriado em posição errada durante HMR/re-renders */}
      <div
        ref={portalRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      />

      <Canvas
        camera={{ position: [-4, 1.5, 3], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0 }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor('#000000');
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          // Garantir orientação correta da câmera desde o primeiro frame
          camera.position.set(-4, 1.5, 3);
          camera.lookAt(0.1, 0.8, 0);
          camera.updateProjectionMatrix();
        }}
      >
        <EnvironmentLight mainLightPosition={DEFAULT_LIGHT_POS} mainLightIntensity={DEFAULT_LIGHT_INT} />
        {/* Camera Controller */}
        <CameraController focusTerminal={focusTerminal} />

        <OrbitControls
          makeDefault
          target={[0.1, 0.8, 0]}
          enablePan={false} // Desativar a alteração da posição da camera
          enableZoom={true}
          maxDistance={10}
          minDistance={1.5}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI / 6}
          rotateSpeed={0.5}
          zoomSpeed={0.6}
          enableDamping
          dampingFactor={0.08}
        />

        <Suspense fallback={null}>
          <PcModel
            decalPosition={DEFAULT_DECAL_POS}
            decalRotationDeg={DEFAULT_DECAL_ROT}
            btcRoughness={DEFAULT_BTC_ROUGH}
            btcMetalness={DEFAULT_BTC_METAL}
          />
          <ScreenTerminal onInteract={handleTerminalFocus} portalContainer={portalRef.current} />
        </Suspense>

        {/* Desk surface */}
        <mesh position={[0, -1.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 10]} />
          <meshStandardMaterial color="#1a1612" roughness={0.92} metalness={0.02} />
        </mesh>

      </Canvas>
    </div>
  );
}