const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface DetectContourResponse {
  success: boolean;
  contour?: number[][];
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
    const response = await fetch(`${API_BASE_URL}/detect-contour`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '輪郭検出に失敗しました');
    }

    return response.json();
  }

  async processImage(
    imageData: string,
    contour: number[][],
    brightness: number = 0,
    contrast: number = 1.0,
    denoise: boolean = false
  ): Promise<ProcessImageResponse> {
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
  }

  async uploadToDrive(imageData: string, filename?: string): Promise<UploadResponse> {
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
  }

  async checkAuthStatus(): Promise<AuthStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/status`);
    return response.json();
  }

  async getAuthUrl(): Promise<AuthUrlResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/url`);
    return response.json();
  }
}

export const apiService = new ApiService();
