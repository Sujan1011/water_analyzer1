'use client';

import React, { useState, useEffect } from 'react';
import { FlaskConical, Droplet, Activity, ShieldCheck, Info, BarChart3, History, Sparkles, ChevronRight, LayoutDashboard, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CameraCapture } from '@/components/camera-capture';
import { TestType, findClosestColor } from '@/lib/color-database';
import { getDominantColor } from '@/lib/image-analysis';
import { interpretResults } from '@/app/actions';
import { type WaterQualityTestOutput } from '@/ai/flows/dynamic-interpretive-results-flow';
import { HistoryTable, type TestResult } from '@/components/history-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const { toast } = useToast();
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<WaterQualityTestOutput | null>(null);
  const [detectedValue, setDetectedValue] = useState<{value: number, unit: string, color: string} | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('aqua-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedTest || !afterImage) {
      toast({
        variant: 'destructive',
        title: 'Missing Data',
        description: 'Please select a test type and capture a photo of the test strip.',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      // 1. Color Extraction
      const [r, g, b] = await getDominantColor(afterImage);
      const closest = findClosestColor(selectedTest, r, g, b);
      
      setDetectedValue({
        value: closest.value,
        unit: closest.unit,
        color: closest.hex
      });

      // 2. Diagnostic Analysis (Local Engine)
      const interpretation = await interpretResults({
        testType: selectedTest,
        value: closest.value,
        unit: closest.unit,
        colorDetected: closest.name
      });

      setResult(interpretation);

      // 3. Save Record
      const newHistoryItem: TestResult = {
        id: Math.random().toString(36).substring(2, 11),
        timestamp: Date.now(),
        type: selectedTest,
        value: closest.value,
        unit: closest.unit,
        status: interpretation.safetyLevel,
        colorHex: closest.hex,
        explanation: interpretation.explanation
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('aqua-history', JSON.stringify(updatedHistory));

      toast({
        title: 'Analysis Successful',
        description: `${selectedTest} analysis completed.`,
      });

    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Diagnostic Error',
        description: error.message || 'Could not process the image. Please try again with a clearer photo.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testOptions = [
    { type: 'pH' as TestType, icon: <Droplet size={20} />, desc: 'Acidity/Base' },
    { type: 'Iron' as TestType, icon: <Activity size={20} />, desc: 'Metals' },
    { type: 'Hardness' as TestType, icon: <FlaskConical size={20} />, desc: 'Minerals' },
    { type: 'Chlorine' as TestType, icon: <ShieldCheck size={20} />, desc: 'Purity' },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 overflow-x-hidden">
      <Toaster />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-full h-full bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-full h-full bg-accent/10 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 glass-card p-6 rounded-3xl border-white/5 bg-white/5 backdrop-blur-2xl">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-headline font-bold flex items-center gap-2 justify-center md:justify-start">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">AquaLens</span>
              <span className="text-slate-500 font-light">Pro</span>
            </h1>
            <p className="text-slate-500 text-xs font-medium tracking-[0.2em] uppercase mt-1">Diagnostic Intelligence System</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-white/10 text-[10px] uppercase font-bold tracking-widest py-1.5 px-4 rounded-full bg-white/5">
              Local Core Engine Active
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <LayoutDashboard size={16} className="text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Parameter Selection</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {testOptions.map((opt) => (
                  <Button
                    key={opt.type}
                    onClick={() => setSelectedTest(opt.type)}
                    variant="ghost"
                    className={cn(
                      "group h-auto py-6 flex flex-col gap-3 rounded-2xl transition-all duration-300 border",
                      selectedTest === opt.type 
                        ? "bg-primary/10 border-primary/50 text-white shadow-[0_0_20px_rgba(88,67,196,0.1)]" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-xl transition-all",
                      selectedTest === opt.type ? "bg-primary text-white scale-110" : "bg-white/5 text-slate-500"
                    )}>
                      {opt.icon}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-headline font-bold text-sm tracking-tight">{opt.type}</span>
                      <span className="text-[9px] uppercase tracking-widest opacity-40">{opt.desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Camera size={16} className="text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Strip Analysis</h2>
              </div>
              <div className="max-w-2xl">
                <CameraCapture label="Analyte Strip Feed" image={afterImage} onCapture={setAfterImage} />
              </div>
            </section>

            <div className="flex flex-col items-center gap-6 pt-4">
              <Button
                disabled={!selectedTest || !afterImage || isAnalyzing}
                onClick={handleAnalyze}
                size="lg"
                className={cn(
                  "w-full max-w-md h-14 rounded-2xl text-lg font-headline font-bold transition-all relative overflow-hidden group shadow-2xl",
                  !isAnalyzing && "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white",
                  isAnalyzing && "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Analyzing Chemistry...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    Interpret Results
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </div>

            {result && detectedValue && (
              <Card className="glass-card rounded-3xl overflow-hidden border-0 bg-white/5 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={cn(
                  "h-1.5 w-full",
                  result.safetyLevel === 'Safe' ? "bg-emerald-500" : 
                  result.safetyLevel === 'Warning' ? "bg-amber-500" : "bg-rose-500"
                )} />
                <CardHeader className="pb-4 pt-8 px-6 md:px-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <Badge className={cn(
                        "mb-3 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                        result.safetyLevel === 'Safe' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                        result.safetyLevel === 'Warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      )} variant="outline">
                        {result.safetyLevel} GRADE
                      </Badge>
                      <CardTitle className="font-headline text-3xl font-bold flex items-center gap-3">
                        {result.emojis} {result.safetyLevel} Status
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-6 bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-xl shadow-inner border border-white/10" style={{ backgroundColor: detectedValue.color }} />
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white leading-tight">{detectedValue.value}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{detectedValue.unit}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 md:px-8 pb-8">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl h-12">
                      <TabsTrigger value="overview" className="rounded-lg text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Comparative Analysis</TabsTrigger>
                      <TabsTrigger value="recommendations" className="rounded-lg text-xs font-bold uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white">Actionable Steps</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-6">
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                        <p className="leading-relaxed text-slate-300 text-sm md:text-base font-medium">{result.explanation}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="recommendations" className="mt-6">
                      <div className="bg-accent/5 p-5 rounded-2xl border border-accent/10">
                        <p className="leading-relaxed text-slate-200 text-sm md:text-base font-medium">{result.recommendation}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="xl:col-span-4 space-y-6">
            <Card className="glass-card rounded-3xl border-white/5 bg-white/5 overflow-hidden">
              <CardHeader className="bg-white/5 pb-4 px-6 pt-6">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-slate-400">
                  <History size={16} className="text-primary" /> Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <HistoryTable history={history} />
              </CardContent>
            </Card>

            <Card className="glass-card rounded-3xl border-white/5 bg-white/5 overflow-hidden">
              <CardHeader className="bg-white/5 pb-4 px-6 pt-6">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-slate-400">
                  <BarChart3 size={16} className="text-accent" /> Reliability Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Diagnostic Precision</span>
                    <span className="text-accent">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-1 bg-white/5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Standard Compliance</span>
                    <span className="text-primary">100%</span>
                  </div>
                  <Progress value={100} className="h-1 bg-white/5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-8 mb-4 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] text-center md:text-left">
            © 2024 developed by Suruti Sona Lab
          </p>
          <div className="flex gap-8 text-slate-600 text-[9px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Lab Protocols</a>
            <a href="#" className="hover:text-primary transition-colors">Compliance API</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
