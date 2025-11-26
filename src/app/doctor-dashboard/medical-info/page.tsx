
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save } from 'lucide-react';

const medicalInfoSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  note: z.string().min(1, 'Medical note cannot be empty.'),
});

export default function MedicalInfoPage() {
  const { user: doctorUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof medicalInfoSchema>>({
    resolver: zodResolver(medicalInfoSchema),
    defaultValues: {
      patientId: '',
      note: '',
    },
  });

  const patientsCollectionRef = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return collection(firestore, `users/${doctorUser.uid}/patients`);
  }, [doctorUser, firestore]);

  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsCollectionRef);

  const onSubmit = async (values: z.infer<typeof medicalInfoSchema>) => {
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

    try {
        await addDocumentNonBlocking(patientHealthRecordsRef, medicalHistoryData);
        toast({ title: "Medical Note Saved", description: `The note has been added to the patient's medical history.` });
        form.reset();
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to save medical note."});
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

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
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPatients}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {patients?.map(p => (
                                                <SelectItem key={p.id} value={p.patientId}>
                                                    {p.firstName} {p.lastName} (ID: {p.patientId.substring(0, 8).toUpperCase()})
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
    </div>
  )
}
