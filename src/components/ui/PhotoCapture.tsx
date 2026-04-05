/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Camera, RefreshCw, Check, X, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { checkPhotoQualityWithGemini } from '../../services/geminiFaceService';

interface PhotoCaptureProps {
  onCapture: (base64Photo: string) => void;
  initialPhoto?: string;
}

export function PhotoCapture({ onCapture, initialPhoto }: PhotoCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(initialPhoto || null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      // Try with preferred constraints first
      const constraints = { 
        video: { 
          facingMode: { ideal: 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn("Failed with ideal constraints, trying basic video:true", e);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('Requested device not found') || errorMsg.includes('NotFoundError')) {
        toast.error("No camera found on this device.");
      } else {
        toast.error("Could not access camera. Please check permissions.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        // AI Quality Check
        setIsCheckingQuality(true);
        try {
          const quality = await checkPhotoQualityWithGemini(base64);
          if (!quality.isGoodQuality || !quality.isLive) {
            toast.error(quality.errorMessage || "Photo quality is low or not a live person. Please try again.");
            setIsCheckingQuality(false);
            return;
          }
          toast.success("AI Quality Check Passed!");
        } catch (err) {
          console.warn("AI Quality Check failed, proceeding anyway", err);
        } finally {
          setIsCheckingQuality(false);
        }

        setCapturedPhoto(base64);
        onCapture(base64);
        stopCamera();
      }
    }
  }, [onCapture, stopCamera]);

  const resetPhoto = useCallback(() => {
    setCapturedPhoto(null);
    onCapture('');
    startCamera();
  }, [onCapture, startCamera]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
        {isStreaming ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-rose-600 text-white px-2 py-1 rounded text-[10px] font-bold tracking-wider animate-pulse z-10">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              LIVE CAMERA
            </div>
          </>
        ) : capturedPhoto ? (
          <img
            src={capturedPhoto}
            alt="Captured"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-center p-6">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Camera is off</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {!isStreaming && !capturedPhoto && (
          <Button type="button" onClick={startCamera} variant="outline" className="gap-2">
            <Camera className="w-4 h-4" />
            Start Camera
          </Button>
        )}

        {isStreaming && (
          <Button type="button" onClick={capturePhoto} className="gap-2" disabled={isCheckingQuality}>
            {isCheckingQuality ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isCheckingQuality ? "Checking Quality..." : "Capture Photo"}
          </Button>
        )}

        {capturedPhoto && (
          <Button type="button" onClick={resetPhoto} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retake Photo
          </Button>
        )}

        {isStreaming && (
          <Button type="button" onClick={stopCamera} variant="ghost" className="gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
