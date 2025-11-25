
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookUser, FileDown, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrescriptionsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const prescriptionsRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      // In a real app, prescriptions might be their own subcollection.
      // Here, we'll filter the healthRecords collection.
      return collection(firestore, `users/${user.uid}/healthRecords`);
  }, [user, firestore]);
  
  // This is a simplified query. In a real app, you would filter by recordType.
  const { data: prescriptions, isLoading } = useCollection(prescriptionsRef);

  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-9 w-28" />
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <div className="flex items-center gap-3">
            <BookUser className="h-6 w-6" />
            <CardTitle className="text-2xl">Prescriptions</CardTitle>
            </div>
            <CardDescription>
            Your prescribed medications and their details.
            </CardDescription>
        </div>
        <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Add Prescription
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <SkeletonLoader /> : prescriptions && prescriptions.length > 0 ? (
          prescriptions
            .filter(item => item.recordType === 'prescription')
            .map((item) => (
            <Card key={item.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg">{item.details?.medication}</h3>
                        <Badge variant={item.details?.status === 'Active' ? 'default' : 'secondary'}>{item.details?.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {item.details?.dosage} - Prescribed by {item.details?.doctor} on {item.details?.date}
                    </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                    <FileDown className="mr-2 h-4 w-4"/>
                    Download
                </Button>
            </Card>
        ))) : (
          !isLoading && <p className="text-muted-foreground text-center py-4">No prescriptions recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
