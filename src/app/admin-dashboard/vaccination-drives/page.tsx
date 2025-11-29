
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Syringe, PlusCircle, Trash2, CalendarDays, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BackButton } from '@/components/layout/back-button';

const driveSchema = z.object({
  vaccineType: z.string().min(1, 'Vaccine type is required.'),
  location: z.string().min(1, 'Location is required.'),
  schedule: z.string().min(1, 'Schedule must be a valid date string.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

export default function ManageVaccinationDrivesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const drivesRef = useMemoFirebase(() => collection(firestore, 'vaccinationDrives'), [firestore]);
  const { data: drives, isLoading } = useCollection(drivesRef);

  const form = useForm<z.infer<typeof driveSchema>>({
    resolver: zodResolver(driveSchema),
    defaultValues: {
      vaccineType: '',
      location: '',
      schedule: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof driveSchema>) => {
    setIsSubmitting(true);
    try {
        const newDocRef = doc(drivesRef);
        await addDocumentNonBlocking(drivesRef, {
            ...values,
            id: newDocRef.id,
        });
        toast({ title: "Vaccination Drive Added", description: `${values.vaccineType} drive has been scheduled.` });
        form.reset();
    } catch (error) {
        // Errors are handled globally by the non-blocking function
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = (driveId: string) => {
    const docRef = doc(drivesRef, driveId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Drive Deleted', variant: 'destructive' });
  };

  const DriveSkeleton = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
            </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
        <BackButton />
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Syringe className="h-6 w-6"/>
                        <CardTitle>Manage Vaccination Drives</CardTitle>
                    </div>
                    <CardDescription>
                        Add, view, and remove vaccination drives from the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="vaccineType" render={({ field }) => (<FormItem><FormLabel>Vaccine Type</FormLabel><FormControl><Input placeholder="e.g., COVID-19 Booster" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Community Hall, Sec-15" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <FormField control={form.control} name="schedule" render={({ field }) => (<FormItem><FormLabel>Schedule</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the drive, eligibility, and requirements..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <Button type="submit" disabled={isSubmitting}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                {isSubmitting ? 'Adding Drive...' : 'Add Drive'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Drives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? <DriveSkeleton /> : drives && drives.length > 0 ? (
                        drives.map(drive => (
                            <Card key={drive.id} className="p-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{drive.vaccineType}</h3>
                                        <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{drive.location}</p>
                                            <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(drive.schedule).toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm mt-2">{drive.description}</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the vaccination drive. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(drive.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground">No drives found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
