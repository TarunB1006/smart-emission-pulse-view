
import React from 'react';
import { useTheme } from './ThemeProvider';
import { Activity, Sun, Moon, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  lastUpdated: Date;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected';
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated, connectionStatus = 'connected' }) => {
  const { theme, toggleTheme } = useTheme();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConnectionIndicator = () => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
            <Loader2 className="w-2 h-2 animate-spin" />
            <span>Connecting...</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live • {formatTime(lastUpdated)}</span>
          </div>
        );
      case 'disconnected':
        return (
          <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
            <WifiOff className="w-2 h-2" />
            <span>Disconnected</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Smart Emissions Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              CO Emissions & Energy Conversion System
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {getConnectionIndicator()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
