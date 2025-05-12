
import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

interface TradingCalendarProps {
  onDateSelect: (date: Date | undefined) => void;
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ onDateSelect }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

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
          classNames={{
            day_selected: "bg-profit text-primary-foreground",
            day_today: "border border-caution text-caution",
          }}
        />
      </CardContent>
    </Card>
  );
};

export default TradingCalendar;
