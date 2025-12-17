import { useState } from 'react';

interface UploadConfirmProps {
  image: string;
  onUpload: (filename: string) => void;
  onBack: () => void;
  onCancel: () => void;
}

function UploadConfirm({ image, onUpload, onBack, onCancel }: UploadConfirmProps) {
  const [filename, setFilename] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `receipt_${year}${month}${day}_${hours}${minutes}.jpg`;
  });

  const handleUpload = () => {
    if (!filename.trim()) {
      alert('ファイル名を入力してください');
      return;
    }
    onUpload(filename);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h2 className="text-lg font-bold text-gray-800">アップロード確認</h2>
          <p className="text-sm text-gray-600 mt-1">
            処理された画像を確認してGoogleドライブに保存します
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* 処理済み画像のプレビュー */}
          <div className="bg-gray-100 rounded-lg p-4">
            <img
              src={image}
              alt="Processed receipt"
              className="w-full h-auto rounded shadow-md"
            />
          </div>

          {/* ファイル名入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ファイル名
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="receipt_20240101_1234.jpg"
            />
          </div>
        </div>

        <div className="p-4 space-y-3 border-t border-gray-200">
          <button
            onClick={handleUpload}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            Googleドライブに保存
          </button>

          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            補正に戻る
          </button>

          <button
            onClick={onCancel}
            className="w-full px-6 py-2 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            キャンセル
          </button>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">✓ 処理完了</h3>
        <p className="text-sm text-green-800">
          画像の処理が完了しました。ファイル名を確認してアップロードしてください。
        </p>
      </div>
    </div>
  );
}

export default UploadConfirm;
