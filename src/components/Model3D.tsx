import { useRef, useEffect, useMemo } from 'react';
import { Mesh, BufferGeometry, MeshPhysicalMaterial, Color, Box3, Vector3 } from 'three';
import { useLoader, useThree } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { materialProperties } from './MaterialSelector';

interface Model3DProps {
  url: string;
  material: string;
  gemColor: string;
  gemPreset: {
    transmission: number;
    ior: number;
  };
  onGeometryAnalyzed: (hasGems: boolean, shapes: string[]) => void;
}

export default function Model3D({ url, material, gemColor, gemPreset, onGeometryAnalyzed }: Model3DProps) {
  const meshRef = useRef<Mesh>(null);
  const { camera, gl } = useThree();

  const geometry = useLoader(STLLoader, url);

  useEffect(() => {
    if (geometry && meshRef.current) {
      const box = new Box3().setFromObject(meshRef.current);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 5 / maxDim;

      meshRef.current.scale.setScalar(scale);
      meshRef.current.position.sub(center.multiplyScalar(scale));

      const distance = maxDim * 2;
      camera.position.set(distance, distance, distance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
  }, [geometry, camera]);

  const materials = useMemo(() => {
    const baseMaterial = new MeshPhysicalMaterial({
      ...materialProperties[material as keyof typeof materialProperties],
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      metalness: 0.95,
      roughness: 0.1
    });

    return baseMaterial;
  }, [material]);

  if (!geometry) return null;

  return (
    <>
      <Center>
        <mesh
          ref={meshRef}
          geometry={geometry}
          material={materials}
          castShadow
          receiveShadow
        />
      </Center>
      
      <EffectComposer>
        <Bloom 
          intensity={1.5}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.025}
        />
      </EffectComposer>
    </>
  );
}