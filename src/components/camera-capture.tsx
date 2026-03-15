
'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  label: string;
  onCapture: (image: string | null) => void;
  image: string | null;
}

export function CameraCapture({ label, onCapture, image }: CameraCaptureProps) {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Camera Access Error:', err);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-white/20 bg-white/10 backdrop-blur-md text-white">
      <CardContent className="p-4 flex flex-col items-center gap-4">
        <h3 className="text-lg font-headline font-semibold text-white/90">{label}</h3>
        
        <div className="relative w-full aspect-square bg-black/40 rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
          {image ? (
            <img src={image} alt={label} className="w-full h-full object-cover" />
          ) : showCamera ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-white/40">
              <Camera size={48} strokeWidth={1} />
              <p className="text-sm mt-2">No Image Selected</p>
            </div>
          )}
          {image && (
             <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
               <CheckCircle size={16} className="text-white" />
             </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 w-full">
          {!image && !showCamera && (
            <>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border-0" 
                onClick={startCamera}
              >
                <Camera className="mr-2 h-4 w-4" /> Camera
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border-0" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
              />
            </>
          )}

          {showCamera && (
            <Button variant="default" className="bg-[#29BBE1] hover:bg-[#29BBE1]/80 text-white w-full" onClick={captureFrame}>
              Capture
            </Button>
          )}

          {image && (
            <Button variant="destructive" size="sm" onClick={() => onCapture(null)}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
