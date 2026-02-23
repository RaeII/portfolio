import { useRef } from 'react';
import * as THREE from 'three';

export function CrtMonitor() {
  const groupRef = useRef<THREE.Group>(null);

  // Y2K era colors — off-white/silver plastic with blue-grey accents
  const bodyColor = '#c5c5c8';       // silver-grey plastic
  const bodyDark = '#a8a8ad';        // darker trim
  const frontBezel = '#b0b0b5';      // front face
  const ventColor = '#8a8a90';       // vent grille
  const accentBlue = '#3a5a8c';      // blue accent strip (very Y2K)
  const logoColor = '#2244aa';       // brand logo color
  const standColor = '#9a9a9f';

  return (
    <group ref={groupRef} position={[0, -0.8, 0]}>
      {/* === MONITOR BODY === */}
      {/* Main housing — chunky CRT shape */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[2.9, 2.2, 2.1]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.08} />
      </mesh>

      {/* Back CRT bulge — rounded feel */}
      <mesh position={[0, 1.35, -1.2]}>
        <boxGeometry args={[2.4, 1.8, 0.6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Extra back rounding */}
      <mesh position={[0, 1.35, -1.45]}>
        <boxGeometry args={[1.8, 1.4, 0.3]} />
        <meshStandardMaterial color={bodyColor} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Back vents (horizontal lines simulated with thin boxes) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`vent-${i}`} position={[0, 1.8 - i * 0.13, -1.56]}>
          <boxGeometry args={[1.2, 0.03, 0.02]} />
          <meshStandardMaterial color={ventColor} roughness={0.9} />
        </mesh>
      ))}

      {/* === FRONT BEZEL === */}
      <mesh position={[0, 1.35, 1.06]}>
        <boxGeometry args={[2.92, 2.25, 0.06]} />
        <meshStandardMaterial color={frontBezel} roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Inner bezel frame — darker border around screen */}
      <mesh position={[0, 1.42, 1.09]}>
        <boxGeometry args={[2.35, 1.82, 0.02]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.95} />
      </mesh>

      {/* Screen dark background */}
      <mesh position={[0, 1.42, 1.1]}>
        <planeGeometry args={[2.15, 1.62]} />
        <meshBasicMaterial color="#050510" />
      </mesh>

      {/* Screen glass — reflective layer */}
      <mesh position={[0, 1.42, 1.105]}>
        <planeGeometry args={[2.15, 1.62]} />
        <meshPhysicalMaterial
          color="#000000"
          transparent
          opacity={0.12}
          metalness={0.95}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={0.8}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* === BLUE ACCENT STRIP (very Y2K) === */}
      <mesh position={[0, 0.17, 1.09]}>
        <boxGeometry args={[2.92, 0.12, 0.04]} />
        <meshStandardMaterial color={accentBlue} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* === BOTTOM CONTROLS PANEL === */}
      <mesh position={[0, 0.05, 1.09]}>
        <boxGeometry args={[2.92, 0.18, 0.04]} />
        <meshStandardMaterial color={bodyDark} roughness={0.8} />
      </mesh>

      {/* Brand logo — small rectangle */}
      <mesh position={[-0.7, 0.05, 1.115]}>
        <boxGeometry args={[0.35, 0.06, 0.005]} />
        <meshStandardMaterial color={logoColor} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Control buttons row */}
      {[0.3, 0.55, 0.75, 0.95].map((x, i) => (
        <mesh key={`btn-${i}`} position={[x, 0.05, 1.115]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.015, 12]} />
          <meshStandardMaterial
            color={i === 3 ? '#444' : '#666'}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Power button — larger */}
      <mesh position={[1.15, 0.05, 1.115]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#555" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Power LED */}
      <mesh position={[1.0, 0.05, 1.115]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#00ff44" />
      </mesh>
      {/* LED glow */}
      <pointLight position={[1.0, 0.05, 1.2]} intensity={0.05} distance={0.5} color="#00ff44" />

      {/* === MONITOR STAND — Y2K oval/angular style === */}
      {/* Neck */}
      <mesh position={[0, -0.12, 0.15]}>
        <boxGeometry args={[0.6, 0.22, 0.5]} />
        <meshStandardMaterial color={standColor} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Base — wider angular platform */}
      <mesh position={[0, -0.28, 0.25]}>
        <boxGeometry args={[1.7, 0.07, 1.1]} />
        <meshStandardMaterial color={standColor} roughness={0.65} metalness={0.12} />
      </mesh>
      {/* Base front lip */}
      <mesh position={[0, -0.25, 0.82]}>
        <boxGeometry args={[1.4, 0.04, 0.08]} />
        <meshStandardMaterial color={bodyDark} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* === KEYBOARD — Y2K style with more detail === */}
      <mesh position={[0, -0.28, 1.85]}>
        <boxGeometry args={[2.2, 0.08, 0.7]} />
        <meshStandardMaterial color="#d0d0d3" roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Keyboard keys area */}
      <mesh position={[0, -0.23, 1.83]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.05, 0.55]} />
        <meshStandardMaterial color="#bbbbc0" roughness={0.9} />
      </mesh>
      {/* Keyboard accent strip */}
      <mesh position={[0, -0.235, 2.21]}>
        <boxGeometry args={[2.2, 0.03, 0.02]} />
        <meshStandardMaterial color={accentBlue} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* === MOUSE — Y2K rounded === */}
      <mesh position={[1.65, -0.26, 1.95]}>
        <boxGeometry args={[0.22, 0.07, 0.38]} />
        <meshStandardMaterial color="#d0d0d3" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Mouse button divider */}
      <mesh position={[1.65, -0.22, 1.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 0.01]} />
        <meshStandardMaterial color="#aaa" roughness={0.9} />
      </mesh>
      {/* Mouse scroll wheel */}
      <mesh position={[1.65, -0.215, 1.88]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
        <meshStandardMaterial color="#888" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* === SPEAKER (left side, Y2K desktops had these) === */}
      <mesh position={[-1.85, -0.05, 1.5]}>
        <boxGeometry args={[0.35, 0.6, 0.35]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.85} />
      </mesh>
      {/* Speaker cone */}
      <mesh position={[-1.85, 0.0, 1.68]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Speaker grille dots */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={`spk-${i}`} position={[-1.85, -0.18 + i * 0.06, 1.685]}>
          <circleGeometry args={[0.02, 8]} />
          <meshStandardMaterial color="#333" roughness={0.9} />
        </mesh>
      ))}

      {/* === MOUSEPAD === */}
      <mesh position={[1.65, -0.285, 1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.55, 0.6]} />
        <meshStandardMaterial color="#1a2a4a" roughness={0.95} />
      </mesh>
    </group>
  );
}
