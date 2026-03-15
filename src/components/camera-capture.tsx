'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, Trash2, CheckCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CameraCaptureProps {
  label: string;
  onCapture: (image: string | null) => void;
  image: string | null;
  description?: string;
}

export function CameraCapture({ label, onCapture, image, description }: CameraCaptureProps) {
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
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
    setShowCamera(false);
  }, []);

  const startCamera = async () => {
    try {
      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      setHasCameraPermission(true);
      setShowCamera(true);

      // Important: Ensure the video tag is visible and ready before setting srcObject
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
    } catch (err) {
      console.error('Camera Access Error:', err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings and ensure you are using a secure (HTTPS) connection.',
      });
    }
  };

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
        
        toast({
          title: 'Capture Verified',
          description: `${label} has been recorded.`,
        });
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
          title: 'Upload Verified',
          description: `${label} image loaded successfully.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Cleanup on unmount
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
            {image && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 h-5 px-2 text-[8px]">VALIDATED</Badge>}
          </div>
          {description && <p className="text-[10px] text-slate-500 font-medium">{description}</p>}
        </div>
        
        <div className="relative w-full aspect-video bg-[#0a0e17] rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
          {/* Always render video to prevent race conditions during hardware access */}
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              showCamera ? "opacity-100 z-10" : "opacity-0 -z-10"
            )} 
          />

          {image ? (
            <img src={image} alt={label} className="w-full h-full object-cover animate-in fade-in duration-300 relative z-20" />
          ) : !showCamera ? (
            <div className="flex flex-col items-center gap-3 text-slate-600 transition-colors group-hover:text-slate-500">
              <div className="p-4 rounded-full bg-white/5 border border-white/5">
                <Camera size={32} strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Capture Feed</p>
            </div>
          ) : null}

          {/* Guidelines Overlay */}
          {showCamera && (
            <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none z-30">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-xl" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="text-[8px] uppercase tracking-widest bg-black/60 px-2 py-1 rounded-full text-white/70">Align strip within center frame</span>
              </div>
            </div>
          )}

          {image && (
             <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-2 shadow-xl animate-in zoom-in duration-300 z-40">
               <CheckCircle size={16} />
             </div>
          )}
        </div>

        {hasCameraPermission === false && (
          <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-bold uppercase tracking-widest">Access Required</AlertTitle>
            <AlertDescription className="text-[10px]">
              Camera blocked. Please check your browser settings or site permissions and refresh the page.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 w-full">
          {!image && !showCamera && (
            <>
              <Button 
                variant="secondary" 
                className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white border-0 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest" 
                onClick={startCamera}
              >
                <Camera className="mr-2 h-4 w-4" /> Camera
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white border-0 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest" 
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
            <div className="flex gap-2 w-full">
              <Button 
                variant="default" 
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xl text-xs font-bold uppercase tracking-widest" 
                onClick={captureFrame}
              >
                Capture Frame
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
              className="w-full h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-0 transition-all text-xs font-bold uppercase tracking-widest" 
              onClick={() => onCapture(null)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Discard
            </Button>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}