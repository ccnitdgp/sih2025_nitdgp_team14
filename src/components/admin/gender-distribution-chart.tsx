'use client';

import { useMemo } from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { DocumentData } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  count: {
    label: 'Patients',
  },
  Male: {
    label: 'Male',
    color: 'hsl(var(--chart-1))',
  },
  Female: {
    label: 'Female',
    color: 'hsl(var(--chart-2))',
  },
  Other: {
    label: 'Other',
    color: 'hsl(var(--chart-3))',
  },
};

export function GenderDistributionChart({ patients, isLoading }: { patients: DocumentData[] | null, isLoading: boolean }) {
  const chartData = useMemo(() => {
    const genderCounts = {
      'Male': 0,
      'Female': 0,
      'Other': 0,
    };

    if (patients) {
      patients.forEach(patient => {
        const gender = patient.gender;
        if (gender === 'Male' || gender === 'Female') {
          genderCounts[gender]++;
        } else if (gender) {
          genderCounts['Other']++;
        }
      });
    }

    return Object.entries(genderCounts).map(([gender, count]) => ({
      gender,
      count,
      fill: `var(--color-${gender})`,
    }));
  }, [patients]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-[250px] w-full"><Skeleton className="h-[250px] w-[250px] rounded-full" /></div>;
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="gender"
          innerRadius={60}
          strokeWidth={5}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.gender}
              fill={entry.fill}
            />
          ))}
        </Pie>
        <ChartLegend
            content={<ChartLegendContent nameKey="gender" />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
