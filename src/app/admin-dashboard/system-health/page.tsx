
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
  Database
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/layout/back-button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


export default function SystemHealthPage() {
  const firestore = useFirestore();
  const appointmentsQuery = useMemoFirebase(() => collection(firestore, 'appointments'), [firestore]);
  const { data: appointments, isLoading: appointmentsLoading } = useCollection(appointmentsQuery);

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
                    <Badge variant={!appointmentsLoading && firestore ? 'default' : 'destructive'} className={!appointmentsLoading && firestore ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {!appointmentsLoading && firestore ? 'Connected' : 'Connecting...'}
                    </Badge>
                     <p className="text-xs text-muted-foreground mt-2">
                        {appointments?.length || 0} appointments loaded.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle />
                        Recent Errors
                    </CardTitle>
                    <CardDescription>
                       A log of recent critical errors across the system (example data).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="p-2 border rounded-md bg-destructive/10">
                        <p className="font-mono text-sm text-destructive">`FirestorePermissionError` at `/users/[userId]`</p>
                        <p className="text-xs text-destructive/80">Count: 42</p>
                    </div>
                     <div className="p-2 border rounded-md">
                        <p className="font-mono text-sm">`TypeError: Cannot read properties of undefined`</p>
                        <p className="text-xs text-muted-foreground">Count: 15</p>
                    </div>
                     <div className="p-2 border rounded-md">
                        <p className="font-mono text-sm">`AuthError: token-expired`</p>
                        <p className="text-xs text-muted-foreground">Count: 8</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
