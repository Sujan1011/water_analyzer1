
'use client';

import React from 'react';
import { Download, Table as TableIcon, FileText, Code, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TestResult {
  id: string;
  timestamp: number;
  type: string;
  value: number;
  unit: string;
  status: 'Safe' | 'Warning' | 'Critical';
  colorHex: string;
  explanation: string;
}

interface HistoryTableProps {
  history: TestResult[];
}

export function HistoryTable({ history }: HistoryTableProps) {
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aqualens_pro_history_${Date.now()}.json`;
    link.click();
  };

  const exportAsCSV = () => {
    const headers = ['ID', 'Timestamp', 'Type', 'Value', 'Unit', 'Status'];
    const rows = history.map(r => [
      r.id,
      new Date(r.timestamp).toLocaleString(),
      r.type,
      r.value,
      r.unit,
      r.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aqualens_pro_history_${Date.now()}.csv`;
    link.click();
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-600">
        <div className="p-4 rounded-full bg-white/5 border border-white/5 mb-4">
          <TableIcon size={32} strokeWidth={1.5} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em]">No diagnostic data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Export as:</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={exportAsJSON} className="h-8 rounded-lg text-[10px] bg-white/5 hover:bg-white/10 text-slate-300">
            JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={exportAsCSV} className="h-8 rounded-lg text-[10px] bg-white/5 hover:bg-white/10 text-slate-300">
            CSV
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto max-h-[500px]">
        <Table>
          <TableHeader className="sticky top-0 bg-[#0a0e17] z-10">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-widest text-slate-500 h-10">Module</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest text-slate-500 h-10">Intensity</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest text-slate-500 h-10 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id} className="border-white/5 group hover:bg-white/5 transition-colors cursor-default">
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-none">{item.type}</span>
                    <span className="text-[9px] text-slate-500 uppercase mt-1">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20" style={{ backgroundColor: item.colorHex }} />
                    <span className="text-xs font-mono text-slate-300">
                      {item.value} <span className="text-[10px] text-slate-500">{item.unit}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <Badge variant="outline" className={cn(
                    "text-[8px] font-bold px-2 py-0.5 rounded-full border-0 shadow-inner",
                    item.status === 'Safe' ? "bg-emerald-500/10 text-emerald-400" : 
                    item.status === 'Warning' ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                  )}>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
