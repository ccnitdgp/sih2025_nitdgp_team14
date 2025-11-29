
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
  Heart,
  Syringe,
  User,
  Shield,
  FlaskConical,
  GanttChart,
  Wallet,
  Activity,
  Server,
  Calendar,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  FileText,
  BriefcaseMedical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OutbreakHeatmap } from '@/components/admin/outbreak-heatmap';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DiseaseTrendChart } from '@/components/admin/disease-trend-chart';

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const patientsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), where('role', '==', 'patient')) : null),
    [firestore]
  );
  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);

  const unverifiedDoctorsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'doctors'), where('isVerified', '==', false)) : null),
    [firestore]
  );
  const { data: unverifiedDoctors, isLoading: isLoadingDoctors } = useCollection(unverifiedDoctorsQuery);
  
  const doctorsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'doctors')) : null),
    [firestore]
  );
  const { data: doctors, isLoading: isLoadingTotalDoctors } = useCollection(doctorsQuery);

  const appointmentsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'appointments') : null),
    [firestore]
  );
  const { data: appointments, isLoading: isLoadingAppointments } = useCollection(appointmentsQuery);
  
  const prescriptionsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'prescriptions') : null),
    [firestore]
  );
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useCollection(prescriptionsQuery);


  function handleExport() {
    const headers = 'Category,Value,Description\n';
    const rows = [
      `Total Patients,${patients?.length || 0},Total registered patients on the platform`,
      `Total Doctors,${doctors?.length || 0},Total doctors on the platform`,
      `Unverified Doctors,${unverifiedDoctors?.length || 0},Doctors awaiting profile verification`,
      `Total Appointments,${appointments?.length || 0},Total appointments scheduled all-time`,
      `Total Prescriptions,${prescriptions?.length || 0},Total prescriptions written all-time`,
      'Active Outbreak Signals,2,Flu & Dengue in Sector-15 (Static Example)',
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'swasthya_platform_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const alerts = useMemo(() => {
    const dynamicAlerts = [];
    
    if (unverifiedDoctors && unverifiedDoctors.length > 0) {
        dynamicAlerts.push({
            title: `${unverifiedDoctors.length} Unverified Doctor(s)`,
            description: "New doctor profiles are awaiting verification.",
            actionText: "Verify Now",
            href: "/doctor-dashboard/profile",
            icon: UserCheck
        });
    }

    // Static alerts for demonstration
    const staticAlerts = [
      {
          title: "High No-Show Rate for Dr. Patel",
          description: "Dr. Patel's no-show rate is 15% this week.",
          actionText: "View Appointments",
          href: "/admin-dashboard/appointments-utilization",
          icon: Calendar
      },
      {
          title: "Vaccination Drive is below target",
          description: "The 'COVID-19 Booster' drive is at 45% of its target.",
          actionText: "View Performance",
          href: "/admin-dashboard/vaccination-preventive-care",
          icon: Syringe
      },
    ];

    return [...dynamicAlerts, ...staticAlerts];
  }, [unverifiedDoctors]);

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
            <Button onClick={handleExport} disabled={isLoadingPatients || isLoadingTotalDoctors || isLoadingAppointments || isLoadingPrescriptions}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive"/>
                    Actionable Alerts
                </CardTitle>
                <CardDescription>
                    Key items that require your attention.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoadingDoctors ? (
                  <Skeleton className="h-24 w-full" />
                ) : alerts.length > 0 ? (
                    alerts.map((alert, index) => (
                        <Alert key={index} variant="destructive" className="bg-destructive/5 dark:bg-destructive/10 border-destructive/20 text-destructive">
                            <alert.icon className="h-4 w-4" />
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <AlertTitle className="text-destructive">{alert.title}</AlertTitle>
                                    <AlertDescription className="text-destructive/80">
                                    {alert.description}
                                    </AlertDescription>
                                </div>
                                <Button asChild variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                                    <Link href={alert.href}>{alert.actionText} <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                </Button>
                            </div>
                        </Alert>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No alerts at this time.</p>
                )}
            </CardContent>
          </Card>

          <div className="space-y-4">
             <h2 className="text-2xl font-bold tracking-tight">Quick Actions & Analytics</h2>
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
                    <Calendar />
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
                    Patient &amp; Disease
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
                    <Shield />
                    Preventive Care
                    </CardTitle>
                    <CardDescription>
                    Vaccination coverage and drive performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                    <Link href="/admin-dashboard/vaccination-preventive-care">
                        View Analytics
                    </Link>
                    </Button>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                    <FlaskConical />
                    Labs &amp; Reports
                    </CardTitle>
                    <CardDescription>
                    Turnaround times and abnormal result rates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                    <Link href="/admin-dashboard/labs-reports">
                        View Analytics
                    </Link>
                    </Button>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                    <Wallet />
                    Billing &amp; Financials
                    </CardTitle>
                    <CardDescription>
                        Revenue, dues, and financial performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                    <Link href="/admin-dashboard/billing-financial">
                        View Financials
                    </Link>
                    </Button>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                    <GanttChart />
                    Security &amp; Compliance
                    </CardTitle>
                    <CardDescription>
                        Monitor login activity and access logs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                    <Link href="/admin-dashboard/security-compliance">
                        View Security
                    </Link>
                    </Button>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                    <Server />
                    System Health
                    </CardTitle>
                    <CardDescription>
                        API status, queue sizes, and error logs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                    <Link href="/admin-dashboard/system-health">
                        View Health
                    </Link>
                    </Button>
                </CardContent>
                </Card>

                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                    <Syringe />
                    Manage Drives
                    </CardTitle>
                    <CardDescription>
                    Add, edit, or remove vaccination drives.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                    <Link href="/admin-dashboard/vaccination-drives">
                        Go to Drives
                    </Link>
                    </Button>
                </CardContent>
                </Card>

                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                    <Tent />
                    Manage Camps
                    </CardTitle>
                    <CardDescription>
                    Add, edit, or remove health camps.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                    <Link href="/admin-dashboard/health-camps">
                        Go to Camps
                    </Link>
                    </Button>
                </CardContent>
                </Card>
            </div>
           </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
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
          </div>
        </div>
      </div>
    </div>
  );
}
