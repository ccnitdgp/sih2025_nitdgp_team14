
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { doctor: 'Dr. Sharma', appointments: 55 },
  { doctor: 'Dr. Gupta', appointments: 42 },
  { doctor: 'Dr. Patel', appointments: 78 },
  { doctor: 'Dr. Singh', appointments: 60 },
  { doctor: 'Dr. Kumar', appointments: 35 },
];

const chartConfig = {
  appointments: {
    label: 'Appointments',
    color: 'hsl(var(--chart-2))',
  },
};

export function DoctorLoadChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <YAxis dataKey="appointments" />
        <XAxis
          dataKey="doctor"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="appointments" fill="var(--color-appointments)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
