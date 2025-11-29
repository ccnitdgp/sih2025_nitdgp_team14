
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
  TrendingUp,
  Users,
  Syringe,
  Calendar,
  User,
  Activity,
  FileDown,
  Tent,
  BriefcaseMedical,
  FileText,
  ShieldAlert,
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
import { getMonth, getYear, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  isLoading: boolean;
};

const StatCard = ({ title, value, icon: Icon, description, isLoading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{value}</div>}
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const patientsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), where('role', '==', 'patient')) : null),
    [firestore]
  );
  const doctorsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), where('role', '==', 'doctor')) : null),
    [firestore]
  );
  const appointmentsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'appointments') : null),
    [firestore]
  );
  const vaccinationsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'vaccinationRegistrations') : null),
    [firestore]
  );
  const prescriptionsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'prescriptions') : null),
    [firestore]
  );

  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection(doctorsQuery);
  const { data: appointments, isLoading: isLoadingAppointments } = useCollection(appointmentsQuery);
  const { data: vaccinations, isLoading: isLoadingVaccinations } = useCollection(vaccinationsQuery);
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useCollection(prescriptionsQuery);


  const thisMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);

    const appointmentsThisMonth = appointments?.filter(appt => {
      const apptDate = parseISO(appt.date);
      return getMonth(apptDate) === currentMonth && getYear(apptDate) === currentYear;
    }).length || 0;

    const vaccinationsThisMonth = vaccinations?.filter(vac => {
      const vacDate = vac.registeredAt?.toDate();
      if (!vacDate) return false;
      return getMonth(vacDate) === currentMonth && getYear(vacDate) === currentYear;
    }).length || 0;

    return { appointmentsThisMonth, vaccinationsThisMonth };
  }, [appointments, vaccinations]);

  function handleExport() {
    const headers = 'Category,Value,Description\n';
    const rows = [
      `Total Patients,${patients?.length || 0},`,
      `Appointments (This Month),${thisMonthStats.appointmentsThisMonth},`,
      `Vaccinations (This Month),${thisMonthStats.vaccinationsThisMonth},`,
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
            <Button onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Patients"
              value={patients?.length.toLocaleString() || '0'}
              icon={Users}
              description="Total registered patients"
              isLoading={isLoadingPatients}
            />
            <StatCard
              title="Total Doctors"
              value={doctors?.length.toLocaleString() || '0'}
              icon={BriefcaseMedical}
              description="Total verified doctors"
              isLoading={isLoadingDoctors}
            />
            <StatCard
              title="Appointments (This Month)"
              value={thisMonthStats.appointmentsThisMonth.toLocaleString()}
              icon={Calendar}
              description="Scheduled this calendar month"
              isLoading={isLoadingAppointments}
            />
             <StatCard
              title="Prescriptions Written"
              value={prescriptions?.length.toLocaleString() || '0'}
              icon={FileText}
              description="Total prescriptions issued"
              isLoading={isLoadingPrescriptions}
            />
          </div>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <StatCard
              title="Vaccinations (This Month)"
              value={thisMonthStats.vaccinationsThisMonth.toLocaleString()}
              icon={Syringe}
              description="Registered this calendar month"
              isLoading={isLoadingVaccinations}
            />
             <StatCard
              title="Active Outbreak Signals"
              value="2"
              icon={TrendingUp}
              description="Flu & Dengue in Sector-15"
              isLoading={false}
            />
             <StatCard
              title="Critical Health Alerts"
              value="5"
              icon={ShieldAlert}
              description="Abnormal lab reports today"
              isLoading={false}
            />
             <StatCard
              title="System Status"
              value="99.9% Uptime"
              icon={Activity}
              description="No incidents reported"
              isLoading={false}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users />
                  User Management
                </CardTitle>
                <CardDescription>
                  View and manage patient & doctor accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled>Manage Users</Button>
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
