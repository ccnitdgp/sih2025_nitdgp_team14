
'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, FileText, Syringe, Scan } from 'lucide-react';
import { recentUploads } from '@/lib/data'; 

const uploadSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  documentType: z.enum(['Lab Report', 'Vaccination', 'Scan']),
  file: z.instanceof(File).refine(file => file.size > 0, 'Please select a file.'),
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
    },
  });

  const appointmentsQuery = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return query(collection(firestore, 'appointments'), where('doctorId', '==', doctorUser.uid));
  }, [doctorUser, firestore]);

  const { data: appointments, isLoading: isLoadingAppointments } = useCollection(appointmentsQuery);

  const patientsFromAppointments = useMemo(() => {
    if (!appointments) return [];
    const patientMap = new Map();
    appointments.forEach(appt => {
      if (!patientMap.has(appt.patientId)) {
        patientMap.set(appt.patientId, {
          id: appt.patientId,
          name: appt.patientName,
          email: 'unknown' // Email is not in appointment doc, adjust if needed
        });
      }
    });
    return Array.from(patientMap.values());
  }, [appointments]);


  const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
    if (!doctorUser) return;
    setIsSubmitting(true);

    // Placeholder for actual file upload logic
    console.log('Uploading file for patient:', values.patientId, values.file.name);
    
    setTimeout(() => {
      toast({ title: 'Document Uploaded', description: `${values.file.name} has been uploaded for the selected patient.` });
      form.reset();
      setFileName('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Medical Document</CardTitle>
          <CardDescription>Upload lab reports, vaccination records, or scans for a patient.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
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
                          {patientsFromAppointments?.map(p => (
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
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Choose File</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            field.onChange(file);
                                            setFileName(file.name);
                                        }
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
              </div>

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

              <Button type="submit" disabled={isSubmitting}>
                <Upload className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Uploading...' : 'Upload Document'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>A list of the most recently uploaded documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentUploads.length > 0 ? (
            recentUploads.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{upload.fileName}</p>
                    <p className="text-sm text-muted-foreground">For {upload.patientName} - {upload.type}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{upload.date}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No documents uploaded recently.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
