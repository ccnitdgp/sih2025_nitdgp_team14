
'use client';

import { Suspense } from 'react';
import { AppointmentTrendChart } from '@/components/admin/appointment-trend-chart';
import { BackButton } from '@/components/layout/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Calendar, TrendingDown } from 'lucide-react';
import dynamic from 'next/dynamic';

const StatCard = dynamic(() => import('@/components/admin/stat-card').then(mod => mod.StatCard), {
  loading: () => <Skeleton className="h-28 w-full" />,
});

const AppointmentTrendChartClient = dynamic(() => import('@/components/admin/appointment-trend-chart').then(mod => mod.AppointmentTrendChart), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function AppointmentsUtilizationClientPage() {
  return (
    <>
      <BackButton />
      <div className="space-y-8 mt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments &amp; Utilization</h1>
          <p className="text-muted-foreground">
            Analytics for appointment scheduling, no-shows, and doctor utilization.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <Suspense fallback={<Skeleton className="h-28 w-full" />}>
            <StatCard
              title="Cancellation Rate"
              value="8%"
              icon={TrendingDown}
              description="Percentage of canceled appointments"
            />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar />
                Appointment Volume
              </CardTitle>
              <CardDescription>Appointment volume over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <AppointmentTrendChartClient />
              </Suspense>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity />
                Peak Hours Heatmap
              </CardTitle>
              <CardDescription>Most popular times for appointments throughout the week.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-64 bg-muted rounded-md">
              <p className="text-muted-foreground">[Peak Hours Heatmap Component Placeholder]</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
