
'use client';

import React, { useState, useEffect } from 'react';
import { FlaskConical, Droplet, Activity, ShieldCheck, Info, BarChart3, History, Sparkles, Send } from 'lucide-react';
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
    { type: 'pH' as TestType, icon: <Droplet size={20} />, desc: 'Acidity/Alkalinity' },
    { type: 'Iron' as TestType, icon: <Activity size={20} />, desc: 'Metallic Content' },
    { type: 'Hardness' as TestType, icon: <FlaskConical size={20} />, desc: 'Ca/Mg Levels' },
    { type: 'Chlorine' as TestType, icon: <ShieldCheck size={20} />, desc: 'Sanitization' },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
      {/* Header Section */}
      <header className="text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold flex items-center gap-3">
            AquaLens <span className="text-[#29BBE1]">Pro</span>
          </h1>
          <p className="text-white/70 mt-2 text-lg font-medium">Advanced Water Quality Diagnostics & Analysis</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="text-white border-white/20 bg-white/5 py-1 px-3">
            v2.4 Scientific Edition
          </Badge>
          <Badge variant="outline" className="text-white border-white/20 bg-white/5 py-1 px-3">
            AI Enhanced
          </Badge>
        </div>
      </header>

      {/* Test Selection */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {testOptions.map((opt) => (
          <Button
            key={opt.type}
            onClick={() => setSelectedTest(opt.type)}
            variant={selectedTest === opt.type ? 'default' : 'secondary'}
            className={cn(
              "h-auto py-6 flex flex-col gap-2 rounded-xl transition-all duration-300 border-2",
              selectedTest === opt.type 
                ? "bg-[#5843C4] border-white text-white shadow-xl scale-105" 
                : "bg-white/10 border-transparent text-white/80 hover:bg-white/20"
            )}
          >
            {opt.icon}
            <span className="font-headline font-bold text-lg">{opt.type}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60 font-body">{opt.desc}</span>
          </Button>
        ))}
      </section>

      {/* Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CameraCapture label="1. Control (Before)" image={beforeImage} onCapture={setBeforeImage} />
            <CameraCapture label="2. Active (After)" image={afterImage} onCapture={setAfterImage} />
          </div>

          <div className="flex justify-center pt-4">
            <Button
              disabled={!selectedTest || !afterImage || isAnalyzing}
              onClick={handleAnalyze}
              size="lg"
              className={cn(
                "w-full max-w-sm h-14 rounded-full text-lg font-headline font-bold transition-all shadow-xl",
                !isAnalyzing && "bg-[#29BBE1] hover:bg-[#29BBE1]/90 text-white",
                isAnalyzing && "bg-muted"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Strip...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-5 w-5" />
                  Begin Analysis
                </>
              )}
            </Button>
          </div>

          {isAnalyzing && (
             <div className="space-y-2 text-center animate-pulse">
               <Progress value={66} className="h-1 bg-white/10" />
               <p className="text-white/60 text-xs">Processing image tensors with AI...</p>
             </div>
          )}

          {/* Result Area */}
          {result && detectedValue && (
            <Card className="bg-white rounded-2xl shadow-2xl overflow-hidden border-0">
              <div className={cn(
                "h-2 w-full",
                result.safetyLevel === 'Safe' ? "bg-green-500" : 
                result.safetyLevel === 'Warning' ? "bg-yellow-500" : "bg-red-500"
              )} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline text-3xl font-bold flex items-center gap-2">
                    {result.emojis} {result.safetyLevel}
                  </CardTitle>
                  <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-full">
                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: detectedValue.color }} />
                    <span className="font-bold text-xl">{detectedValue.value} <span className="text-sm font-normal opacity-70">{detectedValue.unit}</span></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Scientific Analysis</TabsTrigger>
                    <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-6 space-y-4">
                    <div className="flex items-start gap-4 bg-muted/30 p-4 rounded-lg">
                      <Info className="text-[#5843C4] shrink-0 mt-1" />
                      <p className="leading-relaxed text-foreground/80">{result.explanation}</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="recommendations" className="mt-6 space-y-4">
                    <div className="flex items-start gap-4 bg-[#29BBE1]/10 p-4 rounded-lg">
                      <Sparkles className="text-[#29BBE1] shrink-0 mt-1" />
                      <p className="leading-relaxed text-foreground/80 font-medium">{result.recommendation}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-0">
            <CardHeader className="pb-2">
              <CardTitle className="font-headline flex items-center gap-2">
                <History className="text-[#5843C4]" /> Test History
              </CardTitle>
              <CardDescription>Recent diagnostic logs</CardDescription>
            </CardHeader>
            <CardContent>
              <HistoryTable history={history} />
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-0 overflow-hidden">
            <div className="bg-[#5843C4] p-4 text-white">
              <h4 className="font-headline font-bold flex items-center gap-2">
                <BarChart3 size={18} /> Global Benchmarks
              </h4>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>pH Balance</span>
                  <span>7.2 (Avg)</span>
                </div>
                <Progress value={72} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Water Safety</span>
                  <span>94% Success</span>
                </div>
                <Progress value={94} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-white/40 text-sm">
        <p>© 2024 AquaLens Pro Systems. Professional Water Diagnostic Software.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">API</a>
        </div>
      </footer>
    </main>
  );
}
