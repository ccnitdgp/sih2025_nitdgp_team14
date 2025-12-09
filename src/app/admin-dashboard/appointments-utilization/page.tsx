
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

export default function AppointmentsUtilizationPage() {
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
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
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
                  <AppointmentTrendChart appointments={appointments} isLoading={isLoadingAppointments} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
