
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
import { Tent, PlusCircle, Trash2, CalendarDays, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BackButton } from '@/components/layout/back-button';

const campSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  location: z.string().min(1, 'Location is required.'),
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
  availableServices: z.string().min(10, 'Services must be at least 10 characters.'),
});

export default function ManageHealthCampsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const campsRef = useMemoFirebase(() => collection(firestore, 'healthCamps'), [firestore]);
  const { data: camps, isLoading } = useCollection(campsRef);

  const form = useForm<z.infer<typeof campSchema>>({
    resolver: zodResolver(campSchema),
    defaultValues: {
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      availableServices: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof campSchema>) => {
    setIsSubmitting(true);
    try {
        const newDocRef = doc(campsRef);
        await addDocumentNonBlocking(campsRef, {
            ...values,
            id: newDocRef.id,
        });
        toast({ title: "Health Camp Added", description: `The camp at ${values.location} has been scheduled.` });
        form.reset();
    } catch (error) {
        // Errors handled globally
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = (campId: string) => {
    const docRef = doc(campsRef, campId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Camp Deleted', variant: 'destructive' });
  };

  const CampSkeleton = () => (
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
                    <Tent className="h-6 w-6"/>
                    <CardTitle>Manage Health Camps</CardTitle>
                </div>
                <CardDescription>
                    Add, view, and remove health camps available to the public.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Camp Name / Title</FormLabel><FormControl><Input placeholder="e.g., General Health Check-up Camp" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Sector 18 Community Center" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="availableServices" render={({ field }) => (<FormItem><FormLabel>Available Services (comma separated)</FormLabel><FormControl><Textarea placeholder="e.g., Blood pressure check, Sugar test, General consultation..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" disabled={isSubmitting}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            {isSubmitting ? 'Adding Camp...' : 'Add Health Camp'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Existing Camps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? <CampSkeleton /> : camps && camps.length > 0 ? (
                    camps.map(camp => (
                        <Card key={camp.id} className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{camp.description}</h3>
                                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{camp.location}</p>
                                        <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(camp.startTime).toLocaleString()} - {new Date(camp.endTime).toLocaleTimeString()}</p>
                                    </div>
                                    <p className="text-sm mt-2"><strong>Services:</strong> {camp.availableServices}</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the health camp. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(camp.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground">No camps found.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
