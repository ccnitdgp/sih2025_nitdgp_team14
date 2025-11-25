
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc } from 'firebase/firestore';

export default function DoctorDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.photoURL ?? ''} />
            <AvatarFallback>{userProfile?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome, Dr. {userProfile?.firstName || user?.email}</h1>
            <p className="text-muted-foreground">This is your doctor dashboard.</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Doctor Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Here you can manage your appointments and patient records.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
