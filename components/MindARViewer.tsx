import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, Play } from 'lucide-react';

interface MindARViewerProps {
  targetImageSrc: string;
  videoSrc: string;
}

const MindARViewer: React.FC<MindARViewerProps> = ({ targetImageSrc, videoSrc }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !targetImageSrc || !videoSrc) return;

    let mindarThree: any = null;

    const startAR = async () => {
      try {
        console.log("Initializing MindAR...");
        
        // Wait for window.MINDAR to be available (loaded from script tag)
        if (!window.MINDAR) {
          throw new Error("MindAR library not loaded");
        }

        const { MindARThree } = window.MINDAR.IMAGE;

        // Initialize MindARThree
        mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: targetImageSrc, // In prod, this should be a compiled .mind file url. MindAR supports regular images but it's slower.
          uiLoading: "no",
          uiScanning: "yes", // Using built-in scanning UI or custom
          uiError: "yes",
        });

        const { renderer, scene, camera } = mindarThree;

        // Setup Anchor
        const anchor = mindarThree.addAnchor(0);
        
        // Setup Video Texture
        // We create a video element but don't add it to DOM to avoid it showing up on 2D screen
        const videoObj = document.createElement("video");
        videoObj.src = videoSrc;
        videoObj.crossOrigin = "anonymous";
        videoObj.loop = true;
        videoObj.playsInline = true; 
        videoObj.muted = true; // Start muted to allow autoplay policy
        videoRef.current = videoObj;

        // Wait for video metadata
        await new Promise((resolve) => {
            videoObj.addEventListener('loadedmetadata', resolve, { once: true });
        });

        // Create 3D Mesh for Video
        const geometry = new window.three.PlaneGeometry(1, videoObj.videoHeight / videoObj.videoWidth);
        const texture = new window.three.VideoTexture(videoObj);
        const material = new window.three.MeshBasicMaterial({ map: texture });
        const plane = new window.three.Mesh(geometry, material);
        
        // Add plane to anchor
        anchor.group.add(plane);

        // Define Start logic
        await mindarThree.start();
        
        // Animation Loop
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });

        setIsLoading(false);
        setIsReady(true);
        
        // Handle target found/lost events
        anchor.onTargetFound = () => {
            console.log("Target Found");
            if(videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
            }
        };
        
        anchor.onTargetLost = () => {
            console.log("Target Lost");
            if(videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        };

      } catch (err: any) {
        console.error("AR Error:", err);
        setError(err.message || "Failed to initialize AR engine.");
        setIsLoading(false);
      }
    };

    startAR();

    return () => {
      // Cleanup
      if (mindarThree) {
        mindarThree.stop();
        if(mindarThree.renderer) {
            mindarThree.renderer.setAnimationLoop(null);
        }
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    };
  }, [targetImageSrc, videoSrc]);

  const toggleSound = () => {
    if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        // If it was paused due to interaction requirements, try playing again
        if(videoRef.current.paused) videoRef.current.play();
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* 3D Container */}
      <div ref={containerRef} className="w-full h-full absolute top-0 left-0 z-0" />

      {/* UI Overlays */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-50 text-white">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
          <p className="font-medium animate-pulse">Initializing AR Engine...</p>
          <p className="text-xs text-slate-400 mt-2">Compiling target image, this might take a few seconds.</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-50 text-white p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">AR Initialization Failed</h3>
          <p className="text-slate-300">{error}</p>
          <p className="text-xs text-slate-500 mt-4">Make sure you allowed camera permissions.</p>
        </div>
      )}

      {isReady && !error && (
         <div className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center gap-4 pointer-events-none">
            <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-full text-white text-sm">
                Point camera at the target image
            </div>
            
            <button 
                onClick={toggleSound}
                className="pointer-events-auto bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
                <Play className="w-5 h-5 fill-current" />
                <span>Enable Sound / Play</span>
            </button>
         </div>
      )}
    </div>
  );
};

export default MindARViewer;