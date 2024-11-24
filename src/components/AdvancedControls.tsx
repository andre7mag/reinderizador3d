import { useState } from 'react';
import { Settings, Ruler, Box, Palette, Save, Share2 } from 'lucide-react';
import { metalPresets, gemPresets, settingTypes } from './MaterialPresets';

interface AdvancedControlsProps {
  onPresetChange: (preset: any) => void;
  onFinishChange: (finish: string) => void;
  onMeasurementsToggle: () => void;
  measurements: {
    width: number;
    height: number;
    depth: number;
  } | null;
}

export default function AdvancedControls({
  onPresetChange,
  onFinishChange,
  onMeasurementsToggle,
  measurements
}: AdvancedControlsProps) {
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState('polished');
  const [showPresets, setShowPresets] = useState(false);

  const finishTypes = ['polished', 'brushed', 'matte'];

  const handleFinishChange = (finish: string) => {
    setSelectedFinish(finish);
    onFinishChange(finish);
  };

  const toggleMeasurements = () => {
    setShowMeasurements(!showMeasurements);
    onMeasurementsToggle();
  };

  return (
    <div className="space-y-6 bg-black/30 p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Controles Avançados</h2>
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="p-2 rounded-lg hover:bg-gray-700 transition"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Acabamentos */}
        <div>
          <label className="block text-sm font-medium mb-2">Acabamento</label>
          <div className="grid grid-cols-3 gap-2">
            {finishTypes.map((finish) => (
              <button
                key={finish}
                onClick={() => handleFinishChange(finish)}
                className={`px-3 py-2 rounded-lg text-sm capitalize transition ${
                  selectedFinish === finish
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {finish === 'polished' ? 'Polido' :
                 finish === 'brushed' ? 'Escovado' : 'Fosco'}
              </button>
            ))}
          </div>
        </div>

        {/* Medidas */}
        <div>
          <button
            onClick={toggleMeasurements}
            className="flex items-center space-x-2 text-sm font-medium hover:text-blue-400 transition"
          >
            <Ruler className="w-4 h-4" />
            <span>Mostrar Medidas</span>
          </button>

          {showMeasurements && measurements && (
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-800 p-2 rounded">
                <span className="block text-gray-400">Largura</span>
                <span className="font-medium">{measurements.width.toFixed(2)}mm</span>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <span className="block text-gray-400">Altura</span>
                <span className="font-medium">{measurements.height.toFixed(2)}mm</span>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <span className="block text-gray-400">Profundidade</span>
                <span className="font-medium">{measurements.depth.toFixed(2)}mm</span>
              </div>
            </div>
          )}
        </div>

        {/* Exportação */}
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            <Save className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </button>
        </div>

        {/* Biblioteca de Modelos */}
        {showPresets && (
          <div className="mt-4 space-y-4">
            <h3 className="text-sm font-medium">Biblioteca de Modelos</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(gemPresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => onPresetChange(preset)}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm"
                >
                  <div className="w-full aspect-square rounded-lg mb-2 relative overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: preset.color,
                        opacity: 0.8
                      }}
                    />
                  </div>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}