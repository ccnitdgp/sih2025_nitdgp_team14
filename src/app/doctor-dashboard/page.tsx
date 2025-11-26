
'use client';

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

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
    return collection(firestore, 'users', user.uid, 'patients');
  }, [user, firestore]);

  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsCollectionRef);

  const PatientListSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );


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
                <h1 className="text-3xl font-bold tracking-tight">Welcome, Dr. {userProfile?.lastName || user?.email}</h1>
                <p className="text-muted-foreground">Here’s your dashboard to manage your activities.</p>
              </div>
            </div>
            <Button asChild>
                <Link href="/doctor-dashboard/add-patient">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add New Patient
                </Link>
            </Button>
          </div>
          
           <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>My Patients</CardTitle>
              </div>
              <CardDescription>View and manage your assigned patients.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingPatients ? (
                  <PatientListSkeleton />
                ) : patients && patients.length > 0 ? (
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <Link key={patient.id} href={`/doctor-dashboard/patient/${patient.patientId}`} className="block">
                        <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://picsum.photos/seed/${patient.patientId}/200`} />
                             <AvatarFallback>{patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
                            <p className="text-sm text-muted-foreground">{patient.email}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You have no patients assigned yet.</p>
                     <Button asChild variant="link" className="mt-2">
                        <Link href="/doctor-dashboard/add-patient">
                            Add your first patient
                        </Link>
                    </Button>
                  </div>
                )}
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
