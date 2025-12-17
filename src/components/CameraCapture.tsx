import { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

function CameraCapture({ onCapture }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('このブラウザではカメラ機能がサポートされていません。最新のSafariやChromeをご利用ください。');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 背面カメラを優先
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);

        // ビデオのメタデータが読み込まれるまで待つ
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setIsCameraActive(true);
              })
              .catch((err) => {
                console.error('ビデオ再生エラー:', err);
                alert('カメラの起動に失敗しました。');
                stopCamera();
              });
          }
        };
      }
    } catch (err) {
      console.error('カメラの起動に失敗:', err);
      alert('カメラの起動に失敗しました。ブラウザの設定でカメラへのアクセスを許可してください。');
      stopCamera();
    }
  }, [stopCamera]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // キャンバスのサイズをビデオと同じに設定
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // ビデオフレームをキャンバスに描画
    context.drawImage(video, 0, 0);

    // Base64形式で画像データを取得
    const imageData = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    onCapture(imageData);
  }, [onCapture, stopCamera]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    },
    [onCapture]
  );

  return (
    <div className="space-y-4">
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isCameraActive ? '' : 'hidden'}`}>
        <div className="camera-container bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={captureImage}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            📸 撮影する
          </button>

          <button
            onClick={stopCamera}
            className="w-full px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>

      {!isCameraActive && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              レシートを撮影
            </h2>
            <p className="text-gray-600 mb-6">
              レシートや領収書の写真を撮影してください
            </p>

            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
              >
                📷 カメラを起動
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-6 py-4 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                📁 ファイルから選択
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 撮影のコツ</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• レシート全体が入るように撮影してください</li>
              <li>• 明るい場所で撮影すると認識精度が上がります</li>
              <li>• レシートはなるべく平らに置いてください</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default CameraCapture;
