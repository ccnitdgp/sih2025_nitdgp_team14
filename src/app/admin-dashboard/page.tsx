
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Users,
  FileDown,
  Tent,
  BarChart,
  Clock,
  Heart,
  Activity,
  Syringe,
  User,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiseaseTrendChart } from '@/components/admin/disease-trend-chart';
import { AppointmentTrendChart } from '@/components/admin/appointment-trend-chart';
import { VaccinationCoverageChart } from '@/components/admin/vaccination-coverage-chart';
import { DoctorLoadChart } from '@/components/admin/doctor-load-chart';
import { AgeDistributionChart } from '@/components/admin/age-distribution-chart';
import { OutbreakHeatmap } from '@/components/admin/outbreak-heatmap';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const patientsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), where('role', '==', 'patient')) : null),
    [firestore]
  );
 
  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);

  function handleExport() {
    const headers = 'Category,Value,Description\n';
    const rows = [
      `Total Patients,${patients?.length || 0},`,
      'Active Outbreak Signals,2,Flu & Dengue in Sector-15',
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'public_health_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Aggregated public health insights and operational statistics.
              </p>
            </div>
            <Button onClick={handleExport} disabled={isLoadingPatients}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart />
                  KPI Cards
                </CardTitle>
                <CardDescription>
                  View key performance indicators for the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin-dashboard/kpi-cards">
                    View KPIs
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock />
                  Appointments
                </CardTitle>
                <CardDescription>
                  Analyze appointment volume and utilization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin-dashboard/appointments-utilization">
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart />
                  Patient & Disease
                </CardTitle>
                <CardDescription>
                  View patient demographics and disease trends.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin-dashboard/patient-disease-insights">
                    View Insights
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tent />
                  Camps & Drives
                </CardTitle>
                <CardDescription>
                  Manage health camps and vaccination drives.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="flex flex-col space-y-2">
                    <Button asChild size="sm">
                    <Link href="/admin-dashboard/health-camps">
                        Manage Camps
                    </Link>
                    </Button>
                     <Button asChild size="sm" variant="outline">
                    <Link href="/admin-dashboard/vaccination-drives">
                        Manage Drives
                    </Link>
                    </Button>
                 </div>
              </CardContent>
            </Card>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity />
                  Disease &amp; Symptom Trends
                </CardTitle>
                <CardDescription>
                  Reported cases of Influenza over the last 7 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DiseaseTrendChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar />
                  Appointment Volume
                </CardTitle>
                <CardDescription>
                  Appointment volume over the last 7 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentTrendChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Syringe />
                  Vaccination Coverage
                </CardTitle>
                <CardDescription>
                  Total vaccination coverage by age group.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <VaccinationCoverageChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users />
                  Patient Demographics
                </CardTitle>
                <CardDescription>
                  Age distribution of registered patients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgeDistributionChart patients={patients} isLoading={isLoadingPatients}/>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User />
                  Doctor Workload
                </CardTitle>
                <CardDescription>
                  Appointments handled per doctor this week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DoctorLoadChart />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Outbreak Heatmap</CardTitle>
                <CardDescription>
                  Geographic distribution of recent flu cases.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OutbreakHeatmap />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
