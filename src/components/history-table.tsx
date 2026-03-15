
'use client';

import React from 'react';
import { Download, Table as TableIcon, FileText, Code } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      <div className="text-center py-12 text-muted-foreground">
        <TableIcon size={48} className="mx-auto opacity-20 mb-2" />
        <p>No tests recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={exportAsJSON}>
          <Code className="mr-2 h-4 w-4" /> JSON
        </Button>
        <Button variant="outline" size="sm" onClick={exportAsCSV}>
          <FileText className="mr-2 h-4 w-4" /> CSV
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Test</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-xs">
                  {new Date(item.timestamp).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">{item.type}</TableCell>
                <TableCell>
                  {item.value} {item.unit}
                </TableCell>
                <TableCell>
                  <div 
                    className="w-4 h-4 rounded-full border border-black/10" 
                    style={{ backgroundColor: item.colorHex }}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={
                    item.status === 'Safe' ? 'secondary' : 
                    item.status === 'Warning' ? 'default' : 'destructive'
                  }>
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
