
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';
import Link from 'next/link';

export default function DoctorDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

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
                <CardTitle>Doctor Dashboard</CardTitle>
                <CardDescription>Manage your patients and appointments from here.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>You can add new patients or manage your schedule.</p>
                 <Button asChild variant="outline" className="mt-4">
                    <Link href="/appointments">
                        View Appointments
                    </Link>
                </Button>
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
