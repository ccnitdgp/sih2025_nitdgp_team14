
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FlaskConical, PlusCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function LabReportsTab({ patientId }: { patientId: string }) {
  const firestore = useFirestore();

  const labReportsRef = useMemoFirebase(() => {
    if (!patientId || !firestore) return null;
    return collection(firestore, `users/${patientId}/healthRecords`);
  }, [patientId, firestore]);
  
  const { data: labReports, isLoading } = useCollection(labReportsRef);

  const handleDownload = (report: any) => {
    if (report.details?.downloadUrl) {
      window.open(report.details.downloadUrl, '_blank');
    }
  };

  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-9 w-28" />
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
         <div>
            <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6" />
            <CardTitle className="text-2xl">Lab Reports</CardTitle>
            </div>
            <CardDescription>
                View and manage patient's diagnostic lab reports.
            </CardDescription>
        </div>
        <Button asChild>
            <Link href={`/doctor-dashboard/upload-documents?patientId=${patientId}`}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Upload Report
            </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <SkeletonLoader /> : labReports && labReports.length > 0 ? (
            labReports
              .filter(report => report.recordType === 'labReport' || report.recordType === 'scanReport')
              .map((report) => (
              <Card key={report.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex-1">
                      <h3 className="font-semibold text-lg">{report.details.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                          Date: {report.details.date} - Issued by: {report.details.issuer}
                      </p>
                  </div>
                   <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                      <FileDown className="mr-2 h-4 w-4"/>
                      Download
                  </Button>
              </Card>
            ))
        ) : (
          !isLoading && <p className="text-muted-foreground text-center py-4">No lab reports uploaded for this patient yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
