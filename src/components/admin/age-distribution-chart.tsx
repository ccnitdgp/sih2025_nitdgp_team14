
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { ageGroup: '0-10', count: 1200 },
  { ageGroup: '11-20', count: 1850 },
  { ageGroup: '21-30', count: 2200 },
  { ageGroup: '31-40', count: 2500 },
  { ageGroup: '41-50', count: 1500 },
  { ageGroup: '51-60', count: 800 },
  { ageGroup: '60+', count: 450 },
];

const chartConfig = {
  count: {
    label: 'Patients',
    color: 'hsl(var(--chart-3))',
  },
};

export function AgeDistributionChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <YAxis dataKey="count" />
        <XAxis
          dataKey="ageGroup"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          label={{ value: 'Age Group', position: 'insideBottom', offset: -5 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
