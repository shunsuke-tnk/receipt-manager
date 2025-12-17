import { useState } from 'react';

interface Receipt {
  contour: number[][];
  area: number;
}

interface ReceiptSelectorProps {
  originalImage: string;
  previewImage: string;
  receipts: Receipt[];
  onSelect: (selectedIndex: number, contour: number[][]) => void;
  onCancel: () => void;
}

function ReceiptSelector({
  previewImage,
  receipts,
  onSelect,
  onCancel,
}: ReceiptSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleSelect = () => {
    onSelect(selectedIndex, receipts[selectedIndex].contour);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-green-50 border-b border-green-100">
          <h2 className="text-lg font-bold text-gray-800">
            {receipts.length}枚のレシートを検出しました
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            処理したいレシートを選択してください
          </p>
        </div>

        {/* プレビュー画像 */}
        <div className="p-4 bg-black">
          <img
            src={previewImage}
            alt="Detected receipts"
            className="w-full h-auto rounded"
          />
        </div>

        {/* レシート選択 */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {receipts.map((receipt, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedIndex === index
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        selectedIndex === index
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        レシート {index + 1}
                      </div>
                      <div className="text-sm text-gray-500">
                        面積: {Math.round(receipt.area).toLocaleString()} px²
                      </div>
                    </div>
                  </div>
                  {selectedIndex === index && (
                    <div className="text-indigo-600">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200 space-y-3">
            <button
              onClick={handleSelect}
              className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
            >
              選択したレシートを処理
            </button>

            <button
              onClick={onCancel}
              className="w-full px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 ヒント</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• プレビュー画像で番号が表示されています</li>
          <li>• 面積が大きい順に並んでいます</li>
          <li>• 1枚ずつ処理されます</li>
        </ul>
      </div>
    </div>
  );
}

export default ReceiptSelector;
