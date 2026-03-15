
'use client';

import React, { useState, useEffect } from 'react';
import { FlaskConical, Droplet, Activity, ShieldCheck, Info, BarChart3, History, Sparkles, ChevronRight, LayoutDashboard } from 'lucide-react';
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

export default function Home() {
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<WaterQualityTestOutput | null>(null);
  const [detectedValue, setDetectedValue] = useState<{value: number, unit: string, color: string} | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('aqua-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedTest || !afterImage) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const [r, g, b] = await getDominantColor(afterImage);
      const closest = findClosestColor(selectedTest, r, g, b);
      
      setDetectedValue({
        value: closest.value,
        unit: closest.unit,
        color: closest.hex
      });

      const interpretation = await interpretResults({
        testType: selectedTest,
        value: closest.value,
        unit: closest.unit,
        colorDetected: closest.name
      });

      setResult(interpretation);

      const newHistoryItem: TestResult = {
        id: Math.random().toString(36).substr(2, 9),
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

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testOptions = [
    { type: 'pH' as TestType, icon: <Droplet size={24} />, desc: 'Acidity Index' },
    { type: 'Iron' as TestType, icon: <Activity size={24} />, desc: 'Trace Metals' },
    { type: 'Hardness' as TestType, icon: <FlaskConical size={24} />, desc: 'Mineral Density' },
    { type: 'Chlorine' as TestType, icon: <ShieldCheck size={24} />, desc: 'Purity Check' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 overflow-x-hidden font-body">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-12 flex flex-col gap-8 md:gap-12">
        {/* Navbar-like Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 glass-card p-6 rounded-3xl">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-headline font-bold flex items-center gap-3">
              <span className="gradient-text">AquaLens</span> <span className="text-accent">Pro</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base font-medium">Precision AI Water Diagnostics</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/50 text-primary-foreground bg-primary/10 py-1.5 px-4 rounded-full">
              Enterprise Suite
            </Badge>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg">
              <Activity size={20} className="text-white" />
            </div>
          </div>
        </header>

        {/* Desktop Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Controls - 8 columns */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Step 1: Selection */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <LayoutDashboard size={18} className="text-primary" />
                <h2 className="text-lg font-headline font-bold uppercase tracking-widest text-slate-400">01. Select Test Module</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {testOptions.map((opt) => (
                  <Button
                    key={opt.type}
                    onClick={() => setSelectedTest(opt.type)}
                    variant="ghost"
                    className={cn(
                      "group h-auto py-8 flex flex-col gap-3 rounded-2xl transition-all duration-300 border-2",
                      selectedTest === opt.type 
                        ? "bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(88,67,196,0.3)] scale-[1.02]" 
                        : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      selectedTest === opt.type ? "bg-primary text-white" : "bg-white/5 text-slate-500 group-hover:text-slate-300"
                    )}>
                      {opt.icon}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-headline font-bold text-lg">{opt.type}</span>
                      <span className="text-[10px] uppercase tracking-widest opacity-60">{opt.desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </section>

            {/* Step 2: Capture */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <CameraCapture.Icon size={18} className="text-accent" />
                <h2 className="text-lg font-headline font-bold uppercase tracking-widest text-slate-400">02. Visual Data Input</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <CameraCapture label="Control (Baseline)" image={beforeImage} onCapture={setBeforeImage} />
                <CameraCapture label="Analyte (Reacted)" image={afterImage} onCapture={setAfterImage} />
              </div>
            </section>

            {/* Step 3: Action */}
            <div className="flex flex-col items-center gap-6 pt-4">
              <Button
                disabled={!selectedTest || !afterImage || isAnalyzing}
                onClick={handleAnalyze}
                size="lg"
                className={cn(
                  "w-full max-w-md h-16 rounded-2xl text-xl font-headline font-bold transition-all shadow-2xl relative overflow-hidden group",
                  !isAnalyzing && "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white",
                  isAnalyzing && "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                    Neural Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                    Analyze with AI
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
              
              {isAnalyzing && (
                <div className="w-full max-w-md space-y-3">
                  <Progress value={66} className="h-2 bg-white/5" />
                  <p className="text-center text-xs text-slate-500 font-mono tracking-tighter animate-pulse">
                    MAPPING COLOR VECTORS TO CHEMICAL DATABASE...
                  </p>
                </div>
              )}
            </div>

            {/* Result Area */}
            {result && detectedValue && (
              <Card className="glass-card rounded-3xl overflow-hidden border-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={cn(
                  "h-3 w-full",
                  result.safetyLevel === 'Safe' ? "bg-emerald-500" : 
                  result.safetyLevel === 'Warning' ? "bg-amber-500" : "bg-rose-500"
                )} />
                <CardHeader className="pb-4 pt-8 px-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <Badge className={cn(
                        "mb-3 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] rounded-full",
                        result.safetyLevel === 'Safe' ? "bg-emerald-500/20 text-emerald-400" : 
                        result.safetyLevel === 'Warning' ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                      )}>
                        {result.safetyLevel} Status
                      </Badge>
                      <CardTitle className="font-headline text-4xl md:text-5xl font-bold flex items-center gap-4">
                        {result.emojis} {result.safetyLevel}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-6 bg-white/5 px-8 py-5 rounded-3xl border border-white/10 shadow-inner">
                      <div className="w-10 h-10 rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ backgroundColor: detectedValue.color }} />
                      <div className="flex flex-col">
                        <span className="text-3xl font-bold text-white leading-none">{detectedValue.value}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{detectedValue.unit}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-2xl h-14">
                      <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white h-full">Expert Analysis</TabsTrigger>
                      <TabsTrigger value="recommendations" className="rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white h-full">Actionable Steps</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-8">
                      <div className="flex gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 group">
                        <Info className="text-primary shrink-0 group-hover:scale-110 transition-transform" size={24} />
                        <p className="leading-relaxed text-slate-300 text-lg">{result.explanation}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="recommendations" className="mt-8">
                      <div className="flex gap-6 bg-accent/10 p-6 rounded-2xl border border-accent/20 group">
                        <Sparkles className="text-accent shrink-0 group-hover:rotate-12 transition-transform" size={24} />
                        <p className="leading-relaxed text-slate-200 text-lg font-medium">{result.recommendation}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - 4 columns */}
          <div className="xl:col-span-4 space-y-8">
            <Card className="glass-card rounded-3xl border-0 overflow-hidden">
              <CardHeader className="bg-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                      <History className="text-primary" size={20} /> Diagnostic Logs
                    </CardTitle>
                    <CardDescription className="text-slate-500">Historical data archive</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <HistoryTable history={history} />
              </CardContent>
            </Card>

            <Card className="glass-card rounded-3xl border-0 overflow-hidden">
              <div className="bg-primary/20 p-5 border-b border-white/10">
                <h4 className="font-headline font-bold flex items-center gap-3 text-white">
                  <BarChart3 size={20} className="text-primary" /> Global Performance
                </h4>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    <span>Average pH Level</span>
                    <span className="text-primary">7.2 pH</span>
                  </div>
                  <Progress value={72} className="h-2 bg-white/5" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    <span>Safety Compliance</span>
                    <span className="text-accent">94% Rate</span>
                  </div>
                  <Progress value={94} className="h-2 bg-white/5" />
                </div>
                <div className="pt-2">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-loose">
                      System Status: <span className="text-emerald-500">Optimal</span><br/>
                      Last Sync: <span className="text-slate-300">Just now</span><br/>
                      Node: <span className="text-slate-300">Global Primary</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 mb-4 flex flex-col items-center gap-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.2em]">
            <p>© 2024 developed by Suruti Sona Lab</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-primary transition-colors">Privacy Protcol</a>
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">Developer API</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Helper to avoid interface mismatch in main component
CameraCapture.Icon = CameraCapture.Icon || Activity;
