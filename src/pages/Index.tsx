
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Header } from '@/components/dashboard/Header';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { RealtimeChart } from '@/components/dashboard/RealtimeChart';
import { ServiceTimeline } from '@/components/dashboard/ServiceTimeline';
<<<<<<< HEAD
import { ExportPanel } from '@/components/dashboard/ExportPanel';
=======
import { ExportPanel } from '@/components/dashboard/ExportPanel';  // Import SystemHealth if you want to display it
import { SummaryStats } from '@/components/dashboard/SummaryStats';
>>>>>>> Final changes to UI done
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

interface DailyStats {
  max_co_in: number;
  avg_efficiency: number;
  total_energy: number;
  anomaly_count: number;
}

interface SystemHealthData {
  health_score: number;
  status: string;
  avg_efficiency: number;
  anomaly_ratio: number;
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
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    max_co_in: 0,
    avg_efficiency: 0,
    total_energy: 0,
    anomaly_count: 0
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealthData>({
    health_score: 0,
    status: 'no_data',
    avg_efficiency: 0,
    anomaly_ratio: 0
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const { toast } = useToast();

  // Fetch daily stats
  const fetchDailyStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/stats/daily');
      const data = await response.json();
      if (!data.error) {
        setDailyStats(data);
      }
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    }
  };

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('http://localhost:5001/system/health');
      const data = await response.json();
      if (!data.error) {
        setSystemHealth(data);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  // Fetch historical data
  const fetchHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5001/history');
      const data = await response.json();
      if (Array.isArray(data)) {
        setHistoricalData(data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  useEffect(() => {
    // Connect to your Flask backend
    const socket: Socket = io('http://localhost:5001');

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

      // Refresh stats when new data arrives
      fetchDailyStats();
      fetchSystemHealth();

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
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:5001/data');
        const data = await response.json();
        if (!data.error) {
          setCurrentData(data);
          setLastUpdated(new Date(data.timestamp));
        }
        
        // Fetch all initial data
        await Promise.all([
          fetchDailyStats(),
          fetchSystemHealth(),
          fetchHistoricalData()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: "❌ Connection Error",
          description: "Could not connect to the backend. Make sure it's running on port 5000.",
          variant: "destructive",
        });
      }
    };

    fetchInitialData();

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
              <RealtimeChart data={transformedHistoricalData} />
              <MetricsGrid data={transformedCurrentData} recommendation={currentData.recommendation} />
            </div>
            
            {/* Sidebar with stats and timeline */}
            <div className="space-y-6">
              <SummaryStats data={dailyStats} />
              <ExportPanel />
              <ServiceTimeline />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;