'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, Trash2, CheckCircle, RefreshCcw, FlipHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface CameraCaptureProps {
  label: string;
  onCapture: (image: string | null) => void;
  image: string | null;
  description?: string;
}

export function CameraCapture({ label, onCapture, image, description }: CameraCaptureProps) {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    // Clean up existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly play for mobile compatibility
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (err) {
      console.error('Camera Access Error:', err);
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: 'Could not access the camera. Ensure you are on HTTPS and have granted permissions.',
      });
      setIsActive(false);
    }
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (isActive) {
      startCamera(newMode);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        
        context.save();
        if (facingMode === 'user') {
          context.translate(canvasRef.current.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
        context.restore();
        
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
        toast({
          title: 'Image Loaded',
          description: `${label} documented.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden border-2 border-white/10 bg-white/5 backdrop-blur-xl text-white rounded-3xl group transition-all hover:border-white/20">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1 px-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-slate-400">{label}</h3>
            {image && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 h-5 px-2 text-[8px]">CAPTURED</Badge>}
          </div>
          {description && <p className="text-[10px] text-slate-500 font-medium">{description}</p>}
        </div>
        
        <div className="relative w-full aspect-video bg-[#05070a] rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
          {/* Always render video to prevent race conditions with refs */}
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              isActive && !image ? "opacity-100 z-10" : "opacity-0 -z-10",
              facingMode === 'user' && "scale-x-[-1]"
            )} 
          />

          {image ? (
            <img src={image} alt={label} className="w-full h-full object-cover animate-in fade-in duration-300 relative z-20" />
          ) : !isActive ? (
            <div className="flex flex-col items-center gap-3 text-slate-600 transition-colors group-hover:text-slate-500">
              <div className="p-4 rounded-full bg-white/5 border border-white/5">
                <Camera size={32} strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Ready for documentation</p>
            </div>
          ) : null}

          {isActive && !image && (
            <div className="absolute inset-0 border-2 border-primary/20 pointer-events-none z-30">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-2xl" />
            </div>
          )}

          {image && (
             <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-2 shadow-xl animate-in zoom-in duration-300 z-40">
               <CheckCircle size={16} />
             </div>
          )}
        </div>

        <div className="flex gap-3 w-full">
          {!image && !isActive && (
            <>
              <Button 
                variant="secondary" 
                className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white border-0 transition-all text-[10px] font-bold uppercase tracking-widest" 
                onClick={() => startCamera()}
              >
                <Camera className="mr-2 h-4 w-4 text-primary" /> Live Feed
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white border-0 transition-all text-[10px] font-bold uppercase tracking-widest" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> System Cam / Upload
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                capture="environment"
                onChange={handleFileUpload} 
              />
            </>
          )}

          {isActive && !image && (
            <div className="flex gap-2 w-full">
              <Button 
                variant="default" 
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xl text-[10px] font-bold uppercase tracking-widest" 
                onClick={captureFrame}
              >
                Capture Photo
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={toggleCamera}
              >
                <FlipHorizontal size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={stopCamera}
              >
                <RefreshCcw size={16} />
              </Button>
            </div>
          )}

          {image && (
            <Button 
              variant="destructive" 
              className="w-full h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-0 transition-all text-[10px] font-bold uppercase tracking-widest" 
              onClick={() => onCapture(null)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Reset photo
            </Button>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
