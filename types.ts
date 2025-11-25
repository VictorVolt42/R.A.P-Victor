export interface ARProject {
  id?: number;
  name: string;
  targetImageBlob: Blob; // The image to track
  contentVideoBlob: Blob; // The video to overlay
  createdAt: Date;
  // In a real production app with a backend, we would store the compiled .mind file URL here.
  // For this demo using IndexedDB, we will process on the fly or simulate compilation.
}

export enum Step {
  UPLOAD_TARGET = 0,
  UPLOAD_CONTENT = 1,
  PREVIEW_SHARE = 2
}

// Global definition for MindAR attached to window
declare global {
  interface Window {
    MINDAR: any;
    three: any;
  }
}