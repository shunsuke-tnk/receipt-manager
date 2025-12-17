import { useState } from 'react';

interface ImageAdjustProps {
  image: string;
  contour: number[][];
  onComplete: (brightness: number, contrast: number, denoise: boolean) => void;
  onBack: () => void;
}

function ImageAdjust({ image, onComplete, onBack }: ImageAdjustProps) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1.0);
  const [denoise, setDenoise] = useState(false);

  const handleComplete = () => {
    onComplete(brightness, contrast, denoise);
  };

  const resetAdjustments = () => {
    setBrightness(0);
    setContrast(1.0);
    setDenoise(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h2 className="text-lg font-bold text-gray-800">画像を補正</h2>
          <p className="text-sm text-gray-600 mt-1">
            明るさやコントラストを調整して、読みやすくします
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* プレビュー画像 */}
          <div className="bg-gray-100 rounded-lg p-4">
            <img
              src={image}
              alt="Preview"
              className="w-full h-auto rounded"
              style={{
                filter: `brightness(${1 + brightness / 100}) contrast(${contrast})`,
              }}
            />
          </div>

          {/* 明るさ調整 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              明るさ: {brightness > 0 ? '+' : ''}{brightness}
            </label>
            <input
              type="range"
              min="-50"
              max="50"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>暗く</span>
              <span>明るく</span>
            </div>
          </div>

          {/* コントラスト調整 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コントラスト: {contrast.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>低</span>
              <span>高</span>
            </div>
          </div>

          {/* ノイズ除去 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">ノイズ除去</h3>
              <p className="text-sm text-gray-600">
                画像のノイズを軽減してクリアにします
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={denoise}
                onChange={(e) => setDenoise(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* リセットボタン */}
          <button
            onClick={resetAdjustments}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            リセット
          </button>
        </div>

        <div className="p-4 space-y-3 border-t border-gray-200">
          <button
            onClick={handleComplete}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            処理を実行
          </button>

          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 補正のヒント</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 文字が読みやすくなるように調整しましょう</li>
          <li>• 明るさは控えめに調整するのがおすすめです</li>
          <li>• ノイズ除去は処理に時間がかかる場合があります</li>
        </ul>
      </div>
    </div>
  );
}

export default ImageAdjust;
