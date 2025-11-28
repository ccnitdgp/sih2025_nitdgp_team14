
'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { eachDayOfInterval, format, subDays } from 'date-fns';

const today = new Date();
const last7Days = eachDayOfInterval({
  start: subDays(today, 6),
  end: today,
});

const chartData = last7Days.map((day, i) => ({
  date: format(day, 'MMM d'),
  appointments: 150 + Math.floor(Math.random() * 50) + i * 10,
}));

const chartConfig = {
  appointments: {
    label: 'Appointments',
    color: 'hsl(var(--primary))',
  },
};

export function AppointmentTrendChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <YAxis dataKey="appointments" />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Line
          dataKey="appointments"
          type="monotone"
          stroke="var(--color-appointments)"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}
