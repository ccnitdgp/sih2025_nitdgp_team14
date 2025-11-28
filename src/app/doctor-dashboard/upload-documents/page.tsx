
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, FileText, Syringe, Scan } from 'lucide-react';

const uploadSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  documentType: z.enum(['Lab Report', 'Vaccination', 'Scan']),
  documentName: z.string().min(3, 'Please provide a name for the document.'),
  issuer: z.string().min(3, 'Please provide the issuer of the document (e.g. lab name).'),
  file: z.any().refine(files => files?.length === 1, 'Please select a file.'),
});

export default function UploadDocumentsPage() {
  const { user: doctorUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      patientId: '',
      documentType: 'Lab Report',
      documentName: '',
      issuer: ''
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

  const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
    if (!doctorUser || !firestore) return;
    setIsSubmitting(true);

    // This is a placeholder for actual file upload to a service like Firebase Storage.
    // In a real application, you would upload the file here and get a URL.
    console.log('Uploading file for patient:', values.patientId, values.file[0].name);
    
    const healthRecordsRef = collection(firestore, 'users', values.patientId, 'healthRecords');
    
    let recordType = 'labReport'; // default
    if (values.documentType === 'Vaccination') recordType = 'vaccinationRecord';
    if (values.documentType === 'Scan') recordType = 'scanReport';


    const reportData = {
        recordType: recordType,
        details: {
            name: values.documentName,
            issuer: values.issuer,
            date: new Date().toISOString().split('T')[0],
            fileName: values.file[0].name,
            downloadUrl: '#', // Placeholder URL
        },
        dateCreated: serverTimestamp(),
        userId: values.patientId,
        addedBy: doctorUser.uid,
    };

    addDocumentNonBlocking(healthRecordsRef, reportData);

    toast({ title: 'Document Record Saved', description: `A record for ${values.file[0].name} has been saved for the patient.` });
    form.reset();
    setFileName('');
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto max-w-2xl px-6 py-12 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Medical Document</CardTitle>
          <CardDescription>Upload lab reports, vaccination records, or scans for a patient.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Patient</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingAppointments}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingAppointments ? "Loading patients..." : "Choose a patient"} />
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
                name="documentType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Document Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col md:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Lab Report" id="lab-report" />
                          </FormControl>
                          <FormLabel htmlFor="lab-report" className="font-normal flex items-center gap-2 cursor-pointer">
                            <FileText className="h-4 w-4" /> Lab Report
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Vaccination" id="vaccination" />
                          </FormControl>
                          <FormLabel htmlFor="vaccination" className="font-normal flex items-center gap-2 cursor-pointer">
                            <Syringe className="h-4 w-4" /> Vaccination
                          </FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Scan" id="scan" />
                          </FormControl>
                          <FormLabel htmlFor="scan" className="font-normal flex items-center gap-2 cursor-pointer">
                            <Scan className="h-4 w-4" /> Scan
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                 <FormField
                    control={form.control}
                    name="documentName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Complete Blood Count Report" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="issuer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Issued By (Lab/Hospital)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., City Diagnostics Lab" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
              </div>

               <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Choose File</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => {
                                        field.onChange(e.target.files);
                                        const file = e.target.files?.[0];
                                        if (file) setFileName(file.name);
                                    }} 
                                />
                                <Button variant="outline" className="w-full justify-start font-normal text-muted-foreground" asChild>
                                    <div>{fileName || 'No file chosen'}</div>
                                </Button>
                            </div>
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                  )}
                />

              <Button type="submit" disabled={isSubmitting}>
                <Upload className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Uploading...' : 'Upload Document'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    