
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileText, BriefcaseMedical } from 'lucide-react';
import Link from 'next/link';
import { WeeklyActivityChart } from '@/components/doctor/weekly-activity-chart';
import { doctorUpcomingAppointments } from '@/lib/data';

const StatCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
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

  const { data: userProfile } = useDoc(userDocRef);

  const patientsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/patients`);
  }, [user, firestore]);

  const { data: patients } = useCollection(patientsCollectionRef);

  const totalPatients = patients?.length || 0;
  const todayAppointments = doctorUpcomingAppointments.filter(appt => new Date(appt.date).toDateString() === new Date().toDateString()).length;

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
                  General Physician
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
             <StatCard title="Today's Appointments" value={todayAppointments} icon={Calendar} />
             <StatCard title="Total Patients" value={totalPatients} icon={Users} />
             <StatCard title="Prescriptions Written" value="0" icon={FileText} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>A look at your appointment numbers for the past 7 days.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <WeeklyActivityChart />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your next few appointments for today.</CardDescription>
              </CardHeader>
              <CardContent>
                {doctorUpcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {doctorUpcomingAppointments.slice(0, 3).map(appt => (
                      <div key={appt.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={appt.patientAvatar} alt={appt.patientName} />
                          <AvatarFallback>{appt.patientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{appt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{appt.reason}</p>
                        </div>
                        <div className="ml-auto font-medium">{appt.time}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <div className="flex items-center justify-center h-full py-8">
                        <p className="text-muted-foreground">No more appointments today.</p>
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
