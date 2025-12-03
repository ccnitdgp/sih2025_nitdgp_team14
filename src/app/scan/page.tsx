
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Button } from '@/components/ui/button';

export default function ScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!patientId) {
      router.replace('/');
      return;
    }

    if (!isUserLoading && user) {
        // User is logged in, redirect them to the patients page with the ID
        router.replace(`/doctor-dashboard/patients?patientId=${patientId}`);
    }

  }, [patientId, user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Redirecting to patient record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted p-4">
        <Card className="max-w-md w-full">
            <CardHeader>
                <CardTitle>Doctor Login Required</CardTitle>
                <CardDescription>
                    To view the patient's record for ID <span className="font-mono font-bold">{patientId}</span>, please log in to your doctor account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AuthDialog 
                    trigger={<Button className="w-full">Login as Doctor</Button>}
                    defaultTab="login"
                />
            </CardContent>
        </Card>
    </div>
  );
}
