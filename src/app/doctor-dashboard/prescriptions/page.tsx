
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, serverTimestamp, query, where, orderBy, collectionGroup, doc } from 'firebase/firestore';
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
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

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
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [translations, setTranslations] = useState({});

  const userDocRef = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return doc(firestore, 'users', doctorUser.uid);
  }, [doctorUser, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  useEffect(() => {
    if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
      setTranslations(languageFiles[userProfile.preferredLanguage]);
    } else {
      setTranslations({});
    }
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  const form = useForm<z.infer<typeof prescriptionSchema>>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: '',
      medicationName: '',
      dosage: '',
    },
  });

  const appointmentsQuery = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return query(
      collection(firestore, 'appointments'),
      where('doctorId', '==', doctorUser.uid)
    );
  }, [doctorUser, firestore]);

  const { data: appointments, isLoading: isLoadingAppointments } = useCollection(appointmentsQuery);

  const uniquePatients = useMemo(() => {
    if (!appointments) return [];
    const patientMap = new Map();
    appointments.forEach(appt => {
        if (!patientMap.has(appt.patientId)) {
            patientMap.set(appt.patientId, {
                id: appt.patientId,
                name: appt.patientName,
            });
        }
    });
    return Array.from(patientMap.values());
  }, [appointments]);

  const issuedPrescriptionsQuery = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return query(
      collection(firestore, 'prescriptions'),
      where('doctorId', '==', doctorUser.uid),
      orderBy('date', 'desc')
    );
  }, [doctorUser, firestore]);

  const { data: issuedPrescriptions, isLoading: isLoadingPrescriptions } = useCollection(issuedPrescriptionsQuery);
  
  const onSubmit = (values: z.infer<typeof prescriptionSchema>) => {
    if (!doctorUser || !firestore || !userProfile) return;

    setIsSubmitting(true);
    
    const prescriptionsRef = collection(firestore, 'prescriptions');
    const newPrescriptionRef = doc(prescriptionsRef);
    const selectedPatient = uniquePatients?.find(p => p.id === values.patientId);

    const prescriptionData = {
        id: newPrescriptionRef.id,
        patientId: values.patientId,
        patientName: selectedPatient?.name || 'Unknown Patient',
        doctorId: doctorUser.uid,
        doctorName: `Dr. ${userProfile.firstName} ${userProfile.lastName}`,
        medication: values.medicationName,
        dosage: values.dosage,
        date: new Date().toISOString().split('T')[0],
        endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : null,
        status: 'Active',
    };

    addDocumentNonBlocking(newPrescriptionRef, prescriptionData, {});
    toast({ title: "Prescription Issued", description: `Prescription for ${values.medicationName} has been issued to the patient.` });
    form.reset({
        patientId: '',
        medicationName: '',
        dosage: '',
        endDate: undefined,
    });
    setSelectedPatientId(null);
    setIsSubmitting(false);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'patientId') {
        setSelectedPatientId(value.patientId || null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>{t('add_new_prescription_title', 'Add New Prescription')}</CardTitle>
                <CardDescription>{t('add_new_prescription_desc', 'Fill in the details to issue a new prescription for a patient.')}</CardDescription>
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
                                        <FormLabel>{t('patient_label', 'Patient')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingAppointments}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingAppointments ? t('loading_patients', 'Loading patients...') : t('select_patient', 'Select a patient')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {uniquePatients?.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name}
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
                                name="medicationName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('medication_name_label', 'Medication Name')}</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={medications}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder={t('search_medication_placeholder', 'Search medication...')}
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
                                    <FormLabel>{t('dosage_instructions_label', 'Dosage & Instructions')}</FormLabel>
                                    <FormControl>
                                    <Input placeholder={t('dosage_instructions_placeholder', 'e.g., 500mg, twice a day')} {...field} />
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
                                    <FormLabel>{t('end_date_optional_label', 'End Date (Optional)')}</FormLabel>
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
                                                <span>{t('pick_a_date', 'Pick a date')}</span>
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
                            {isSubmitting ? t('adding_prescription_button', 'Adding Prescription...') : t('add_prescription_button', 'Add Prescription')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('issued_prescriptions_title', 'Issued Prescriptions')}</CardTitle>
                <CardDescription>{t('issued_prescriptions_desc', 'A log of all prescriptions you have written.')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table_header_patient', 'Patient')}</TableHead>
                                <TableHead>{t('table_header_medication', 'Medication')}</TableHead>
                                <TableHead>{t('table_header_dosage', 'Dosage')}</TableHead>
                                <TableHead>{t('table_header_date_issued', 'Date Issued')}</TableHead>
                                <TableHead>{t('table_header_status', 'Status')}</TableHead>
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
                                        <TableCell className="font-medium">{presc.patientName || 'N/A'}</TableCell>
                                        <TableCell>{presc.medication}</TableCell>
                                        <TableCell>{presc.dosage}</TableCell>
                                        <TableCell>{presc.date}</TableCell>
                                        <TableCell><Badge variant={presc.status === 'Active' ? 'default' : 'secondary'}>{presc.status}</Badge></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">{t('no_prescriptions_issued', 'No prescriptions issued yet.')}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}

    