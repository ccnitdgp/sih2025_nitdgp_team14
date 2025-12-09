
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, doc, serverTimestamp, addDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, PlusCircle, Loader2, Search, X } from 'lucide-react';
import { BackButton } from '@/components/layout/back-button';

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

  const [patientIdInput, setPatientIdInput] = useState('');
  const [foundPatient, setFoundPatient] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentName: '',
      organization: '',
      documentType: undefined,
      file: undefined,
    },
  });
  const { control, handleSubmit, reset } = form;

  const handleFindPatient = async () => {
    if (!patientIdInput.trim()) {
      toast({ variant: 'destructive', title: 'Patient ID is required.' });
      return;
    }
    if (!firestore) return;
    setIsSearching(true);
    setFoundPatient(null);

    try {
      const q = query(
          collection(firestore, 'users'), 
          where('patientId', '==', patientIdInput.trim()),
          where('role', '==', 'patient')
      );
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

  const handleResetPatient = () => {
    setFoundPatient(null);
    setPatientIdInput('');
    reset();
  }

  const onSubmit = async (values: z.infer<typeof documentSchema>) => {
    if (!doctorUser || !firestore || !foundPatient) {
        toast({ variant: 'destructive', title: 'Error', description: 'A patient must be selected before uploading.'});
        return;
    };
    
    setIsSubmitting(true);

    try {
        const file = values.file;
        const patientId = foundPatient.id;
        const storage = getStorage();
        const storageRef = ref(storage, `patient_documents/${patientId}/${Date.now()}-${file.name}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

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

        const newDocRef = await addDoc(healthRecordsRef, newRecordData);
        await setDoc(doc(healthRecordsRef, newDocRef.id), { id: newDocRef.id }, { merge: true });

        toast({ title: 'Upload Complete', description: `${file.name} has been successfully uploaded.` });
        
        handleResetPatient();

    } catch (error) {
        console.error("Upload or Firestore update failed:", error);
        toast({
            variant: 'destructive',
            title: "Upload Failed",
            description: "An error occurred during the upload process. Please try again."
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12 space-y-8">
        <BackButton />
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
                <div className="space-y-6">
                     {!foundPatient ? (
                        <div className="space-y-2">
                             <Label htmlFor="patientId">Patient Unique ID</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="patientId"
                                    placeholder="Enter Patient ID (e.g., PT-XXXXXXXXXX)"
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
                    
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                             <fieldset disabled={!foundPatient || isSubmitting} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={control}
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
                                        control={control}
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
                                        control={control}
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
                                        control={control}
                                        name="file"
                                        render={({ field: { onChange, onBlur, name, ref } }) => (
                                            <FormItem>
                                                <FormLabel>File (PDF, PNG, JPG)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="application/pdf,image/png,image/jpeg"
                                                        onBlur={onBlur}
                                                        name={name}
                                                        ref={ref}
                                                        onChange={(e) => {
                                                            onChange(e.target.files?.[0]);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" disabled={isSubmitting || !foundPatient}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                                    {isSubmitting ? 'Uploading...' : 'Upload Document'}
                                </Button>
                            </fieldset>
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
