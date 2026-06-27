/** BarcodeDetector API types (Shape Detection API) */
interface BarcodeDetectorOptions {
  formats: string[];
}

interface DetectedBarcode {
  rawValue: string;
  boundingBox: DOMRectReadOnly;
  cornerPoints: { x: number; y: number }[];
  format: string;
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  static getSupportedFormats(): Promise<string[]>;
  detect(image: HTMLVideoElement | HTMLCanvasElement | ImageBitmap | Blob): Promise<DetectedBarcode[]>;
}
