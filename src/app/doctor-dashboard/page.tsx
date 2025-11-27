
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc, collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileText, BriefcaseMedical } from 'lucide-react';
import Link from 'next/link';
import { WeeklyActivityChart } from '@/components/doctor/weekly-activity-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { isToday, parseISO } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, isLoading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? <Skeleton className="h-8 w-12 mt-1" /> : <div className="text-2xl font-bold">{value}</div>}
    </CardContent>
  </Card>
);

export default function DoctorDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const patientsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/patients`);
  }, [user, firestore]);

  const { data: patients, isLoading: arePatientsLoading } = useCollection(patientsCollectionRef);
  
  const appointmentsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !userProfile || userProfile.role !== 'doctor') {
      return null;
    }
    return query(
        collection(firestore, 'appointments'), 
        where('doctorId', '==', user.uid)
    );
  }, [user, firestore, userProfile]);

  const { data: appointments, isLoading: areAppointmentsLoading } = useCollection(appointmentsQuery);

  const upcomingAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(appt => appt.status === 'Scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const todayAppointmentsCount = useMemo(() => {
      if (!upcomingAppointments) return 0;
      return upcomingAppointments.filter(appt => isToday(parseISO(appt.date))).length;
  }, [upcomingAppointments]);

  const totalPatients = patients?.length || 0;

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/doc-dash/200`} />
                <AvatarFallback className="text-2xl">{userProfile?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome, Dr. {userProfile?.lastName || user?.email?.split('@')[0]}</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <BriefcaseMedical className="h-4 w-4" />
                  {userProfile?.specialty || 'General Physician'}
                </p>
              </div>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                    <Link href="/doctor-dashboard/patients">View Patients</Link>
                </Button>
                <Button asChild>
                    <Link href="/doctor-dashboard/appointments">View Appointments</Link>
                </Button>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <StatCard title="Today's Appointments" value={todayAppointmentsCount} icon={Calendar} isLoading={areAppointmentsLoading} />
             <StatCard title="Total Patients" value={totalPatients} icon={Users} isLoading={arePatientsLoading} />
             <StatCard title="Prescriptions Written" value="0" icon={FileText} isLoading={false} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>A look at your appointment numbers for the past 7 days.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <WeeklyActivityChart appointments={appointments} isLoading={areAppointmentsLoading || isProfileLoading} />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your next few scheduled appointments.</CardDescription>
              </CardHeader>
              <CardContent>
                {areAppointmentsLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 3).map(appt => (
                      <div key={appt.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://picsum.photos/seed/${appt.patientId}/200`} alt={appt.patientName} />
                          <AvatarFallback>{appt.patientName?.charAt(0) ?? 'P'}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{appt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(appt.date).toLocaleDateString()}</p>
                        </div>
                        <div className="ml-auto font-medium">{appt.time}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <div className="flex items-center justify-center h-full py-8">
                        <p className="text-muted-foreground">No upcoming appointments.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
