
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { weeklyActivity } from "@/lib/data"

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--primary))",
  },
}

const chartData = [
  { day: "Sunday", appointments: 0 },
  { day: "Monday", appointments: 0 },
  { day: "Tuesday", appointments: 0 },
  { day: "Wednesday", appointments: 0 },
  { day: "Thursday", appointments: 0 },
  { day: "Friday", appointments: 0 },
  { day: "Saturday", appointments: 0 },
]

export function WeeklyActivityChart() {
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
