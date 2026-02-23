import { useEffect } from 'react';
import { useGLTF, useTexture, Decal } from '@react-three/drei';
import * as THREE from 'three';
import elephpantImg from '../../assets/elephpant_php.png';
import JsLogoImg from '../../assets/js.png';
import BtcLogoImg from '../../assets/btc.png';



const MODEL_PATH = `${import.meta.env.BASE_URL}models/90s_pc.glb`;
useGLTF.preload(MODEL_PATH);

export type PcModelProps = {
  decalPosition?: [number, number, number];
  decalRotationDeg?: [number, number, number];
  btcRoughness?: number;
  btcMetalness?: number;
};

export function PcModel({
  decalPosition = [-1.09, 0.6, -0.91],
  decalRotationDeg = [0, -8, 0],
  btcRoughness = 0.2,
  btcMetalness = 0.8,
}: PcModelProps) {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const texture = useTexture(elephpantImg);
  const jsTexture = useTexture(JsLogoImg);
  const btcTexture = useTexture(BtcLogoImg);

  useEffect(() => {
    [texture, jsTexture, btcTexture].forEach((tex) => {
      tex.center.set(0.5, 0.5);
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.y = -1;
      tex.offset.y = 1;
      tex.needsUpdate = true;
    });
  }, [texture, jsTexture, btcTexture]);

  const caseMesh = nodes.Object_10 as THREE.Mesh;

  return (
    <group position={[0, -1, 0]} scale={0.45}>
      <primitive object={scene} />

      {/* Mesh invisível (overlay) com a mesma geometria do gabinete para projeção do Decal */}
      <mesh
        geometry={caseMesh.geometry}
        position={[2.02, 1.318, 0]}
        scale={1.939}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Decal
          position={[-1.09, 0.58, 1]}
          scale={[0.18, 0.13, 0.05]}
        >
          <meshStandardMaterial
            map={texture}
            transparent
            opacity={0.85}
            roughness={1}
            polygonOffset
            polygonOffsetFactor={-10}
            depthWrite={false}
          />
        </Decal>
        <Decal
          position={[-1.12, 0.56, -0.94]}
          scale={[0.18, 0.13, 0.05]}
          rotation={[12.56, 1.59, 15.30]}
        >
          <meshStandardMaterial
            map={jsTexture}
            transparent
            opacity={0.85}
            roughness={1}
            polygonOffset
            polygonOffsetFactor={-10}
            depthWrite={false}
          />
        </Decal>
        <Decal
          position={[-0.78, 2.25, -0.95]}
          scale={[0.18, 0.13, 0.05]}
          rotation={[12.56, 1.59, 21.64]}
        >
          <meshStandardMaterial
            map={btcTexture}
            transparent
            opacity={0.85}
            roughness={btcRoughness}
            metalness={btcMetalness}
            polygonOffset
            polygonOffsetFactor={-10}
            depthWrite={false}
          />
        </Decal>
      </mesh>
    </group>
  );
}