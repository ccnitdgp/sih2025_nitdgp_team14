
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, Search, Sparkles, ShieldCheck, KeyRound } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PatientProfileTab } from '@/components/doctor/patient-profile-tab';
import { MedicalHistoryTab } from '@/components/doctor/medical-history-tab';
import { PrescriptionsTab } from '@/components/doctor/prescriptions-tab';
import { LabReportsTab } from '@/components/doctor/lab-reports-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { summarizeMedicalHistory } from '@/ai/flows/summarize-medical-history-flow';
import { MedicalDetailsTab } from '@/components/doctor/medical-details-tab';
import { VaccinationRecordsTab } from '@/components/doctor/vaccination-records-tab';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function DoctorPatientsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientToVerify, setPatientToVerify] = useState<any | null>(null);
  const [foundPatient, setFoundPatient] = useState<any | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);

  const handleFindPatient = useCallback(async (idToSearch?: string) => {
    const searchId = idToSearch || patientIdInput;
    if (!searchId.trim()) {
      toast({ variant: 'destructive', title: 'Patient ID is required.' });
      return;
    }
    setIsLoading(true);
    setFoundPatient(null);
    setPatientToVerify(null);
    setIsOtpDialogOpen(false);

    try {
      const q = query(collection(firestore, 'users'), where('patientId', '==', searchId.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Patient Not Found', description: 'No patient found with that ID.' });
      } else {
        const patientData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        setPatientToVerify(patientData);
        
        // Simulate sending OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);

        toast({
          title: 'OTP Sent (Simulation)',
          description: `An OTP has been sent to the patient's registered number. OTP: ${newOtp}`,
          duration: 9000,
        });

        setIsOtpDialogOpen(true);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error finding patient' });
    } finally {
      setIsLoading(false);
    }
  }, [patientIdInput, firestore, toast]);

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
        toast({ title: 'Verification Successful', description: 'Access granted.' });
        setFoundPatient(patientToVerify);
        setIsOtpDialogOpen(false);
        setOtp('');
    } else {
        toast({ variant: 'destructive', title: 'Invalid OTP', description: 'The OTP you entered is incorrect.'});
    }
  }

  useEffect(() => {
    const patientIdFromUrl = searchParams.get('patientId');
    if (patientIdFromUrl && !foundPatient) {
      setPatientIdInput(patientIdFromUrl);
      handleFindPatient(patientIdFromUrl);
    }
  }, [searchParams, foundPatient, handleFindPatient]);

  const medicalHistoryQuery = useMemoFirebase(() => {
    if (!foundPatient?.id || !firestore) return null;
    return query(
      collection(firestore, `users/${foundPatient.id}/healthRecords`),
      where('recordType', '==', 'medicalHistory')
    );
  }, [foundPatient, firestore]);

  const { data: medicalHistory } = useCollection(medicalHistoryQuery);

  const handleSummarize = async () => {
    if (!medicalHistory || medicalHistory.length === 0) {
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
      const notes = medicalHistory.map(item => item.details).join('\n');
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


  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Secure Patient Access</CardTitle>
            <CardDescription>Enter a Patient ID to search for and view their records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-md items-center space-x-2">
              <Input
                placeholder="Enter Patient ID (e.g., PT-XXXXXXXXXX)"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={() => handleFindPatient()} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Search className="mr-2" />}
                Find Patient
              </Button>
            </div>
          </CardContent>
        </Card>

        {foundPatient && (
          <div className="space-y-8">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarImage src={`https://picsum.photos/seed/${foundPatient.id}/200`} />
                        <AvatarFallback className="text-2xl">
                        {foundPatient.firstName?.charAt(0)}
                        {foundPatient.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{foundPatient.firstName} {foundPatient.lastName}</h1>
                        <p className="text-muted-foreground">{foundPatient.email}</p>
                    </div>
                </div>
                 <Button onClick={handleSummarize} disabled={isSummarizing}>
                    {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isSummarizing ? 'Summarizing...' : 'Summarize Medical History'}
                </Button>
            </div>
            
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
                  <PatientProfileTab patientId={foundPatient.id} patientProfile={foundPatient} isLoading={false} />
              </TabsContent>
              <TabsContent value="history" className="mt-6">
                  <MedicalHistoryTab patientId={foundPatient.id} />
              </TabsContent>
               <TabsContent value="details" className="mt-6">
                 <MedicalDetailsTab patientId={foundPatient.id} />
               </TabsContent>
              <TabsContent value="prescriptions" className="mt-6">
                  <PrescriptionsTab patientId={foundPatient.id} />
              </TabsContent>
              <TabsContent value="reports" className="mt-6">
                  <LabReportsTab patientId={foundPatient.id} />
              </TabsContent>
              <TabsContent value="vaccinations" className="mt-6">
                <VaccinationRecordsTab patientId={foundPatient.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>OTP Verification Required</DialogTitle>
                    <DialogDescription>
                        To protect patient privacy, please enter the OTP sent to their registered mobile number.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                    <p className="font-medium">Enter 6-digit OTP</p>
                    <Input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-48 text-center text-2xl tracking-[0.5em]"
                        placeholder="••••••"
                    />
                    <Button onClick={handleVerifyOtp} className="mt-4">
                        <KeyRound className="mr-2"/>
                        Verify & View Records
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
