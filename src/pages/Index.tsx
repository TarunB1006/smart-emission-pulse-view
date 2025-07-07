import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Header } from '@/components/dashboard/Header';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { RealtimeChart } from '@/components/dashboard/RealtimeChart';
import { ServiceTimeline } from '@/components/dashboard/ServiceTimeline';
import { SummaryStats } from '@/components/dashboard/SummaryStats';
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

interface DailyStats {
  max_co_in: number;
  avg_efficiency: number;
  total_energy: number;
  anomaly_count: number;
}

const Index = () => {
  console.log('🚀 Index component rendering...');
  
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
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  console.log('📊 Current state:', { 
    connectionStatus, 
    isLoading, 
    error,
    dataLength: historicalData.length 
  });

  // Fetch daily stats
  const fetchDailyStats = async () => {
    try {
      console.log('📈 Fetching daily stats...');
      const response = await fetch('http://localhost:5001/stats/daily');
      const data = await response.json();
      console.log('📈 Daily stats response:', data);
      if (!data.error) {
        setDailyStats(data);
      }
    } catch (error) {
      console.error('❌ Error fetching daily stats:', error);
    }
  };

  // Fetch historical data
  const fetchHistoricalData = async () => {
    try {
      console.log('📜 Fetching historical data...');
      const response = await fetch('http://localhost:5001/history');
      const data = await response.json();
      console.log('📜 Historical data response:', data);
      if (Array.isArray(data)) {
        setHistoricalData(data);
      }
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
    }
  };

  useEffect(() => {
    console.log('🔌 Setting up socket connection...');
    
    // Connect to your Flask backend
    const socket: Socket = io('http://localhost:5001', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Connected to backend');
      setConnectionStatus('connected');
      setError(null);
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

    socket.on('connect_error', (err) => {
      console.error('🚫 Socket connection error:', err);
      setConnectionStatus('disconnected');
      setError(`Connection failed: ${err.message}`);
    });

    socket.on('sensor_data', (data: SensorData) => {
      console.log('📡 Received sensor data:', data);
      
      try {
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

        // Show anomaly toast if detected
        if (data.anomaly) {
          toast({
            title: "⚠️ Anomaly Detected",
            description: data.recommendation,
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error('❌ Error processing sensor data:', err);
      }
    });

    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        console.log('🔄 Fetching initial data...');
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:5001/data');
        console.log('📦 Initial data response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Initial data:', data);
        
        if (!data.error) {
          setCurrentData(data);
          setLastUpdated(new Date(data.timestamp));
        }
        
        // Fetch all initial data
        await Promise.all([
          fetchDailyStats(),
          fetchHistoricalData()
        ]);
        
        setIsLoading(false);
        console.log('✅ Initial data loaded successfully');
        
      } catch (error) {
        console.error('❌ Error fetching initial data:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect to backend');
        setIsLoading(false);
        toast({
          title: "❌ Connection Error",
          description: "Could not connect to the backend. Make sure it's running on port 5001.",
          variant: "destructive",
        });
      }
    };

    fetchInitialData();

    return () => {
      console.log('🔌 Cleaning up socket connection...');
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

  console.log('🎨 About to render dashboard...');

  // Show loading state
  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show error state
  if (error) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Connection Error</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Make sure your Flask backend is running on http://localhost:5001
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Header lastUpdated={lastUpdated} connectionStatus={connectionStatus} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main chart taking full width on top */}
            <div className="lg:col-span-3">
              <RealtimeChart data={transformedHistoricalData} />
            </div>
            
            {/* Metrics grid */}
            <div className="lg:col-span-2">
              <MetricsGrid data={transformedCurrentData} recommendation={currentData.recommendation} />
            </div>
            
            {/* Sidebar with stats, export, and timeline */}
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
