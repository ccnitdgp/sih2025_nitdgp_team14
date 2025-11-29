
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookUser, FileDown, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, serverTimestamp, doc, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { dummyPdfContent } from '@/lib/dummy-pdf';
import { format } from 'date-fns';

const prescriptionSchema = z.object({
  medication: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  endDate: z.date().optional(),
  status: z.enum(['Active', 'Finished']),
});

export function PrescriptionsTab({ patientId }: { patientId: string }) {
  const { user: doctorUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  const doctorDocRef = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return doc(firestore, 'users', doctorUser.uid);
  }, [doctorUser, firestore]);

  const { data: doctorProfile } = useDoc(doctorDocRef);
  
  const patientDocRef = useMemoFirebase(() => {
      if(!patientId || !firestore) return null;
      return doc(firestore, 'users', patientId);
  }, [patientId, firestore])
  
  const { data: patientProfile } = useDoc(patientDocRef);

  const form = useForm<z.infer<typeof prescriptionSchema>>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medication: '',
      dosage: '',
      endDate: undefined,
      status: 'Active',
    }
  });

  const prescriptionsQuery = useMemoFirebase(() => {
    if (!patientId || !firestore) return null;
    return query(collection(firestore, `prescriptions`), where('patientId', '==', patientId));
  }, [patientId, firestore]);
  
  const { data: prescriptions, isLoading } = useCollection(prescriptionsQuery);

  const onSubmit = (values: z.infer<typeof prescriptionSchema>) => {
    if (!firestore || !doctorUser || !doctorProfile || !patientProfile) return;

    setIsAdding(true);
    
    const prescriptionsColRef = collection(firestore, 'prescriptions');
    const newPrescriptionRef = doc(prescriptionsColRef);

    const prescriptionData = {
        id: newPrescriptionRef.id,
        patientId: patientId,
        patientName: `${patientProfile.firstName} ${patientProfile.lastName}`,
        doctorId: doctorUser.uid,
        doctorName: `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}`,
        medication: values.medication,
        dosage: values.dosage,
        date: new Date().toISOString().split('T')[0],
        endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : null,
        status: values.status
    };
    
    addDocumentNonBlocking(newPrescriptionRef, prescriptionData);
    toast({ title: "Prescription Added" });
    form.reset({
      medication: '',
      dosage: '',
      endDate: undefined,
      status: 'Active',
    });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'prescriptions', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Prescription removed.' });
  }

  const handleDownload = (prescription: any) => {
    const link = document.createElement('a');
    link.href = dummyPdfContent;
    link.download = `prescription-${prescription.medication.replace(/\s+/g, '-')}-${prescription.date}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-4 flex justify-between items-center">
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
      <CardHeader>
        <div className="flex items-center gap-3">
          <BookUser className="h-6 w-6" />
          <CardTitle className="text-2xl">Prescriptions</CardTitle>
        </div>
        <CardDescription>
          Manage the patient's prescribed medications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Add New Prescription</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="medication" render={({field}) => (
                        <FormItem>
                            <FormLabel>Medication Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Metformin" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="dosage" render={({field}) => (
                        <FormItem>
                            <FormLabel>Dosage</FormLabel>
                            <FormControl><Input placeholder="e.g., 500mg, twice a day" {...field} /></FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="status" render={({field}) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Finished">Finished</SelectItem>
                                </SelectContent>
                            </Select>
                             <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <Button type="submit" disabled={isAdding}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isAdding ? 'Adding...' : 'Add Prescription'}
                </Button>
            </form>
        </Form>

        <div className="space-y-4">
            <h4 className="font-medium">Prescription History</h4>
            {isLoading ? <SkeletonLoader /> : prescriptions && prescriptions.length > 0 ? (
            prescriptions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((item) => (
                <Card key={item.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-lg">{item.medication}</h3>
                            <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {item.dosage} - Prescribed by {item.doctorName} on {item.date}
                        </p>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(item)}>
                            <FileDown className="mr-2 h-4 w-4"/>
                            Download
                        </Button>
                    </div>
                </Card>
            ))) : (
            !isLoading && <p className="text-muted-foreground text-center py-4">No prescriptions recorded for this patient yet.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
