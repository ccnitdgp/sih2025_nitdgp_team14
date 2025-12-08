
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, query, where, orderBy, doc, DocumentReference } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, PlusCircle, FileText, Trash2, FileDown, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const documentSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
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
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
  });
  
  const appointmentsQuery = useMemoFirebase(() => {
    if (!doctorUser || !firestore) return null;
    return query(
      collection(firestore, 'users'),
      where('role', '==', 'patient'),
      where('doctorId', '==', doctorUser.uid)
    );
  }, [doctorUser, firestore]);

  const { data: patients, isLoading: isLoadingAppointments } = useCollection(appointmentsQuery);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'patientId') {
        setSelectedPatientId(value.patientId || null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const patientHealthRecordsQuery = useMemoFirebase(() => {
    if (!selectedPatientId || !firestore) return null;
    return query(
      collection(firestore, `users/${selectedPatientId}/healthRecords`),
      orderBy('dateCreated', 'desc')
    );
  }, [selectedPatientId, firestore]);
  
  const { data: healthRecords, isLoading: isLoadingRecords } = useCollection(patientHealthRecordsQuery);

  const onSubmit = async (values: z.infer<typeof documentSchema>) => {
    if (!doctorUser || !firestore) return;
    
    setIsSubmitting(true);
    const file = values.file;
    const patientId = values.patientId;
    
    try {
        const storage = getStorage();
        const storageRef = ref(storage, `patient_documents/${patientId}/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on(
            'state_changed',
            null,
            (error) => {
                console.error("Upload failed:", error);
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the file.'});
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
                form.reset({ patientId: values.patientId, documentName: '', organization: '', documentType: undefined });
                setIsSubmitting(false);
            }
        )
    } catch(e) {
        console.error(e)
        toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.'});
        setIsSubmitting(false);
    }
  };
  
  const handleDelete = (recordId: string) => {
      if(!selectedPatientId || !firestore) return;
      const docRef = doc(firestore, 'users', selectedPatientId, 'healthRecords', recordId);
      deleteDocumentNonBlocking(docRef);
      toast({ title: 'Document Deleted', variant: 'destructive'});
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-8">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Upload className="h-6 w-6"/>
                    <CardTitle>Upload Medical Document</CardTitle>
                </div>
                <CardDescription>
                    Select a patient, fill in the document details, and upload the file.
                </CardDescription>
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
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingAppointments}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingAppointments ? "Loading patients..." : "Select a patient"} />
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
                                render={({ field: { onChange, ...fieldProps } }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>File (PDF only)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="file" 
                                                accept="application/pdf"
                                                {...fieldProps}
                                                onChange={(event) => {
                                                    onChange(event.target.files && event.target.files[0]);
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
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        {selectedPatientId && (
            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                    <CardDescription>
                        Previously uploaded documents for the selected patient.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date Uploaded</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingRecords ? (
                                    [...Array(2)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : healthRecords && healthRecords.length > 0 ? (
                                    healthRecords.map(doc => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">{doc.details?.name}</TableCell>
                                            <TableCell>{doc.recordType}</TableCell>
                                            <TableCell>{doc.dateCreated ? format(doc.dateCreated.toDate(), 'PPP') : 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No documents found for this patient.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  )
}
