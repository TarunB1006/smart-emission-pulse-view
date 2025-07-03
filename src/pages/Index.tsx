import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { RealtimeChart } from '@/components/dashboard/RealtimeChart';
import { SummaryStats } from '@/components/dashboard/SummaryStats';
import { ServiceTimeline } from '@/components/dashboard/ServiceTimeline';
import { ExportPanel } from '@/components/dashboard/ExportPanel';
import { ThemeProvider } from '@/components/dashboard/ThemeProvider';
import { useToast } from '@/hooks/use-toast';

// Mock real-time data generation
const generateMockData = () => ({
  co_in: Math.random() * 150 + 20,
  co_out: Math.random() * 30 + 5,
  efficiency_predicted: Math.random() * 15 + 85,
  efficiency_actual: Math.random() * 10 + 88,
  voltage: Math.random() * 2 + 11,
  current: Math.random() * 50 + 150,
  power: Math.random() * 200 + 1650,
  anomaly_detected: Math.random() > 0.9,
  timestamp: new Date()
});

const Index = () => {
  const [currentData, setCurrentData] = useState(generateMockData());
  const [historicalData, setHistoricalData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { toast } = useToast();

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateMockData();
      setCurrentData(newData);
      setLastUpdated(new Date());
      
      // Add to historical data (keep last 50 points)
      setHistoricalData(prev => {
        const updated = [...prev, newData].slice(-50);
        return updated;
      });

      // Show anomaly toast
      if (newData.anomaly_detected) {
        toast({
          title: "⚠️ Anomaly Detected",
          description: "CO levels outside normal parameters. Check system immediately.",
          variant: "destructive",
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [toast]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Header lastUpdated={lastUpdated} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main metrics and chart */}
            <div className="lg:col-span-2 space-y-6">
              <MetricsGrid data={currentData} />
              <RealtimeChart data={historicalData} />
            </div>
            
            {/* Sidebar with stats and timeline */}
            <div className="space-y-6">
              <SummaryStats data={historicalData} />
              <ServiceTimeline />
              <ExportPanel />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
