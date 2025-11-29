
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Activity,
  BriefcaseMedical,
  ShieldAlert,
  Calendar,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/back-button';
import { getMonth, getYear, parseISO } from 'date-fns';
import { DashboardFilters } from '@/components/admin/dashboard-filters';


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

export default function KpiCardsPage() {
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
  const prescriptionsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'prescriptions') : null),
    [firestore]
  );

  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection(doctorsQuery);
  const { data: appointments, isLoading: isLoadingAppointments } = useCollection(appointmentsQuery);
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useCollection(prescriptionsQuery);


  const appointmentsThisMonth = useMemo(() => {
    if (!appointments) return 0;
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);

    return appointments?.filter(appt => {
      const apptDate = parseISO(appt.date);
      return getMonth(apptDate) === currentMonth && getYear(apptDate) === currentYear;
    }).length || 0;
  }, [appointments]);


  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Key Performance Indicators
              </h1>
              <p className="text-muted-foreground">
                A high-level overview of the platform's core metrics.
              </p>
            </div>
            
            <DashboardFilters />

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
                    value={appointmentsThisMonth.toLocaleString()}
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
        </div>
      </div>
    </div>
  );
}
