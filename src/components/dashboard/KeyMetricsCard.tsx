
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, Activity, ArrowUp, ArrowDown } from 'lucide-react';

interface KeyMetric {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  prefix?: string;
  suffix?: string;
  color?: string;
}

interface KeyMetricsCardProps {
  metric: KeyMetric;
}

const KeyMetricsCard: React.FC<KeyMetricsCardProps> = ({ metric }) => {
  const { title, value, icon: Icon, trend, prefix, suffix, color } = metric;

  // Determine text color based on trend direction or specified color
  const getTextColor = () => {
    if (color) return color;
    if (!trend) return '';
    switch (trend.direction) {
      case 'up': return 'text-profit';
      case 'down': return 'text-loss';
      default: return '';
    }
  };

  return (
    <Card className="animate-fade-in glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        {trend && (
          <p className={`text-xs flex items-center mt-1 ${getTextColor()}`}>
            {trend.direction === 'up' ? <ArrowUp className="mr-1 h-3 w-3" /> : 
             trend.direction === 'down' ? <ArrowDown className="mr-1 h-3 w-3" /> : null}
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default KeyMetricsCard;
