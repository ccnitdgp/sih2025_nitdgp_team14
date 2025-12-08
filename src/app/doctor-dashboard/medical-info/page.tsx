
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const medicalInfoSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  note: z.string().min(1, 'Medical note cannot be empty.'),
});

export default function MedicalInfoPage() {
  const { user: doctorUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof medicalInfoSchema>>({
    resolver: zodResolver(medicalInfoSchema),
    defaultValues: {
      patientId: '',
      note: '',
    },
  });

   const patientsQuery = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return query(
      collection(firestore, 'users'),
      where('role', '==', 'patient'),
      where('doctorId', '==', doctorUser.uid)
    );
  }, [doctorUser, firestore]);

  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);
  

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'patientId') {
        setSelectedPatientId(value.patientId || null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const medicalHistoryQuery = useMemoFirebase(() => {
    if (!selectedPatientId || !firestore) return null;
    return query(
      collection(firestore, `users/${selectedPatientId}/healthRecords`),
      where('recordType', '==', 'medicalHistory')
    );
  }, [selectedPatientId, firestore]);

  const { data: medicalHistory, isLoading: isLoadingHistory } = useCollection(medicalHistoryQuery);

  const onSubmit = (values: z.infer<typeof medicalInfoSchema>) => {
    if (!doctorUser || !firestore) return;

    setIsSubmitting(true);
    const patientHealthRecordsRef = collection(firestore, 'users', values.patientId, 'healthRecords');
    
    const medicalHistoryData = {
        recordType: 'medicalHistory',
        details: values.note,
        dateCreated: serverTimestamp(),
        userId: values.patientId,
        addedBy: doctorUser.uid,
    };

    addDocumentNonBlocking(patientHealthRecordsRef, medicalHistoryData);
    toast({ title: "Medical Note Saved", description: `The note has been added to the patient's medical history.` });
    form.reset({ patientId: values.patientId, note: ''});
    setIsSubmitting(false);
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
                        <FormField
                            control={form.control}
                            name="patientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Patient</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingPatients}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {patients?.map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.firstName} {p.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        <Button type="submit" disabled={isSubmitting}>
                            <Save className="mr-2 h-4 w-4"/>
                            {isSubmitting ? "Saving..." : "Save to Patient History"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        {selectedPatientId && (
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
                                 .sort((a, b) => b.dateCreated?.toMillis() - a.dateCreated?.toMillis())
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

    