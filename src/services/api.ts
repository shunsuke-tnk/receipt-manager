const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5001/api';
  }

  console.warn('VITE_API_URLが設定されていないため、Renderの既定URLを使用します');
  return 'https://receipt-manager-api.onrender.com/api';
};

const API_BASE_URL = resolveApiBaseUrl();

export interface Receipt {
  contour: number[][];
  area: number;
}

export interface DetectContourResponse {
  success: boolean;
  receipts?: Receipt[];
  count?: number;
  preview?: string;
  error?: string;
}

export interface ProcessImageResponse {
  success: boolean;
  processed_image?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  file_id?: string;
  web_view_link?: string;
  error?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
}

export interface AuthUrlResponse {
  auth_url: string;
}

class ApiService {
  async detectContour(imageData: string): Promise<DetectContourResponse> {
    try {
      console.log('API Request to:', `${API_BASE_URL}/detect-contour`);

      const response = await fetch(`${API_BASE_URL}/detect-contour`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API接続エラー (${response.status}): バックエンドサーバーに接続できません`);
      }

      return response.json();
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  }

  async processImage(
    imageData: string,
    contour: number[][],
    brightness: number = 0,
    contrast: number = 1.0,
    denoise: boolean = false
  ): Promise<ProcessImageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/process-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          contour,
          brightness,
          contrast,
          denoise,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '画像処理に失敗しました');
      }

      return response.json();
    } catch (error) {
      console.error('Process Image Error:', error);
      throw error;
    }
  }

  async uploadToDrive(imageData: string, filename?: string): Promise<UploadResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/upload-to-drive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          filename,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'アップロードに失敗しました');
      }

      return response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  async checkAuthStatus(): Promise<AuthStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`);
      return response.json();
    } catch (error) {
      console.error('Auth Status Error:', error);
      return { authenticated: false };
    }
  }

  async getAuthUrl(): Promise<AuthUrlResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/url`);
      return response.json();
    } catch (error) {
      console.error('Get Auth URL Error:', error);
      throw new Error('認証URLの取得に失敗しました。バックエンドサーバーに接続できません。');
    }
  }
}

export const apiService = new ApiService();
