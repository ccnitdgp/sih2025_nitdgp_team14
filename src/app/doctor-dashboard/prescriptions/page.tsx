
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, useDoc, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, query, where, orderBy, doc, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Trash2, Search, X, Loader2 } from 'lucide-react';
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
  medicationName: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage and instructions are required.'),
  endDate: z.date().optional(),
});

export default function DoctorPrescriptionsPage() {
  const { user: doctorUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [translations, setTranslations] = useState({});
  const [patientIdInput, setPatientIdInput] = useState('');
  const [foundPatient, setFoundPatient] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [issuedPrescriptions, setIssuedPrescriptions] = useState<any[]>([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true);

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
      medicationName: '',
      dosage: '',
    },
  });
  
  useEffect(() => {
    if (!doctorUser || !firestore) {
      setIsLoadingPrescriptions(false);
      return;
    };

    const fetchPrescriptions = async () => {
        setIsLoadingPrescriptions(true);
        const ref = collection(firestore, "prescriptions");
        const q = query(ref, where("doctorId", "==", doctorUser.uid));
        try {
            const snapshot = await getDocs(q);
            const prescriptionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort on the client-side
            const sortedData = prescriptionsData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setIssuedPrescriptions(sortedData);
        } catch (error) {
            console.error("Failed to fetch prescriptions:", error);
            setIssuedPrescriptions([]);
        } finally {
            setIsLoadingPrescriptions(false);
        }
    }
    
    fetchPrescriptions();

  }, [doctorUser, firestore]);
  
  const handleFindPatient = async () => {
    if (!patientIdInput.trim()) {
      toast({ variant: 'destructive', title: 'Patient ID is required.' });
      return;
    }
    if (!firestore || !doctorUser) return;

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
  
  const onSubmit = async (values: z.infer<typeof prescriptionSchema>) => {
    if (!doctorUser || !firestore || !userProfile || !foundPatient) {
        toast({ variant: "destructive", title: "Error", description: "A verified patient must be selected." });
        return;
    };

    setIsSubmitting(true);
    
    const prescriptionsRef = collection(firestore, 'prescriptions');
    const newPrescriptionRef = doc(prescriptionsRef);

    const prescriptionData = {
        id: newPrescriptionRef.id,
        patientId: foundPatient.id,
        patientName: `${foundPatient.firstName} ${foundPatient.lastName}`,
        doctorId: doctorUser.uid,
        doctorName: `Dr. ${userProfile.firstName} ${userProfile.lastName}`,
        medication: values.medicationName,
        dosage: values.dosage,
        date: new Date().toISOString().split('T')[0],
        endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : null,
        status: 'Active',
    };

    await setDocumentNonBlocking(newPrescriptionRef, prescriptionData, {});
    toast({ title: "Prescription Issued", description: `Prescription for ${values.medicationName} has been issued to the patient.` });
    
    // Manually add to local state to reflect update immediately
    setIssuedPrescriptions(prev => [prescriptionData, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    form.reset();
    handleResetPatient();
    setIsSubmitting(false);
  };

  const handleDelete = (prescriptionId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'prescriptions', prescriptionId);
    deleteDocumentNonBlocking(docRef);
    setIssuedPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
    toast({ title: 'Prescription Deleted', variant: 'destructive' });
  };

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="medicationName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('medication_name_label', 'Medication Name')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('search_medication_placeholder', 'e.g., Paracetamol')} {...field} />
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
                            <Button type="submit" disabled={isSubmitting || !foundPatient}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                {isSubmitting ? t('adding_prescription_button', 'Adding Prescription...') : t('add_prescription_button', 'Add Prescription')}
                            </Button>
                        </fieldset>
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
                                <TableHead className="text-right">Actions</TableHead>
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
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8"/></TableCell>
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
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(presc.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">{t('no_prescriptions_issued', 'No prescriptions issued yet.')}</TableCell>
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
