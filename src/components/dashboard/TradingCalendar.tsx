
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import type { Trade } from '@/components/trades/types/TradeTypes';

interface TradingCalendarProps {
  onDateSelect: (date: Date | undefined) => void;
}

interface DayStatus {
  date: string;
  isProfitable: boolean;
  totalProfitLoss: number;
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ onDateSelect }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [tradingDays, setTradingDays] = useState<DayStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch trading data for all days with trades
  useEffect(() => {
    const fetchTradingDays = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('entry_date, exit_date, profit_loss');
          
        if (error) {
          console.error('Error fetching trades:', error);
          return;
        }

        // Process trades to determine profit/loss for each day
        const tradesByDay: { [key: string]: number } = {};
        
        if (data) {
          data.forEach(trade => {
            // Use exit date for calculating the day's profitability
            // If no exit date (open position), use entry date
            const dateToUse = trade.exit_date || trade.entry_date;
            const dayKey = dateToUse.split('T')[0]; // Get just the date part
            
            if (!tradesByDay[dayKey]) {
              tradesByDay[dayKey] = 0;
            }
            
            tradesByDay[dayKey] += (trade.profit_loss || 0);
          });
        }
        
        // Convert to array of day statuses
        const daysArray: DayStatus[] = Object.entries(tradesByDay).map(([date, profitLoss]) => ({
          date,
          isProfitable: profitLoss > 0,
          totalProfitLoss: profitLoss
        }));
        
        setTradingDays(daysArray);
      } catch (error) {
        console.error('Error processing trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradingDays();
  }, []);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onDateSelect(selectedDate);
  };

  const nextMonth = () => {
    setMonth(addMonths(month, 1));
  };

  const prevMonth = () => {
    setMonth(subMonths(month, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setMonth(today);
    handleSelect(today);
  };

  // Function to determine day class names based on trading data
  const getDayClassName = (day: Date | undefined) => {
    if (!day) return "";
    
    const dayString = format(day, 'yyyy-MM-dd');
    const dayData = tradingDays.find(d => d.date === dayString);
    
    if (dayData) {
      return dayData.isProfitable ? "day-profitable" : "day-loss";
    }
    
    return "";
  };

  return (
    <Card className="animate-fade-in glass-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">
            Trading Calendar
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="text-xs flex items-center gap-1"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-medium">
            {format(month, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          className="p-0 pointer-events-auto"
          modifiersClassNames={{
            day_profitable: "bg-profit text-primary-foreground",
            day_loss: "bg-loss text-primary-foreground"
          }}
          modifiers={{
            day_profitable: (day) => {
              const dayString = format(day, 'yyyy-MM-dd');
              const dayData = tradingDays.find(d => d.date === dayString);
              return !!dayData && dayData.isProfitable;
            },
            day_loss: (day) => {
              const dayString = format(day, 'yyyy-MM-dd');
              const dayData = tradingDays.find(d => d.date === dayString);
              return !!dayData && !dayData.isProfitable;
            }
          }}
          classNames={{
            day_selected: "bg-primary text-primary-foreground",
            day_today: "border border-caution text-caution",
          }}
        />
      </CardContent>
    </Card>
  );
};

export default TradingCalendar;
