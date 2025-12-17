export interface Point {
  x: number;
  y: number;
}

export interface Contour {
  points: [Point, Point, Point, Point];
}

export interface ProcessedImage {
  imageData: string;
  contour?: Contour;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  denoise: boolean;
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  error?: string;
}

export type AppStep = 'capture' | 'select' | 'preview' | 'adjust' | 'confirm' | 'uploading' | 'complete';
