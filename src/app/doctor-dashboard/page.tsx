
'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DoctorDashboardPage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.photoURL ?? ''} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome, Dr. {user?.displayName || user?.email}</h1>
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
