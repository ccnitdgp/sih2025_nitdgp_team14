
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileText, Save, History, Search, X, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const medicalInfoSchema = z.object({
  note: z.string().min(1, 'Medical note cannot be empty.'),
});

export default function MedicalInfoPage() {
  const { user: doctorUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [foundPatient, setFoundPatient] = useState<any | null>(null);

  const form = useForm<z.infer<typeof medicalInfoSchema>>({
    resolver: zodResolver(medicalInfoSchema),
    defaultValues: {
      note: '',
    },
  });

  const medicalHistoryQuery = useMemoFirebase(() => {
    if (!foundPatient?.id || !firestore) return null;
    return query(
      collection(firestore, `users/${foundPatient.id}/healthRecords`),
      where('recordType', '==', 'medicalHistory'),
      orderBy('dateCreated', 'desc')
    );
  }, [foundPatient, firestore]);

  const { data: medicalHistory, isLoading: isLoadingHistory } = useCollection(medicalHistoryQuery);

  const handleFindPatient = async () => {
    if (!patientIdInput.trim()) {
      toast({ variant: 'destructive', title: 'Patient ID is required.' });
      return;
    }
    setIsSearching(true);
    setFoundPatient(null);

    const patientQuery = query(
        collection(firestore, 'users'), 
        where('patientId', '==', patientIdInput.trim()),
        where('role', '==', 'patient')
    );
    const patientSnapshot = await getDocs(patientQuery);

    if (patientSnapshot.empty) {
        toast({
            variant: "destructive",
            title: "Patient Not Found",
            description: "No patient with this ID was found.",
        });
    } else {
        const patientData = { id: patientSnapshot.docs[0].id, ...patientSnapshot.docs[0].data() };
        setFoundPatient(patientData);
        toast({ title: 'Patient Found', description: `${patientData.firstName} ${patientData.lastName} selected.` });
    }
    setIsSearching(false);
  };

  const handleResetPatient = () => {
      setFoundPatient(null);
      setPatientIdInput('');
      form.reset();
  }

  const onSubmit = (values: z.infer<typeof medicalInfoSchema>) => {
    if (!doctorUser || !firestore || !foundPatient) return;

    setIsSubmitting(true);
    const patientHealthRecordsRef = collection(firestore, 'users', foundPatient.id, 'healthRecords');
    
    const medicalHistoryData = {
        recordType: 'medicalHistory',
        details: values.note,
        dateCreated: serverTimestamp(),
        userId: foundPatient.id,
        addedBy: doctorUser.uid,
    };

    addDocumentNonBlocking(patientHealthRecordsRef, medicalHistoryData);
    toast({ title: "Medical Note Saved", description: `The note has been added to the patient's medical history.` });
    form.reset({ note: ''});
    setIsSubmitting(false);
    // Note: We keep the patient selected after submission
  };
  
  const HistorySkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        ))}
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6"/>
                    <CardTitle>Record Patient Medical Information</CardTitle>
                </div>
                <CardDescription>
                    Select a patient and enter any relevant medical notes, observations, or general information. This will be added to their permanent medical history.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {!foundPatient ? (
                            <div className="space-y-2">
                                <Label htmlFor="patientId">Patient Unique ID</Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="patientId"
                                        placeholder="Enter Patient ID to find them"
                                        value={patientIdInput}
                                        onChange={(e) => setPatientIdInput(e.target.value)}
                                        disabled={isSearching}
                                    />
                                    <Button type="button" onClick={handleFindPatient} disabled={isSearching || !patientIdInput}>
                                        {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                                        Find Patient
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border rounded-lg bg-muted flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Selected Patient</p>
                                    <p className="font-bold text-lg">{foundPatient.firstName} {foundPatient.lastName} ({foundPatient.patientId})</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleResetPatient}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <fieldset disabled={!foundPatient || isSubmitting} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medical Information Note</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter medical notes, observations, or general information here..."
                                                className="min-h-[150px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting || !foundPatient}>
                                <Save className="mr-2 h-4 w-4"/>
                                {isSubmitting ? "Saving..." : "Save to Patient History"}
                            </Button>
                        </fieldset>
                    </form>
                </Form>
            </CardContent>
        </Card>

        {foundPatient && (
            <Card className="mt-8">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <History className="h-6 w-6"/>
                        <CardTitle>Recorded History</CardTitle>
                    </div>
                    <CardDescription>
                       Previously recorded medical notes for the selected patient.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingHistory ? <HistorySkeleton /> : (
                        medicalHistory && medicalHistory.length > 0 ? (
                            <div className="space-y-4">
                                {medicalHistory
                                .map(note => (
                                    <div key={note.id} className="p-4 border rounded-lg">
                                        <p className="text-sm">{note.details}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {note.dateCreated ? new Date(note.dateCreated.seconds * 1000).toLocaleString() : 'Date not available'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center">No medical history notes found for this patient.</p>
                        )
                    )}
                </CardContent>
            </Card>
        )}
    </div>
  )
}
