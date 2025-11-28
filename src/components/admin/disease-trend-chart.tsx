
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { disease: 'Flu', cases: 340 },
  { disease: 'Dengue', cases: 180 },
  { disease: 'Typhoid', cases: 110 },
  { disease: 'Pneumonia', cases: 95 },
  { disease: 'Malaria', cases: 80 },
];

const chartConfig = {
  cases: {
    label: 'Cases',
    color: 'hsl(var(--primary))',
  },
};

export function DiseaseTrendChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <YAxis dataKey="cases" />
        <XAxis
          dataKey="disease"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="cases" fill="var(--color-cases)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
