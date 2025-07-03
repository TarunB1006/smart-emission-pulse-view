
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';

interface ChartData {
  co_in: number;
  co_out: number;
  efficiency_actual: number;
  timestamp: Date;
}

interface RealtimeChartProps {
  data: ChartData[];
}

export const RealtimeChart: React.FC<RealtimeChartProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<'co_in' | 'co_out' | 'efficiency_actual'>('co_in');

  const chartData = data.map((item, index) => ({
    time: index,
    co_in: item.co_in,
    co_out: item.co_out,
    efficiency: item.efficiency_actual,
    timestamp: item.timestamp?.toLocaleTimeString() || ''
  }));

  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'co_in':
        return { 
          color: '#dc2626', 
          label: 'CO Input (ppm)', 
          dataKey: 'co_in',
          icon: TrendingUp
        };
      case 'co_out':
        return { 
          color: '#2563eb', 
          label: 'CO Output (ppm)', 
          dataKey: 'co_out',
          icon: TrendingDown
        };
      case 'efficiency_actual':
        return { 
          color: '#16a34a', 
          label: 'Efficiency (%)', 
          dataKey: 'efficiency',
          icon: Activity
        };
    }
  };

  const config = getMetricConfig();
  const IconComponent = config.icon;

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <CardTitle className="text-lg">Real-Time Monitoring</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={activeMetric === 'co_in' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('co_in')}
            >
              CO In
            </Button>
            <Button
              variant={activeMetric === 'co_out' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('co_out')}
            >
              CO Out
            </Button>
            <Button
              variant={activeMetric === 'efficiency_actual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMetric('efficiency_actual')}
            >
              Efficiency
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                className="text-slate-600 dark:text-slate-400"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-slate-600 dark:text-slate-400"
              />
              <Tooltip 
                labelStyle={{ color: '#64748b' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke={config.color}
                strokeWidth={2}
                dot={{ fill: config.color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: config.color, strokeWidth: 2 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {config.label} over the last {chartData.length} readings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
