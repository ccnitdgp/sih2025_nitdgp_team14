
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, PlusCircle, Trash2, Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const documentSchema = z.object({
  documentName: z.string().min(3, 'Document name is required.'),
  organization: z.string().min(2, 'Issuing organization is required.'),
  documentType: z.enum(['labReport', 'scanReport', 'vaccinationRecord', 'other']),
  file: z.instanceof(File).refine(file => file.size > 0, "A file is required."),
});

export default function UploadDocumentsPage() {
  const { user: doctorUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [foundPatient, setFoundPatient] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentName: '',
      organization: '',
      documentType: undefined,
      file: undefined,
    },
  });

  const handleFindPatient = async () => {
    if (!patientIdInput.trim()) {
      toast({ variant: 'destructive', title: 'Patient ID is required.' });
      return;
    }
    setIsSearching(true);
    setFoundPatient(null);

    try {
      const q = query(collection(firestore, 'users'), where('patientId', '==', patientIdInput.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Patient Not Found', description: 'No patient found with that ID.' });
      } else {
        const patientData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        setFoundPatient(patientData);
        toast({ title: 'Patient Found', description: `${patientData.firstName} ${patientData.lastName} selected.` });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error finding patient' });
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof documentSchema>) => {
    if (!doctorUser || !firestore || !foundPatient) return;
    
    setIsSubmitting(true);
    const file = values.file;
    const patientId = foundPatient.id;
    
    try {
        const storage = getStorage();
        const storageRef = ref(storage, `patient_documents/${patientId}/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on(
            'state_changed',
            null,
            (error) => {
                console.error("Upload failed:", error);
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the file. Please check storage permissions.'});
                setIsSubmitting(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                const healthRecordsRef = collection(firestore, 'users', patientId, 'healthRecords');
                const newRecordData = {
                    recordType: values.documentType,
                    details: {
                        name: values.documentName,
                        issuer: values.organization,
                        date: format(new Date(), 'yyyy-MM-dd'),
                        downloadUrl: downloadURL,
                        fileName: file.name
                    },
                    dateCreated: serverTimestamp(),
                    userId: patientId,
                    addedBy: doctorUser.uid,
                };

                await addDocumentNonBlocking(healthRecordsRef, newRecordData);
                toast({ title: 'Document Uploaded', description: 'The document has been added to the patient\'s records.' });
                form.reset();
                setPatientIdInput('');
                setFoundPatient(null);
                setIsSubmitting(false);
            }
        )
    } catch(e) {
        console.error(e)
        toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred during the upload process.'});
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-8">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Upload className="h-6 w-6"/>
                    <CardTitle>Upload Medical Document</CardTitle>
                </div>
                <CardDescription>
                    Enter a patient's Unique ID to find them, then fill in the document details and upload the file.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                          <FormLabel>Patient Unique ID</FormLabel>
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="Enter Patient ID (e.g., PT-XXXXXXXXXX)"
                              value={patientIdInput}
                              onChange={(e) => setPatientIdInput(e.target.value)}
                              disabled={isSearching}
                            />
                            <Button type="button" onClick={handleFindPatient} disabled={isSearching || !patientIdInput}>
                              {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                            </Button>
                          </div>
                          {foundPatient && (
                            <p className="text-sm text-green-600 font-medium">
                              Selected: {foundPatient.firstName} {foundPatient.lastName}
                            </p>
                          )}
                        </div>

                        <fieldset disabled={!foundPatient || isSubmitting} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="documentType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Document Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a type..."/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="labReport">Lab Report</SelectItem>
                                                    <SelectItem value="scanReport">Scan Report (X-Ray, MRI, etc.)</SelectItem>
                                                    <SelectItem value="vaccinationRecord">Vaccination Record</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="documentName"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Document Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Full Blood Count" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="organization"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Issuing Organization</FormLabel>
                                        <FormControl><Input placeholder="e.g., City Diagnostics Lab" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>File (PDF, PNG, JPG)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="application/pdf,image/png,image/jpeg"
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    ref={field.ref}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.files?.[0]);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                                {isSubmitting ? 'Uploading...' : 'Upload Document'}
                            </Button>
                        </fieldset>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  )
}
