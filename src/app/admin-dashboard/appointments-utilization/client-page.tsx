
'use client';

import { Suspense, useMemo } from 'react';
import { AppointmentTrendChart } from '@/components/admin/appointment-trend-chart';
import { BackButton } from '@/components/layout/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Calendar, TrendingDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

const StatCard = dynamic(() => import('@/components/admin/stat-card').then(mod => mod.StatCard), {
  loading: () => <Skeleton className="h-28 w-full" />,
});

const AppointmentTrendChartClient = dynamic(() => import('@/components/admin/appointment-trend-chart').then(mod => mod.AppointmentTrendChart), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function AppointmentsUtilizationClientPage() {
  const firestore = useFirestore();
  const appointmentsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'appointments') : null),
    [firestore]
  );
  const { data: appointments, isLoading: isLoadingAppointments } = useCollection(appointmentsQuery);

  const cancellationRate = useMemo(() => {
    if (!appointments || appointments.length === 0) return "0%";
    const canceledCount = appointments.filter(a => a.status === 'Canceled').length;
    const rate = (canceledCount / appointments.length) * 100;
    return `${rate.toFixed(1)}%`;
  }, [appointments]);


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
              value={cancellationRate}
              icon={TrendingDown}
              description="Percentage of canceled appointments"
              isLoading={isLoadingAppointments}
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
                <AppointmentTrendChartClient appointments={appointments} isLoading={isLoadingAppointments} />
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
