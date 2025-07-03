
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SystemHealthProps {
  data: {
    health_score: number;
    status: string;
    avg_efficiency: number;
    anomaly_ratio: number;
  };
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ data }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'excellent':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          icon: CheckCircle,
          label: 'Excellent'
        };
      case 'good':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          icon: Activity,
          label: 'Good'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          icon: AlertTriangle,
          label: 'Warning'
        };
      case 'critical':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          icon: XCircle,
          label: 'Critical'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          icon: Activity,
          label: 'No Data'
        };
    }
  };

  const statusConfig = getStatusConfig(data.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            System Health
          </span>
          <Badge variant="outline" className={`${statusConfig.textColor} border-current`}>
            {statusConfig.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Score Circle */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200 dark:text-slate-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.health_score / 100)}`}
                className={statusConfig.textColor}
                style={{
                  transition: 'stroke-dashoffset 0.5s ease-in-out',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <StatusIcon className={`w-6 h-6 ${statusConfig.textColor} mb-1`} />
              <span className={`text-2xl font-bold ${statusConfig.textColor}`}>
                {data.health_score}%
              </span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Efficiency
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {data.avg_efficiency}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Anomaly Rate
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {data.anomaly_ratio}%
            </p>
          </div>
        </div>

        {/* Health Score Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Health Score</span>
            <span className={`font-medium ${statusConfig.textColor}`}>
              {data.health_score}%
            </span>
          </div>
          <Progress 
            value={data.health_score} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};
