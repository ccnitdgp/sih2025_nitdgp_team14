
'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  medicationName: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage and instructions are required.'),
  endDate: z.date().optional(),
});

const medications = [
  { value: 'dolo', label: 'Dolo' },
  { value: 'paracitomol', label: 'Paracitomol' },
  { value: 'gylintus', label: 'Gylintus' },
  { value: 'metformin', label: 'Metformin' },
  { value: 'amoxicillin', label: 'Amoxicillin' },
  { value: 'amlodipine', label: 'Amlodipine' },
];

export default function DoctorPrescriptionsPage() {
  const { user: doctorUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof prescriptionSchema>>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: '',
      medicationName: '',
      dosage: '',
    },
  });
  
  const patientsCollectionRef = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return collection(firestore, `users/${doctorUser.uid}/patients`);
  }, [doctorUser, firestore]);

  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsCollectionRef);

  const prescriptionsCollectionGroupRef = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return query(
        collection(firestore, 'healthRecords'), 
        where('addedBy', '==', doctorUser.uid),
        where('recordType', '==', 'prescription'),
        orderBy('dateCreated', 'desc')
    );
  }, [doctorUser, firestore]);

  const { data: issuedPrescriptions, isLoading: isLoadingPrescriptions } = useCollection(prescriptionsCollectionGroupRef);
  
  const onSubmit = async (values: z.infer<typeof prescriptionSchema>) => {
    if (!doctorUser || !firestore) return;

    setIsSubmitting(true);
    
    const patientHealthRecordsRef = collection(firestore, 'users', values.patientId, 'healthRecords');
    const selectedPatient = patients?.find(p => p.id === values.patientId);

    const prescriptionData = {
        recordType: 'prescription',
        details: {
            medication: values.medicationName,
            dosage: values.dosage,
            doctor: `Dr. ${doctorUser.displayName || 'Unknown'}`,
            date: new Date().toISOString().split('T')[0],
            endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : null,
            status: 'Active',
        },
        patientInfo: {
            id: selectedPatient?.id,
            name: `${selectedPatient?.firstName} ${selectedPatient?.lastName}`
        },
        dateCreated: serverTimestamp(),
        userId: values.patientId, // The patient's ID
        addedBy: doctorUser.uid, // The doctor's ID
    };

    try {
        await addDocumentNonBlocking(patientHealthRecordsRef, prescriptionData);
        toast({ title: "Prescription Issued", description: `Prescription for ${values.medicationName} has been issued to the patient.` });
        form.reset();
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to issue prescription."});
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Add New Prescription</CardTitle>
                <CardDescription>Fill in the details to issue a new prescription for a patient.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                    <SelectItem key={p.id} value={p.patientId}>{p.firstName} {p.lastName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="medicationName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medication Name</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={medications}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Search medication..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="dosage"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dosage & Instructions</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., 500mg, twice a day" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>End Date (Optional)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date(new Date().setDate(new Date().getDate() - 1))
                                            }
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            {isSubmitting ? "Adding Prescription..." : "Add Prescription"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Issued Prescriptions</CardTitle>
                <CardDescription>A log of all prescriptions you have written.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Date Issued</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingPrescriptions ? (
                             [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32"/></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20"/></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16"/></TableCell>
                                </TableRow>
                            ))
                        ) : issuedPrescriptions && issuedPrescriptions.length > 0 ? (
                            issuedPrescriptions.map(presc => (
                                <TableRow key={presc.id}>
                                    <TableCell className="font-medium">{presc.patientInfo?.name || 'N/A'}</TableCell>
                                    <TableCell>{presc.details?.medication}</TableCell>
                                    <TableCell>{presc.details?.dosage}</TableCell>
                                    <TableCell>{presc.details?.date}</TableCell>
                                    <TableCell><Badge variant={presc.details?.status === 'Active' ? 'default' : 'secondary'}>{presc.details?.status}</Badge></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No prescriptions issued yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
