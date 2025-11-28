
'use client';

import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

const chartData = [
  { ageGroup: '0-18', coverage: 275, fill: 'var(--color-a)' },
  { ageGroup: '19-45', coverage: 200, fill: 'var(--color-b)' },
  { ageGroup: '46-60', coverage: 187, fill: 'var(--color-c)' },
  { ageGroup: '60+', coverage: 173, fill: 'var(--color-d)' },
];

const chartConfig = {
  coverage: {
    label: 'Coverage',
  },
  a: {
    label: '0-18 years',
    color: 'hsl(var(--chart-1))',
  },
  b: {
    label: '19-45 years',
    color: 'hsl(var(--chart-2))',
  },
  c: {
    label: '46-60 years',
    color: 'hsl(var(--chart-3))',
  },
  d: {
    label: '60+ years',
    color: 'hsl(var(--chart-4))',
  },
};

export function VaccinationCoverageChart() {
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
          dataKey="coverage"
          nameKey="ageGroup"
          innerRadius={60}
          strokeWidth={5}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          ))}
        </Pie>
        <ChartLegend
            content={<ChartLegendContent nameKey="ageGroup" />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
