
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowRight, LayoutDashboard, User, Calendar, Users, FileText, Info, Upload } from 'lucide-react';
import Link from 'next/link';

const dashboardItems = [
    {
        title: 'Dashboard',
        description: 'View your profile and statistics.',
        icon: LayoutDashboard,
        href: '#',
    },
    {
        title: 'Profile',
        description: 'View and edit your professional profile.',
        icon: User,
        href: '#',
    },
    {
        title: 'Appointments',
        description: 'Manage your upcoming appointments.',
        icon: Calendar,
        href: '/doctor-dashboard/appointments', 
    },
    {
        title: 'Patients',
        description: 'Access your patients\' medical history.',
        icon: Users,
        href: '/doctor-dashboard/patients',
    },
    {
        title: 'Prescriptions',
        description: 'Issue and manage prescriptions.',
        icon: FileText,
        href: '#',
    },
    {
        title: 'Medical Info',
        description: 'Provide and manage medical information.',
        icon: Info,
        href: '#',
    },
     {
        title: 'Upload Documents',
        description: 'Upload reports for your patients.',
        icon: Upload,
        href: '#',
    },
];

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
                <h1 className="text-3xl font-bold tracking-tight">Welcome, {userProfile?.firstName || user?.email?.split('@')[0]}</h1>
                <p className="text-muted-foreground">Select an option below to manage your clinic.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                   <Button variant="link" asChild className="mt-4 px-0 text-primary">
                      <Link href={item.href}>
                        Go to {item.title} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
