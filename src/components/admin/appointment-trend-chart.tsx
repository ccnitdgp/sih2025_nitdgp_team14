
'use client';

import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { eachDayOfInterval, format, subDays, isSameDay, parseISO } from 'date-fns';
import type { DocumentData } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  appointments: {
    label: 'Appointments',
    color: 'hsl(var(--primary))',
  },
};

export function AppointmentTrendChart({ appointments, isLoading }: { appointments: DocumentData[] | null, isLoading: boolean }) {
  
  const chartData = useMemo(() => {
    const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date(),
    });

    if (!appointments) {
        return last7Days.map(day => ({ date: format(day, 'MMM d'), appointments: 0 }));
    }

    return last7Days.map(day => {
        const count = appointments.filter(appt => {
          if (!appt.date || typeof appt.date !== 'string') return false;
          try {
            return isSameDay(parseISO(appt.date), day)
          } catch {
            return false;
          }
        }).length;
        return {
            date: format(day, 'MMM d'),
            appointments: count,
        };
    });
  }, [appointments]);

  if (isLoading) {
    return <Skeleton className="w-full h-[250px]" />;
  }

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
