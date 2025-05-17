import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Trade } from '@/components/trades/types/TradeTypes';
import type { TradingSetup } from '@/components/setups/SetupsList';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  trades: Trade[];
  setups: TradingSetup[];
  metrics: any;
  healthData: any;
  dayPerformance: any;
  timePerformance: any;
  topSetups: any;
  topSymbols: any;
  timeHeldCategories: any;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  trades,
  setups,
  metrics: metricsData,
  healthData,
  dayPerformance,
  timePerformance,
  topSetups,
  topSymbols,
  timeHeldCategories
}) => {
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Handle mobile detection with resize listener
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const exportToExcel = async () => {
    try {
      setLoading(true);

      if (!trades || !setups || !metricsData) {
        throw new Error('Required data is missing');
      }

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Trades sheet
      const tradesData = trades.map(trade => ({
        'Date': new Date(trade.entry_date).toLocaleDateString(),
        'Symbol': trade.symbol,
        'Direction': trade.direction,
        'Setup': trade.setup?.name || 'N/A',
        'Entry Price': trade.entry_price,
        'Exit Price': trade.exit_price || 'N/A',
        'Quantity': trade.quantity,
        'P&L': trade.profit_loss || 0,
        'Notes': trade.notes || 'N/A'
      }));
      const tradesSheet = XLSX.utils.json_to_sheet(tradesData);
      XLSX.utils.book_append_sheet(wb, tradesSheet, 'Trades');

      // Setups sheet
      const setupsData = setups.map(setup => ({
        'Name': setup.name,
        'Category': setup.category,
        'Status': setup.is_active ? 'Active' : 'Inactive',
        'Description': setup.description || 'N/A',
        'Criteria': setup.criteria || 'N/A',
        'Entry Rules': setup.entry_rules || 'N/A',
        'Exit Rules': setup.exit_rules || 'N/A',
        'Risk Management': setup.risk_management || 'N/A'
      }));
      const setupsSheet = XLSX.utils.json_to_sheet(setupsData);
      XLSX.utils.book_append_sheet(wb, setupsSheet, 'Setups');

      // Performance sheet
      const performanceData = [
        { 'Metric': 'Total P&L', 'Value': metricsData.totalPL.value },
        { 'Metric': 'Win Rate', 'Value': metricsData.winRate.value },
        { 'Metric': 'Profit Factor', 'Value': metricsData.profitFactor.value },
        { 'Metric': 'Average Win', 'Value': metricsData.averageWin.value },
        { 'Metric': 'Average Loss', 'Value': metricsData.averageLoss.value },
        { 'Metric': 'Max Drawdown', 'Value': metricsData.maxDrawdown.value }
      ];
      const performanceSheet = XLSX.utils.json_to_sheet(performanceData);
      XLSX.utils.book_append_sheet(wb, performanceSheet, 'Performance');

      // Handle mobile file saving
      if (isMobile) {
        // For mobile, create a blob and use share API if available
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        if (navigator.share) {
          try {
            await navigator.share({
              files: [new File([blob], 'trading_analysis.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })],
              title: 'Trading Analysis',
              text: 'Trading analysis data export'
            });
          } catch (err) {
            // Fallback to download if share fails
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'trading_analysis.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }
        } else {
          // Fallback for browsers without share API
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'trading_analysis.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      } else {
        // For desktop, use standard file save
        XLSX.writeFile(wb, 'trading_analysis.xlsx');
      }

      toast({
        title: "Success",
        description: "Data exported to Excel successfully."
      });
    } catch (error: any) {
      console.error('Error exporting to Excel:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to export data to Excel.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setLoading(true);

      if (!trades || !metricsData) {
        throw new Error('Required data is missing');
      }

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      let yPos = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.text('Trading Analysis Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Add date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Add performance metrics
      pdf.setFontSize(16);
      pdf.text('Performance Metrics', margin, yPos);
      yPos += 10;

      pdf.setFontSize(12);
      const metricsList = [
        `Total P&L: $${metricsData.totalPL.value.toFixed(2)}`,
        `Win Rate: ${metricsData.winRate.value}%`,
        `Profit Factor: ${metricsData.profitFactor.value}`,
        `Average Win: $${metricsData.averageWin.value.toFixed(2)}`,
        `Average Loss: $${metricsData.averageLoss.value.toFixed(2)}`,
        `Max Drawdown: $${metricsData.maxDrawdown.value.toFixed(2)}`
      ];

      metricsList.forEach(metric => {
        pdf.text(metric, margin, yPos);
        yPos += 7;
      });

      yPos += 10;

      // Add recent trades
      pdf.setFontSize(16);
      pdf.text('Recent Trades', margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      const recentTrades = trades.slice(0, 10).map(trade => ({
        date: new Date(trade.entry_date).toLocaleDateString(),
        symbol: trade.symbol,
        direction: trade.direction,
        pnl: trade.profit_loss || 0
      }));

      recentTrades.forEach(trade => {
        const text = `${trade.date} - ${trade.symbol} (${trade.direction}): $${trade.pnl.toFixed(2)}`;
        pdf.text(text, margin, yPos);
        yPos += 7;
      });

      // Handle mobile file saving
      if (isMobile) {
        const pdfBlob = pdf.output('blob');
        
        if (navigator.share) {
          try {
            await navigator.share({
              files: [new File([pdfBlob], 'trading_analysis.pdf', { type: 'application/pdf' })],
              title: 'Trading Analysis',
              text: 'Trading analysis PDF report'
            });
          } catch (err) {
            // Fallback to download if share fails
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'trading_analysis.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }
        } else {
          // Fallback for browsers without share API
          const url = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'trading_analysis.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      } else {
        // For desktop, use standard file save
        pdf.save('trading_analysis.pdf');
      }

      toast({
        title: "Success",
        description: "Data exported to PDF successfully."
      });
    } catch (error: any) {
      console.error('Error exporting to PDF:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to export data to PDF.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Trading Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Export Format</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={exportToExcel}
                disabled={loading}
              >
                {loading ? 'Exporting...' : 'Export to Excel'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={exportToPDF}
                disabled={loading}
              >
                {loading ? 'Exporting...' : 'Export to PDF'}
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Excel export includes:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Complete trade history</li>
              <li>Trading setups</li>
              <li>Performance metrics</li>
            </ul>
            <p className="mt-2">PDF export includes:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Performance summary</li>
              <li>Recent trades</li>
              <li>Key metrics</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog; 