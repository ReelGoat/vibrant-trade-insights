
import React from 'react';
import { Plus, FileEdit, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import type { Trade } from '../types/TradeTypes';

interface TradeTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onEdit, onDelete }) => {
  const renderProfitLoss = (value: number | null) => {
    if (value === null) return '-';
    
    const isProfit = value >= 0;
    const formattedValue = `$${Math.abs(value).toFixed(2)}`;
    
    return (
      <span className={isProfit ? 'text-profit' : 'text-loss'}>
        {isProfit ? '+' : '-'}{formattedValue}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Setup</TableHead>
            <TableHead>Entry/Exit</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead>Rules</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>
                <div>{new Date(trade.entry_date).toLocaleDateString()}</div>
                {trade.exit_date && (
                  <div className="text-xs text-muted-foreground">
                    to {new Date(trade.exit_date).toLocaleDateString()}
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{trade.symbol}</TableCell>
              <TableCell>
                <span className={`flex items-center ${trade.direction === 'long' ? 'text-profit' : 'text-loss'}`}>
                  {trade.direction === 'long' ? (
                    <ArrowUp className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4" />
                  )}
                  {trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)}
                </span>
              </TableCell>
              <TableCell>{trade.setup?.name || '-'}</TableCell>
              <TableCell>
                <div>${trade.entry_price}</div>
                {trade.exit_price && (
                  <div className="text-xs text-muted-foreground">${trade.exit_price}</div>
                )}
              </TableCell>
              <TableCell>{trade.quantity}</TableCell>
              <TableCell>{renderProfitLoss(trade.profit_loss)}</TableCell>
              <TableCell>
                {/* Rules followed/violated count */}
                <div className="text-xs">
                  {trade.rules_followed?.length ? (
                    <span className="text-profit block">
                      {trade.rules_followed.length} followed
                    </span>
                  ) : null}
                  {trade.rules_violated?.length ? (
                    <span className="text-loss block">
                      {trade.rules_violated.length} violated
                    </span>
                  ) : null}
                  {(!trade.rules_followed?.length && !trade.rules_violated?.length) ? '-' : null}
                </div>
              </TableCell>
              <TableCell className="text-right space-x-1">
                {trade.screenshot_url && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={16} />
                    </a>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onEdit(trade)}
                >
                  <FileEdit size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive/80" 
                  onClick={() => onDelete(trade.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TradeTable;
