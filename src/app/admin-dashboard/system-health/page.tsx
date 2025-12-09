
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Server,
  Activity,
  AlertTriangle,
  Clock,
  Mail,
  MessageCircle,
  Database,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/layout/back-button';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { FirebaseError } from '@/types/firebase-errors';
import type { UserProfile } from '@/types/user-profile';

export default function SystemHealthPage() {
  const { firestore, isServicesLoading } = useFirebase();
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'appointments');
  }, [firestore]);
  const { data: appointments, isLoading: appointmentsLoading } = useCollection(appointmentsQuery);
  const errorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'errors');
  }, [firestore]);
  const { data: errors, isLoading: errorsLoading } = useCollection<FirebaseError>(errorsQuery);
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const isConnected = !isServicesLoading && !appointmentsLoading && firestore;
  const complianceData = {
    totalUsers: users?.length || 0,
    acceptedPolicy: users?.filter(u => u.hasAcceptedPrivacyPolicy).length || 0,
    acceptedTos: users?.filter(u => u.hasAcceptedTos).length || 0,
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                System Health &amp; Operations
              </h1>
              <p className="text-muted-foreground">
                Live status of platform services, queues, and error rates.
              </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database />
                        Firestore Status
                    </CardTitle>
                    <CardDescription>
                        Status of connection to the Firestore database.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Badge variant={isConnected ? 'default' : 'destructive'} className={isConnected ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {isConnected ? 'Connected' : 'Connecting...'}
                    </Badge>
                     <p className="text-xs text-muted-foreground mt-2">
                        {appointments?.length || 0} appointments loaded.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck />
                        Security & Compliance
                    </CardTitle>
                    <CardDescription>
                        Live status of user consent and data compliance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {usersLoading ? (
                        <p>Loading compliance data...</p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <p>{complianceData.acceptedPolicy} of {complianceData.totalUsers} users have accepted the privacy policy.</p>
                                <progress value={complianceData.acceptedPolicy} max={complianceData.totalUsers} />
                            </div>
                            <div>
                                <p>{complianceData.acceptedTos} of {complianceData.totalUsers} users have accepted the Terms of Service.</p>
                                <progress value={complianceData.acceptedTos} max={complianceData.totalUsers} />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle />
                        Recent Errors
                    </CardTitle>
                    <CardDescription>
                       A log of recent critical errors across the system.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {errorsLoading ? (
                        <p>Loading errors...</p>
                    ) : errors && errors.length > 0 ? (
                        errors.map((error) => (
                            <div key={error.id} className="p-2 border rounded-md bg-destructive/10">
                                <p className="font-mono text-sm text-destructive">{error.message}</p>
                                <p className="text-xs text-destructive/80">Count: {error.count}</p>
                            </div>
                        ))
                    ) : (
                        <p>No recent errors.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
