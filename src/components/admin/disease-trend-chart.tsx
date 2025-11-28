
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

const chartData = last7Days.map((day) => ({
  date: format(day, 'MMM d'),
  influenza: 50 + Math.floor(Math.random() * 50),
}));

const chartConfig = {
  influenza: {
    label: 'Influenza Cases',
    color: 'hsl(var(--primary))',
  },
};

export function DiseaseTrendChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <YAxis dataKey="influenza" />
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
          dataKey="influenza"
          type="monotone"
          stroke="var(--color-influenza)"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}
