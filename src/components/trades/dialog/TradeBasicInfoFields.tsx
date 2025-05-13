
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TradingSetup } from '../../setups/SetupsList';

interface TradeBasicInfoFieldsProps {
  symbol: string;
  setSymbol: (value: string) => void;
  setupId: string | null;
  setSetupId: (value: string | null) => void;
  entryDate: string;
  setEntryDate: (value: string) => void;
  exitDate: string;
  setExitDate: (value: string) => void;
  setups: TradingSetup[];
}

const TradeBasicInfoFields: React.FC<TradeBasicInfoFieldsProps> = ({
  symbol,
  setSymbol,
  setupId,
  setSetupId,
  entryDate,
  setEntryDate,
  exitDate,
  setExitDate,
  setups
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol *</Label>
          <Input 
            id="symbol" 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g., AAPL"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="setup">Trading Setup</Label>
          <Select 
            value={setupId || ""} 
            onValueChange={(value) => setSetupId(value === "none" ? null : value)}
          >
            <SelectTrigger id="setup">
              <SelectValue placeholder="Select setup" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {setups.map((setup) => (
                <SelectItem key={setup.id} value={setup.id}>
                  {setup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entryDate">Entry Date *</Label>
          <Input 
            id="entryDate" 
            type="date" 
            value={entryDate} 
            onChange={(e) => setEntryDate(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exitDate">Exit Date</Label>
          <Input 
            id="exitDate" 
            type="date" 
            value={exitDate} 
            onChange={(e) => setExitDate(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default TradeBasicInfoFields;
