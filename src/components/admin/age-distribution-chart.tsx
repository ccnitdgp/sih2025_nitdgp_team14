
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { DocumentData } from 'firebase/firestore';
import { differenceInYears, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  count: {
    label: 'Patients',
    color: 'hsl(var(--chart-3))',
  },
};

const getAge = (dob: any) => {
  if (!dob) return null;
  // Firestore timestamps can be objects with seconds, or JS Date objects
  const date = dob.toDate ? dob.toDate() : parseISO(dob);
  try {
    return differenceInYears(new Date(), date);
  } catch (e) {
    return null;
  }
};

export function AgeDistributionChart({ patients, isLoading }: { patients: DocumentData[] | null, isLoading: boolean }) {
  const chartData = useMemo(() => {
    const ageGroups = {
      '0-18': 0,
      '19-30': 0,
      '31-45': 0,
      '46-60': 0,
      '60+': 0,
    };

    if (patients) {
      patients.forEach(patient => {
        const age = getAge(patient.dateOfBirth);
        if (age === null) return;

        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 30) ageGroups['19-30']++;
        else if (age <= 45) ageGroups['31-45']++;
        else if (age <= 60) ageGroups['46-60']++;
        else ageGroups['60+']++;
      });
    }

    return Object.entries(ageGroups).map(([ageGroup, count]) => ({ ageGroup, count }));
  }, [patients]);
  
  if (isLoading) {
    return <Skeleton className="w-full h-[250px]" />;
  }

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
