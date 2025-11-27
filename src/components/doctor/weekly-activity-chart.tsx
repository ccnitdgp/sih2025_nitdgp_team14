
"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, where, doc } from "firebase/firestore"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "../ui/skeleton"

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--primary))",
  },
}

export function WeeklyActivityChart() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const appointmentsQuery = useMemoFirebase(() => {
    // CRITICAL FIX: Do not create the query until we have the user, firestore,
    // and have confirmed the user's role is 'doctor'.
    if (!user || !firestore || !userProfile || userProfile.role !== 'doctor') {
      return null;
    }
    
    return query(
        collection(firestore, 'appointments'), 
        where('doctorId', '==', user.uid)
    );
  }, [user, firestore, userProfile]);

  const { data: appointments, isLoading: areAppointmentsLoading } = useCollection(appointmentsQuery);

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
          // Ensure appt.date is valid before creating a new Date
          if (!appt.date || typeof appt.date !== 'string') return false;
          try {
            return isSameDay(new Date(appt.date), day)
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

  // Show skeleton if the profile or the appointments are loading.
  if (isProfileLoading || areAppointmentsLoading) {
      return <Skeleton className="h-[250px] w-full" />;
  }
  
  // Also show skeleton if the query is not ready to run yet
  if (!appointmentsQuery) {
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
