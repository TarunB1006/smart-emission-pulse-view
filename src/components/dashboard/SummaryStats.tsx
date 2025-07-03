
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity, Zap, AlertTriangle } from 'lucide-react';

interface SummaryStatsProps {
  data: any[];
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ data }) => {
  const calculateStats = () => {
    if (!data.length) return {
      maxCoIn: 0,
      avgEfficiency: 0,
      totalEnergy: 0,
      anomalyCount: 0
    };

    const maxCoIn = Math.max(...data.map(d => d.co_in));
    const avgEfficiency = data.reduce((sum, d) => sum + d.efficiency_actual, 0) / data.length;
    const totalEnergy = data.reduce((sum, d) => sum + d.power, 0) / 1000; // Convert to watts
    const anomalyCount = data.filter(d => d.anomaly_detected).length;

    return { maxCoIn, avgEfficiency, totalEnergy, anomalyCount };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: 'Max CO Input Today',
      value: stats.maxCoIn.toFixed(1),
      unit: 'ppm',
      icon: TrendingUp,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Avg Efficiency',
      value: stats.avgEfficiency.toFixed(1),
      unit: '%',
      icon: Activity,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Total Energy Generated',
      value: stats.totalEnergy.toFixed(2),
      unit: 'W',
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      title: 'Anomalies Detected',
      value: stats.anomalyCount.toString(),
      unit: 'today',
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        Summary Statistics
      </h3>
      {statCards.map((stat, index) => (
        <Card key={index} className="transition-all duration-300 hover:shadow-lg animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.title}
                </p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.unit}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
