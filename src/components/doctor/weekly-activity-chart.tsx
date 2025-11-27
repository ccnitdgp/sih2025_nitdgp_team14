
"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--primary))",
  },
}

export function WeeklyActivityChart() {
  const { user } = useUser();
  const firestore = useFirestore();

  const appointmentsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    
    return query(
        collection(firestore, 'appointments'), 
        where('doctorId', '==', user.uid)
    );
  }, [user, firestore]);

  const { data: appointments } = useCollection(appointmentsQuery);

  const chartData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    if (!appointments) {
        return weekDays.map(day => ({ day: format(day, 'EEEE'), appointments: 0 }));
    }

    return weekDays.map(day => {
        const count = appointments.filter(appt => isSameDay(new Date(appt.date), day)).length;
        return {
            day: format(day, 'EEEE'),
            appointments: count,
        };
    });

  }, [appointments]);

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


    
    