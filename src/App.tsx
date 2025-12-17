import { useState, useEffect } from 'react';
import CameraCapture from './components/CameraCapture';
import ReceiptSelector from './components/ReceiptSelector';
import ImagePreview from './components/ImagePreview';
import ImageAdjust from './components/ImageAdjust';
import UploadConfirm from './components/UploadConfirm';
import LoadingSpinner from './components/LoadingSpinner';
import AuthPrompt from './components/AuthPrompt';
import { AppStep } from './types';
import { apiService, Receipt } from './services/api';

function App() {
  const [step, setStep] = useState<AppStep>('capture');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [detectedReceipts, setDetectedReceipts] = useState<Receipt[]>([]);
  const [detectedContour, setDetectedContour] = useState<number[][]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 認証状態をチェック
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await apiService.checkAuthStatus();
      setIsAuthenticated(status.authenticated);
    } catch (err) {
      console.error('認証状態の確認に失敗:', err);
    }
  };

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setIsLoading(true);
    setError('');

    try {
      // 輪郭を自動検出（複数対応）
      const result = await apiService.detectContour(imageData);

      if (result.success && result.receipts && result.preview) {
        setDetectedReceipts(result.receipts);
        setPreviewImage(result.preview);

        // 1枚だけ検出された場合は直接プレビューへ
        if (result.count === 1) {
          setDetectedContour(result.receipts[0].contour);
          setStep('preview');
        } else {
          // 複数枚検出された場合は選択画面へ
          setStep('select');
        }
      } else {
        setError(result.error || '輪郭検出に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '輪郭検出に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptSelect = (_selectedIndex: number, contour: number[][]) => {
    setDetectedContour(contour);
    setStep('preview');
  };

  const handleContourAdjust = (newContour: number[][]) => {
    setDetectedContour(newContour);
  };

  const handlePreviewConfirm = () => {
    setStep('adjust');
  };

  const handleAdjustComplete = async (
    brightness: number,
    contrast: number,
    denoise: boolean
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await apiService.processImage(
        capturedImage,
        detectedContour,
        brightness,
        contrast,
        denoise
      );

      if (result.success && result.processed_image) {
        setProcessedImage(result.processed_image);
        setStep('confirm');
      } else {
        setError(result.error || '画像処理に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像処理に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (filename: string) => {
    if (!isAuthenticated) {
      setError('Google Driveに認証されていません');
      return;
    }

    setStep('uploading');
    setError('');

    try {
      const result = await apiService.uploadToDrive(processedImage, filename);

      if (result.success) {
        setStep('complete');
      } else {
        setError(result.error || 'アップロードに失敗しました');
        setStep('confirm');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました');
      setStep('confirm');
    }
  };

  const handleReset = () => {
    setCapturedImage('');
    setDetectedContour([]);
    setPreviewImage('');
    setProcessedImage('');
    setError('');
    setStep('capture');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">📄 レシート管理</h1>
          {!isAuthenticated && step === 'capture' && (
            <AuthPrompt onAuthComplete={checkAuthStatus} />
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && (
          <>
            {step === 'capture' && (
              <CameraCapture onCapture={handleImageCapture} />
            )}

            {step === 'select' && (
              <ReceiptSelector
                originalImage={capturedImage}
                previewImage={previewImage}
                receipts={detectedReceipts}
                onSelect={handleReceiptSelect}
                onCancel={handleReset}
              />
            )}

            {step === 'preview' && (
              <ImagePreview
                originalImage={capturedImage}
                previewImage={previewImage}
                contour={detectedContour}
                onContourChange={handleContourAdjust}
                onConfirm={handlePreviewConfirm}
                onCancel={handleReset}
              />
            )}

            {step === 'adjust' && (
              <ImageAdjust
                image={capturedImage}
                contour={detectedContour}
                onComplete={handleAdjustComplete}
                onBack={() => setStep('preview')}
              />
            )}

            {step === 'confirm' && (
              <UploadConfirm
                image={processedImage}
                onUpload={handleUpload}
                onBack={() => setStep('adjust')}
                onCancel={handleReset}
              />
            )}

            {step === 'uploading' && (
              <div className="text-center py-12">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">アップロード中...</p>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  アップロード完了
                </h2>
                <p className="text-gray-600 mb-6">
                  レシートをGoogleドライブに保存しました
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  新しいレシートを撮影
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
