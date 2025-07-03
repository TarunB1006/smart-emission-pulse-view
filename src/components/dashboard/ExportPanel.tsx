
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ExportPanel: React.FC = () => {
  const [timeWindow, setTimeWindow] = useState('24h');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Complete",
        description: `Data for the last ${timeWindow} has been exported to CSV.`,
      });
    }, 2000);
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Data Export</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
            Time Window
          </label>
          <Select value={timeWindow} onValueChange={setTimeWindow}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last 1 Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </>
          )}
        </Button>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>• Includes all sensor readings</p>
          <p>• Timestamp in UTC format</p>
          <p>• Compatible with Excel/Sheets</p>
        </div>
      </CardContent>
    </Card>
  );
};
