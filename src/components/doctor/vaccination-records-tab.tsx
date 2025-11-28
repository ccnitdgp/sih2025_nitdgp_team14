
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShieldCheck, FileDown, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { dummyPdfContent } from '@/lib/dummy-pdf';
import Link from 'next/link';

export function VaccinationRecordsTab({ patientId }: { patientId: string }) {
  const firestore = useFirestore();

  const healthRecordsQuery = useMemoFirebase(() => {
    if (!patientId || !firestore) return null;
    return query(
        collection(firestore, `users/${patientId}/healthRecords`),
        where('recordType', '==', 'vaccinationRecord')
    );
  }, [patientId, firestore]);
  
  const { data: vaccinationRecords, isLoading } = useCollection(healthRecordsQuery);

  const handleDownload = (record: any) => {
    const link = document.createElement('a');
    link.href = dummyPdfContent;
    const fileName = record.details?.fileName || `vaccination-certificate-${record.details.name.replace(/\s+/g, '-')}.pdf`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-9 w-40" />
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6" />
            <CardTitle className="text-2xl">Vaccination Records</CardTitle>
          </div>
          <CardDescription>
            Patient's history of vaccinations and immunizations.
          </CardDescription>
        </div>
        <Button asChild>
            <Link href={`/doctor-dashboard/upload-documents?patientId=${patientId}&type=Vaccination`}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Upload Record
            </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <SkeletonLoader /> : vaccinationRecords && vaccinationRecords.length > 0 ? (
          vaccinationRecords.map((record) => (
            <Card key={record.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{record.details?.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Administered on {record.details?.date} at {record.details?.issuer}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownload(record)}>
                <FileDown className="mr-2 h-4 w-4" />
                Download Certificate
              </Button>
            </Card>
          ))
        ) : (
          !isLoading && <p className="text-muted-foreground text-center py-4">No vaccination records found for this patient.</p>
        )}
      </CardContent>
    </Card>
  );
}
