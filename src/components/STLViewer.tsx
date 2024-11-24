import { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, PerspectiveCamera } from '@react-three/drei';
import { Upload, Download, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';
import Model3D from './Model3D';
import MaterialSelector from './MaterialSelector';
import EnvironmentControls from './EnvironmentControls';

export default function STLViewer() {
  const canvasRef = useRef(null);
  const [stlFile, setStlFile] = useState<string | null>(null);
  const [material, setMaterial] = useState('gold');
  const [hasGems, setHasGems] = useState(false);
  const [detectedShapes, setDetectedShapes] = useState<string[]>([]);
  const [gemColor, setGemColor] = useState('#CC0000');
  const [gemPreset, setGemPreset] = useState({ transmission: 0.7, ior: 1.77 });
  const [environment, setEnvironment] = useState({ preset: 'studio', intensity: 1 });
  const [cameraPosition, setCameraPosition] = useState([5, 5, 5]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (stlFile) {
        URL.revokeObjectURL(stlFile);
      }
      const url = URL.createObjectURL(file);
      setStlFile(url);
      setCameraPosition([5, 5, 5]);
    }
  };

  const handleZoom = (delta: number) => {
    setCameraPosition(prev => {
      const scale = delta > 0 ? 1.2 : 0.8;
      return prev.map(coord => coord * scale) as [number, number, number];
    });
  };

  const handleScreenshot = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current as HTMLCanvasElement;
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `joalheria-render-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (stlFile) {
      URL.revokeObjectURL(stlFile);
      setStlFile(null);
    }
    setMaterial('gold');
    setCameraPosition([5, 5, 5]);
    setHasGems(false);
    setDetectedShapes([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Visualizador 3D de Joias</h1>
          <p className="text-gray-400">Carregue seu arquivo STL para visualizar em diferentes materiais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 bg-black/30 rounded-xl overflow-hidden relative" style={{ height: '70vh' }}>
            {stlFile ? (
              <Canvas
                ref={canvasRef}
                gl={{ 
                  preserveDrawingBuffer: true,
                  antialias: true,
                  alpha: true,
                  powerPreference: 'high-performance'
                }}
                dpr={[1, 2]}
                style={{ background: 'transparent' }}
              >
                <PerspectiveCamera
                  makeDefault
                  position={cameraPosition}
                  fov={45}
                  near={0.1}
                  far={1000}
                />
                
                <Suspense fallback={null}>
                  <Stage
                    environment={environment.preset}
                    intensity={environment.intensity}
                    adjustCamera={false}
                    preset="rembrandt"
                    shadows="contact"
                  >
                    <Model3D
                      url={stlFile}
                      material={material}
                      gemColor={gemColor}
                      gemPreset={gemPreset}
                      onGeometryAnalyzed={(hasGems, shapes) => {
                        setHasGems(hasGems);
                        setDetectedShapes(shapes);
                      }}
                    />
                  </Stage>
                  <Environment preset={environment.preset} />
                  <OrbitControls 
                    makeDefault
                    minDistance={2}
                    maxDistance={20}
                    enableDamping
                    dampingFactor={0.05}
                    rotateSpeed={0.5}
                    zoomSpeed={0.5}
                    panSpeed={0.5}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-500 animate-pulse" />
                  <p className="text-gray-500">Carregue um arquivo STL para começar</p>
                </div>
              </div>
            )}

            {stlFile && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => handleZoom(-1)}
                  className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleZoom(1)}
                  className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-black/30 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Controles</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Arquivo STL</label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition">
                      <Upload className="w-4 h-4 mr-2" />
                      <span>Escolher Arquivo</span>
                      <input
                        type="file"
                        accept=".stl"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {stlFile && (
                      <button
                        onClick={handleReset}
                        className="p-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                        title="Remover modelo"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {stlFile && (
                  <>
                    <MaterialSelector
                      selectedMaterial={material}
                      onMaterialChange={setMaterial}
                      hasGems={hasGems}
                    />

                    <EnvironmentControls
                      onEnvironmentChange={(preset, intensity) => 
                        setEnvironment({ preset, intensity })}
                    />

                    <button
                      onClick={handleScreenshot}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Salvar Imagem
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-black/30 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Instruções</h2>
              <ul className="text-sm space-y-2 text-gray-400">
                <li>• Arraste para rotacionar o modelo</li>
                <li>• Use o scroll para zoom</li>
                <li>• Clique com botão direito para mover</li>
                <li>• Use os botões de zoom para ajustar a visualização</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}