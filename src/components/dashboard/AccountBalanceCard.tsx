
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface AccountBalanceCardProps {
  currentBalance: number;
  initialDeposit: number;
}

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  currentBalance: initialCurrentBalance,
  initialDeposit: initialInitialDeposit,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [initialDeposit, setInitialDeposit] = useState(initialInitialDeposit);
  const [currentBalance, setCurrentBalance] = useState(initialCurrentBalance);
  const [tempInitialDeposit, setTempInitialDeposit] = useState(initialInitialDeposit.toString());
  const [isLoading, setIsLoading] = useState(false);

  // Load saved initial deposit value from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('account_settings')
          .select('initial_deposit')
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            // No settings exist yet, create with default value
            await supabase
              .from('account_settings')
              .insert([{ id: 1, initial_deposit: initialDeposit }]);
          } else {
            console.error('Error fetching account settings:', error);
          }
          return;
        }
        
        if (data) {
          setInitialDeposit(data.initial_deposit);
          setTempInitialDeposit(data.initial_deposit.toString());
        }
      } catch (error) {
        console.error('Failed to load account settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Fetch trades and calculate total profit/loss
  useEffect(() => {
    const fetchTradesAndCalculateBalance = async () => {
      try {
        setIsLoading(true);
        const { data: trades, error } = await supabase
          .from('trades')
          .select('profit_loss');
        
        if (error) throw error;
        
        const totalProfitLoss = trades.reduce((sum, trade) => 
          sum + (trade.profit_loss || 0), 0);
        
        // Calculate new balance based on initial deposit and P&L
        setCurrentBalance(initialDeposit + totalProfitLoss);
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradesAndCalculateBalance();
  }, [initialDeposit]);

  const percentageChange = initialDeposit > 0 ? 
    ((currentBalance - initialDeposit) / initialDeposit) * 100 : 0;
  const isProfit = percentageChange >= 0;
  
  const handleSaveSettings = async () => {
    const newDeposit = parseFloat(tempInitialDeposit);
    
    if (isNaN(newDeposit)) {
      toast({
        title: "Invalid value",
        description: "Please enter a valid number for initial deposit.",
        variant: "destructive"
      });
      return;
    }
    
    if (newDeposit <= 0) {
      toast({
        title: "Invalid initial deposit",
        description: "Initial deposit must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Save the new initial deposit value to Supabase
      const { error } = await supabase
        .from('account_settings')
        .upsert({ id: 1, initial_deposit: newDeposit });
      
      if (error) throw error;
      
      setInitialDeposit(newDeposit);
      setShowSettings(false);
      
      toast({
        title: "Settings updated",
        description: "Account balance settings have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <Card className="animate-fade-in glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-2xl font-bold">Loading...</div>
          ) : (
            <div className="text-2xl font-bold">${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          )}
          <div className="flex justify-between items-center mt-1 text-sm">
            <span className="text-muted-foreground">Initial: ${initialDeposit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className={cn(
              "font-medium",
              isProfit ? "text-emerald-500" : "text-red-500"
            )}>
              {isProfit ? '+' : ''}{percentageChange.toFixed(2)}%
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Balance Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initial-deposit" className="text-right">Initial Deposit</Label>
              <Input
                id="initial-deposit"
                className="col-span-3"
                type="number"
                step="0.01"
                value={tempInitialDeposit}
                onChange={(e) => setTempInitialDeposit(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveSettings}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountBalanceCard;
