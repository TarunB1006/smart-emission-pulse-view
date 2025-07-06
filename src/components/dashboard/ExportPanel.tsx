
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ExportPanel: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [timeWindow, setTimeWindow] = useState('24h');
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('http://localhost:5001/export/csv');
      if (response.ok) {
        const csvData = await response.text();
        
        // Create and download the CSV file
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sensor_data_${timeWindow}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "✅ Export Complete",
          description: `Sensor data exported successfully for the last ${timeWindow}`,
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "❌ Export Failed",
        description: "Could not export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <FileText className="h-4 w-4" />
          <span>Data Export</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Time Window
          </label>
          <Select value={timeWindow} onValueChange={setTimeWindow}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select time window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleExport}
          disabled={isExporting}
          className="w-full h-8"
          variant="default"
          size="sm"
        >
          {isExporting ? (
            <>
              <Download className="mr-2 h-3 w-3 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-3 w-3" />
              Export CSV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
