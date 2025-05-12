
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CircularChartData {
  title: string;
  value: number;
  total: number;
  suffix?: string;
  colors: {
    positive: string;
    negative: string;
  };
}

interface CircularChartsProps {
  data: CircularChartData;
}

const CircularChart: React.FC<CircularChartsProps> = ({ data }) => {
  const { title, value, total, suffix = '', colors } = data;
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  const chartData = [
    { name: 'Positive', value: percentage },
    { name: 'Negative', value: 100 - percentage },
  ];

  return (
    <Card className="animate-fade-in glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-center">
          <div className="w-28 h-28 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius="70%"
                  outerRadius="100%"
                  paddingAngle={0}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell key="positive" fill={colors.positive} />
                  <Cell key="negative" fill={colors.negative} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold">
                {percentage.toFixed(0)}
                {suffix}
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-center mt-2">
          {value.toLocaleString()} / {total.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default CircularChart;
