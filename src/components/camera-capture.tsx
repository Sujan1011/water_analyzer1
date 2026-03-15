
'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, Trash2, CheckCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  label: string;
  onCapture: (image: string | null) => void;
  image: string | null;
}

export function CameraCapture({ label, onCapture, image }: CameraCaptureProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
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
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Camera Access Error:', err);
      setHasPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Required',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
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
    <Card className="overflow-hidden border-2 border-white/10 bg-white/5 backdrop-blur-xl text-white rounded-3xl group transition-all hover:border-white/20">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-slate-400">{label}</h3>
          {image && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0">Ready</Badge>}
        </div>
        
        <div className="relative w-full aspect-video bg-[#0a0e17] rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
          {image ? (
            <img src={image} alt={label} className="w-full h-full object-cover animate-in fade-in duration-300" />
          ) : showCamera ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-600 transition-colors group-hover:text-slate-500">
              <div className="p-4 rounded-full bg-white/5 border border-white/5">
                <Camera size={40} strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Input Required</p>
            </div>
          )}

          {/* Overlays */}
          {showCamera && (
            <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-xl" />
            </div>
          )}

          {image && (
             <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-2 shadow-xl animate-in zoom-in duration-300">
               <CheckCircle size={20} />
             </div>
          )}
        </div>

        <div className="flex gap-3 w-full">
          {!image && !showCamera && (
            <>
              <Button 
                variant="secondary" 
                className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white border-0 transition-all active:scale-95" 
                onClick={startCamera}
              >
                <Camera className="mr-2 h-5 w-5" /> Camera
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white border-0 transition-all active:scale-95" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-5 w-5" /> Upload
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
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xl" 
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
                <RefreshCcw size={18} />
              </Button>
            </div>
          )}

          {image && (
            <Button 
              variant="destructive" 
              className="w-full h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-0 transition-all" 
              onClick={() => onCapture(null)}
            >
              <Trash2 className="mr-2 h-5 w-5" /> Discard Analysis
            </Button>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}

const Badge = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => (
  <span className={cn(
    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md",
    variant === 'secondary' ? "bg-slate-800 text-slate-300" : "bg-primary/20 text-primary-foreground",
    className
  )}>
    {children}
  </span>
);
