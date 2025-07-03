
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

interface ServiceRecord {
  id: number;
  type: 'calibration' | 'cleaning' | 'maintenance';
  description: string;
  timestamp: Date;
  status: 'completed' | 'in-progress';
}

export const ServiceTimeline: React.FC = () => {
  const [services, setServices] = useState<ServiceRecord[]>([
    {
      id: 1,
      type: 'calibration',
      description: 'Sensor recalibration performed',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: 2,
      type: 'cleaning',
      description: 'Filter cleaning and replacement',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: 3,
      type: 'maintenance',
      description: 'Routine system maintenance',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: 'completed'
    }
  ]);

  const addServiceRecord = () => {
    const newService: ServiceRecord = {
      id: services.length + 1,
      type: 'maintenance',
      description: 'New maintenance record',
      timestamp: new Date(),
      status: 'in-progress'
    };
    setServices([newService, ...services]);
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'calibration':
        return Settings;
      case 'cleaning':
        return CheckCircle;
      default:
        return AlertTriangle;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'calibration':
        return 'text-blue-600 dark:text-blue-400';
      case 'cleaning':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-orange-600 dark:text-orange-400';
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Service Timeline</CardTitle>
        <Button size="sm" onClick={addServiceRecord} className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.slice(0, 4).map((service, index) => {
            const IconComponent = getServiceIcon(service.type);
            const colorClass = getServiceColor(service.type);
            
            return (
              <div key={service.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800`}>
                  <IconComponent className={`h-4 w-4 ${colorClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                      {service.type}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      service.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {service.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {service.timestamp.toLocaleDateString()} at {service.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
