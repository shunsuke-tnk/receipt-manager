import { useRef, useEffect, useState, useCallback } from 'react';

interface ImagePreviewProps {
  originalImage: string;
  previewImage: string;
  contour: number[][];
  onContourChange: (newContour: number[][]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function ImagePreview({
  originalImage,
  previewImage,
  contour,
  onContourChange,
  onConfirm,
  onCancel,
}: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [currentContour, setCurrentContour] = useState<number[][]>(contour);

  useEffect(() => {
    setCurrentContour(contour);
  }, [contour]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // キャンバスのサイズを画像に合わせる
      const maxWidth = canvas.parentElement?.clientWidth || 800;
      const scale = Math.min(1, maxWidth / img.width);
      const displayWidth = img.width * scale;
      const displayHeight = img.height * scale;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      setImageSize({ width: img.width, height: img.height });

      // 画像を描画
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      // 輪郭を描画
      drawContour(ctx, currentContour, displayWidth / img.width);
    };
    img.src = originalImage;
  }, [originalImage, currentContour]);

  const drawContour = (
    ctx: CanvasRenderingContext2D,
    points: number[][],
    scale: number
  ) => {
    if (points.length !== 4) return;

    // 輪郭線を描画
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((point, index) => {
      const x = point[0] * scale;
      const y = point[1] * scale;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.stroke();

    // 各ポイントを描画
    points.forEach((point, index) => {
      const x = point[0] * scale;
      const y = point[1] * scale;

      // 外側の円
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();

      // 内側の円
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // ポイント番号
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);
    });
  };

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !imageSize.width) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const scale = canvas.width / imageSize.width;

      // クリックした位置に最も近いポイントを探す
      let closestPoint = -1;
      let minDistance = Infinity;

      currentContour.forEach((point, index) => {
        const px = point[0] * scale;
        const py = point[1] * scale;
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

        if (distance < 30 && distance < minDistance) {
          closestPoint = index;
          minDistance = distance;
        }
      });

      if (closestPoint !== -1) {
        setSelectedPoint(closestPoint);
      }
    },
    [currentContour, imageSize]
  );

  const handleCanvasMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (selectedPoint === null) return;

      const canvas = canvasRef.current;
      if (!canvas || !imageSize.width) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const scale = canvas.width / imageSize.width;

      // 実際の画像座標に変換
      const realX = x / scale;
      const realY = y / scale;

      // 輪郭を更新
      const newContour = [...currentContour];
      newContour[selectedPoint] = [realX, realY];
      setCurrentContour(newContour);
      onContourChange(newContour);
    },
    [selectedPoint, currentContour, imageSize, onContourChange]
  );

  const handleCanvasUp = useCallback(() => {
    setSelectedPoint(null);
  }, []);

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h2 className="text-lg font-bold text-gray-800">輪郭を調整</h2>
          <p className="text-sm text-gray-600 mt-1">
            緑色のポイントをドラッグして、レシートの角に合わせてください
          </p>
        </div>

        <div className="p-4 bg-black">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            onMouseUp={handleCanvasUp}
            onMouseLeave={handleCanvasUp}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
              });
              handleCanvasClick(mouseEvent as any);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
              });
              handleCanvasMove(mouseEvent as any);
            }}
            onTouchEnd={handleCanvasUp}
            className="w-full cursor-move"
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            次へ
          </button>

          <button
            onClick={onCancel}
            className="w-full px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 調整のヒント</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 緑色の円をタップ/クリックしてドラッグできます</li>
          <li>• レシートの4つの角に正確に合わせましょう</li>
          <li>• 自動検出がうまくいかない場合は手動で調整してください</li>
        </ul>
      </div>
    </div>
  );
}

export default ImagePreview;
