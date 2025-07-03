
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Header } from '@/components/dashboard/Header';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { RealtimeChart } from '@/components/dashboard/RealtimeChart';
import { SummaryStats } from '@/components/dashboard/SummaryStats';
import { ServiceTimeline } from '@/components/dashboard/ServiceTimeline';
import { ExportPanel } from '@/components/dashboard/ExportPanel';
import { ThemeProvider } from '@/components/dashboard/ThemeProvider';
import { useToast } from '@/hooks/use-toast';

// Define the interface for sensor data from your backend
interface SensorData {
  timestamp: string;
  co_in: number;
  co_out: number;
  efficiency: number;
  predicted_efficiency: number;
  voltage: number;
  current: number;
  power: number;
  anomaly: boolean;
  recommendation: string;
}

const Index = () => {
  const [currentData, setCurrentData] = useState<SensorData>({
    timestamp: new Date().toISOString(),
    co_in: 0,
    co_out: 0,
    efficiency: 0,
    predicted_efficiency: 0,
    voltage: 0,
    current: 0,
    power: 0,
    anomaly: false,
    recommendation: "Waiting for data..."
  });
  
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const { toast } = useToast();

  useEffect(() => {
    // Connect to your Flask backend
    const socket: Socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('✅ Connected to backend');
      setConnectionStatus('connected');
      toast({
        title: "🔌 Connected",
        description: "Successfully connected to the IoT backend",
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
      setConnectionStatus('disconnected');
      toast({
        title: "⚠️ Connection Lost",
        description: "Attempting to reconnect to the backend...",
        variant: "destructive",
      });
    });

    socket.on('sensor_data', (data: SensorData) => {
      console.log('📡 Received sensor data:', data);
      
      // Update current data
      setCurrentData(data);
      setLastUpdated(new Date(data.timestamp));
      
      // Add to historical data (keep last 50 points)
      setHistoricalData(prev => {
        const updated = [...prev, data].slice(-50);
        return updated;
      });

      // Show anomaly toast if detected
      if (data.anomaly) {
        toast({
          title: "⚠️ Anomaly Detected",
          description: data.recommendation,
          variant: "destructive",
        });
      }
    });

    // Fetch initial data
    fetch('http://localhost:5000/data')
      .then(response => response.json())
      .then(data => {
        if (!data.error) {
          setCurrentData(data);
          setLastUpdated(new Date(data.timestamp));
        }
      })
      .catch(error => {
        console.error('Error fetching initial data:', error);
        toast({
          title: "❌ Connection Error",
          description: "Could not connect to the backend. Make sure it's running on port 5000.",
          variant: "destructive",
        });
      });

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  // Transform data for the existing components
  const transformedCurrentData = {
    co_in: currentData.co_in,
    co_out: currentData.co_out,
    efficiency_predicted: currentData.predicted_efficiency,
    efficiency_actual: currentData.efficiency,
    voltage: currentData.voltage,
    current: currentData.current,
    power: currentData.power,
    anomaly_detected: currentData.anomaly,
    timestamp: new Date(currentData.timestamp)
  };

  const transformedHistoricalData = historicalData.map(item => ({
    co_in: item.co_in,
    co_out: item.co_out,
    efficiency_actual: item.efficiency,
    timestamp: new Date(item.timestamp)
  }));

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Header lastUpdated={lastUpdated} connectionStatus={connectionStatus} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main metrics and chart */}
            <div className="lg:col-span-2 space-y-6">
              <MetricsGrid data={transformedCurrentData} recommendation={currentData.recommendation} />
              <RealtimeChart data={transformedHistoricalData} />
            </div>
            
            {/* Sidebar with stats and timeline */}
            <div className="space-y-6">
              <SummaryStats data={transformedHistoricalData} />
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
