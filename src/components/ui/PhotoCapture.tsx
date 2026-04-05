/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Camera, RefreshCw, Check, X } from 'lucide-react';

interface PhotoCaptureProps {
  onCapture: (base64Photo: string) => void;
  initialPhoto?: string;
}

export function PhotoCapture({ onCapture, initialPhoto }: PhotoCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(initialPhoto || null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
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
          <Button type="button" onClick={capturePhoto} className="gap-2">
            <Check className="w-4 h-4" />
            Capture Photo
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
