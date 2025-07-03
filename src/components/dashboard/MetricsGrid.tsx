
import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MetricsData {
  co_in: number;
  co_out: number;
  efficiency_predicted: number;
  efficiency_actual: number;
  voltage: number;
  current: number;
  power: number;
  anomaly_detected: boolean;
}

interface MetricsGridProps {
  data: MetricsData;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ data }) => {
  const getStatusColor = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value < threshold : value > threshold;
    return isGood ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  };

  const getRecommendation = () => {
    if (data.anomaly_detected) return "Check system immediately";
    if (data.co_in > 100) return "Increase filtration rate";
    if (data.efficiency_actual < 85) return "Schedule maintenance";
    return "System operating normally";
  };

  const metrics = [
    {
      title: 'CO Input',
      value: data.co_in.toFixed(1),
      unit: 'ppm',
      icon: TrendingUp,
      color: getStatusColor(data.co_in, 100, true),
      critical: data.co_in > 100
    },
    {
      title: 'CO Output',
      value: data.co_out.toFixed(1),
      unit: 'ppm',
      icon: TrendingDown,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Efficiency (Predicted)',
      value: data.efficiency_predicted.toFixed(1),
      unit: '%',
      icon: Activity,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Efficiency (Actual)',
      value: data.efficiency_actual.toFixed(1),
      unit: '%',
      icon: CheckCircle,
      color: getStatusColor(data.efficiency_actual, 85)
    },
    {
      title: 'Voltage',
      value: data.voltage.toFixed(2),
      unit: 'V',
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Current',
      value: data.current.toFixed(0),
      unit: 'mA',
      icon: Activity,
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="transition-all duration-300 hover:shadow-lg animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {metric.unit}
                </span>
                {metric.critical && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Power and Anomaly Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Power Output
            </CardTitle>
            <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.power.toFixed(0)}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">mW</span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              System Status
            </CardTitle>
            {data.anomaly_detected ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge 
                variant={data.anomaly_detected ? "destructive" : "secondary"}
                className="text-xs"
              >
                {data.anomaly_detected ? "Anomaly Detected" : "Normal Operation"}
              </Badge>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getRecommendation()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
