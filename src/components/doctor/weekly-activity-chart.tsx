
"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "../ui/skeleton";
import type { DocumentData } from "firebase/firestore";

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--primary))",
  },
}

export function WeeklyActivityChart({ appointments, isLoading }: { appointments: DocumentData[] | null, isLoading: boolean }) {
  const chartData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    if (!appointments) {
        return weekDays.map(day => ({ day: format(day, 'EEEE'), appointments: 0 }));
    }

    return weekDays.map(day => {
        const count = appointments.filter(appt => {
          if (!appt.date || typeof appt.date !== 'string') return false;
          try {
            // Use parseISO which is more robust for 'YYYY-MM-DD' strings
            return isSameDay(parseISO(appt.date), day)
          } catch {
            return false;
          }
        }).length;
        return {
            day: format(day, 'EEEE'),
            appointments: count,
        };
    });

  }, [appointments]);

  if (isLoading) {
      return <Skeleton className="h-[250px] w-full" />;
  }
  
  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="appointments" fill="var(--color-appointments)" radius={4} />
        </BarChart>
      </ChartContainer>
  )
}
