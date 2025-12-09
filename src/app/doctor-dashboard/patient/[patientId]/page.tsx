
'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientProfileTab } from '@/components/doctor/patient-profile-tab';
import { MedicalHistoryTab } from '@/components/doctor/medical-history-tab';
import { MedicalDetailsTab } from '@/components/doctor/medical-details-tab';
import { PrescriptionsTab } from '@/components/doctor/prescriptions-tab';
import { LabReportsTab } from '@/components/doctor/lab-reports-tab';
import { VaccinationRecordsTab } from '@/components/doctor/vaccination-records-tab';
import { ArrowLeft, Bot, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { summarizeMedicalHistory } from '@/ai/flows/summarize-medical-history-flow';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';


export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const patientDocRef = useMemoFirebase(() => {
    if (!patientId || !firestore) return null;
    return doc(firestore, 'users', patientId);
  }, [patientId, firestore]);

  const { data: patientProfile, isLoading: isProfileLoading } = useDoc(patientDocRef);

  const healthRecordsQuery = useMemoFirebase(() => {
    if (!patientId || !firestore) return null;
    return query(
      collection(firestore, `users/${patientId}/healthRecords`)
    );
  }, [patientId, firestore]);

  const { data: healthRecords, isLoading: isHistoryLoading } = useCollection(healthRecordsQuery);

  const handleSummarize = async () => {
    if (!healthRecords || healthRecords.length === 0) {
      toast({
        variant: 'destructive',
        title: "No History Found",
        description: "There is no medical history to summarize for this patient.",
      });
      return;
    }
    setIsSummarizing(true);
    setSummary(null);
    try {
      const notes = healthRecords.filter(r => r.recordType === 'medicalHistory').map(item => item.details).join('\n');
      if (!notes) {
          toast({ variant: 'destructive', title: "No notes to summarize."});
          setIsSummarizing(false);
          return;
      }
      const result = await summarizeMedicalHistory({ medicalNotes: notes });
      setSummary(result.summary);
    } catch (error) {
      console.error("Error summarizing medical history:", error);
      toast({
        variant: "destructive",
        title: "Summarization Failed",
        description: "Could not generate medical summary at this time.",
      });
    } finally {
      setIsSummarizing(false);
    }
  };


  const PatientHeaderSkeleton = () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
    </div>
  );

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-8">
            <Button variant="ghost" asChild className="mb-4 -ml-4">
                <Link href="/doctor-dashboard/patients">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Patient Search
                </Link>
            </Button>
          {isProfileLoading ? (
            <PatientHeaderSkeleton />
          ) : patientProfile ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarImage src={`https://picsum.photos/seed/${patientId}/200`} />
                        <AvatarFallback className="text-2xl">
                        {patientProfile.firstName?.charAt(0)}
                        {patientProfile.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{patientProfile.firstName} {patientProfile.lastName}</h1>
                        <p className="text-muted-foreground">{patientProfile.email}</p>
                    </div>
                </div>
                 <Button onClick={handleSummarize} disabled={isSummarizing || isHistoryLoading}>
                    {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isSummarizing ? 'Summarizing...' : 'Summarize Medical History'}
                </Button>
            </div>
          ) : (
             <Card><CardHeader><CardTitle>Patient not found</CardTitle></CardHeader></Card>
          )}

           {summary && (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                    <Bot className="h-6 w-6" />
                    AI Medical Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{summary}</p>
                </CardContent>
              </Card>
            )}

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="history">Medical History</TabsTrigger>
              <TabsTrigger value="details">Medical Details</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="reports">Lab Reports</TabsTrigger>
              <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
                <PatientProfileTab patientId={patientId} patientProfile={patientProfile} isLoading={isProfileLoading} />
            </TabsContent>
            <TabsContent value="history" className="mt-6">
                <MedicalHistoryTab patientId={patientId} healthRecords={healthRecords} isLoading={isHistoryLoading} />
            </TabsContent>
            <TabsContent value="details" className="mt-6">
              <MedicalDetailsTab patientId={patientId} patientProfile={patientProfile} isLoading={isProfileLoading} />
            </TabsContent>
            <TabsContent value="prescriptions" className="mt-6">
                <PrescriptionsTab patientId={patientId} />
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
                <LabReportsTab patientId={patientId} healthRecords={healthRecords} isLoading={isHistoryLoading} />
            </TabsContent>
            <TabsContent value="vaccinations" className="mt-6">
              <VaccinationRecordsTab patientId={patientId} healthRecords={healthRecords} isLoading={isHistoryLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
