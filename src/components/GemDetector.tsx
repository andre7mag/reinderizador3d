import { useEffect, useMemo } from 'react';
import { BufferGeometry, Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

interface GemDetectorProps {
  geometry: BufferGeometry;
  onGemsDetected: (gems: any[]) => void;
}

export default function GemDetector({ geometry, onGemsDetected }: GemDetectorProps) {
  const { scene } = useThree();

  const gems = useMemo(() => {
    const detected = [];
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    
    // Algoritmo de detecção de gemas baseado em características geométricas
    for (let i = 0; i < positions.count; i += 3) {
      const vertices = [];
      const vertexNormals = [];
      
      // Coleta vértices e normais do triângulo
      for (let j = 0; j < 3; j++) {
        vertices.push(new Vector3(
          positions.getX(i + j),
          positions.getY(i + j),
          positions.getZ(i + j)
        ));
        
        vertexNormals.push(new Vector3(
          normals.getX(i + j),
          normals.getY(i + j),
          normals.getZ(i + j)
        ));
      }
      
      // Análise de características para identificar gemas
      const center = new Vector3().addVectors(vertices[0], vertices[1]).add(vertices[2]).multiplyScalar(1/3);
      const normal = new Vector3().addVectors(vertexNormals[0], vertexNormals[1]).add(vertexNormals[2]).normalize();
      
      // Detecta padrões de cravação
      const isGem = detectGemPattern(vertices, normal);
      
      if (isGem) {
        detected.push({
          center,
          normal,
          vertices,
          type: determineGemType(vertices)
        });
      }
    }
    
    return detected;
  }, [geometry]);

  useEffect(() => {
    onGemsDetected(gems);
  }, [gems, onGemsDetected]);

  return null;
}

function detectGemPattern(vertices: Vector3[], normal: Vector3): boolean {
  // Análise de padrões geométricos para identificar gemas
  const area = calculateTriangleArea(vertices);
  const perimeter = calculatePerimeter(vertices);
  const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
  
  // Verifica se o padrão se assemelha a uma gema
  return circularity > 0.7 && normal.y > 0.7;
}

function determineGemType(vertices: Vector3[]): string {
  // Análise das proporções para determinar o tipo de gema
  const bounds = calculateBounds(vertices);
  const aspectRatio = bounds.width / bounds.height;
  
  if (aspectRatio > 0.9 && aspectRatio < 1.1) {
    return 'Redonda';
  } else if (aspectRatio > 1.8) {
    return 'Navete';
  } else if (aspectRatio < 0.6) {
    return 'Gota';
  } else {
    return 'Princesa';
  }
}

function calculateTriangleArea(vertices: Vector3[]): number {
  const a = vertices[0].distanceTo(vertices[1]);
  const b = vertices[1].distanceTo(vertices[2]);
  const c = vertices[2].distanceTo(vertices[0]);
  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

function calculatePerimeter(vertices: Vector3[]): number {
  return vertices[0].distanceTo(vertices[1]) +
         vertices[1].distanceTo(vertices[2]) +
         vertices[2].distanceTo(vertices[0]);
}

function calculateBounds(vertices: Vector3[]): { width: number; height: number } {
  const xs = vertices.map(v => v.x);
  const ys = vertices.map(v => v.y);
  
  return {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}