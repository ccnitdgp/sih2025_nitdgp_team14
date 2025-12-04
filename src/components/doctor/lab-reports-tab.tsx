
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
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function LabReportsTab({ patientId }: { patientId: string }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const healthRecordsQuery = useMemoFirebase(() => {
    if (!patientId || !firestore) return null;
    return query(
      collection(firestore, `users/${patientId}/healthRecords`),
      where('recordType', 'in', ['labReport', 'scanReport'])
    );
  }, [patientId, firestore]);
  
  const { data: healthRecords, isLoading } = useCollection(healthRecordsQuery);

  const handleDownload = async (report: any) => {
    if (!report.details?.downloadUrl || !report.details?.fileName) {
        toast({
            variant: "destructive",
            title: "Download failed",
            description: "The file URL is missing or invalid.",
        });
        return;
    }
    
    try {
        const response = await fetch(report.details.downloadUrl);
        if (!response.ok) throw new Error('Network response was not ok.');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', report.details.fileName);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Download error:", error);
        toast({
            variant: "destructive",
            title: "Download failed",
            description: "Could not download the file. Please try again.",
        });
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
            <CardTitle className="text-2xl">Lab & Scan Reports</CardTitle>
            </div>
            <CardDescription>
                View and manage patient's diagnostic lab and scan reports.
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
        {isLoading ? <SkeletonLoader /> : healthRecords && healthRecords.length > 0 ? (
            healthRecords
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
          !isLoading && <p className="text-muted-foreground text-center py-4">No lab or scan reports uploaded for this patient yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
