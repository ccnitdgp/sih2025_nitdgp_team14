
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { HeartPulse, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const medicalDetailsSchema = z.object({
  disabilities: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  knownAllergies: z.string().optional(),
  existingMedicalConditions: z.string().optional(),
});

export default function MedicalDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc(userDocRef);

  const form = useForm<z.infer<typeof medicalDetailsSchema>>({
    resolver: zodResolver(medicalDetailsSchema),
  });

  useEffect(() => {
    if (userProfile?.medicalDetails) {
      form.reset({
        disabilities: userProfile.medicalDetails.disabilities || '',
        familyMedicalHistory: userProfile.medicalDetails.familyMedicalHistory || '',
        knownAllergies: userProfile.medicalDetails.knownAllergies || '',
        existingMedicalConditions: userProfile.medicalDetails.existingMedicalConditions || '',
      });
    }
  }, [userProfile, form]);
  
  const onSubmit = (values: z.infer<typeof medicalDetailsSchema>) => {
    if (!userDocRef) return;
    
    updateDocumentNonBlocking(userDocRef, { medicalDetails: values });
    toast({ title: 'Medical Details Updated', description: 'Your information has been saved successfully.' });
  };
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ))}
                <Skeleton className="h-10 w-32" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <HeartPulse className="h-6 w-6" />
          <CardTitle className="text-2xl">Medical Details</CardTitle>
        </div>
        <CardDescription>
          Provide details about your health for a more comprehensive medical record. This information is confidential.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                    control={form.control}
                    name="existingMedicalConditions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Existing Medical Conditions</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Type 2 Diabetes, Hypertension, Asthma" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="knownAllergies"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Known Allergies</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Penicillin, Peanuts, Pollen" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="disabilities"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Disabilities (if any)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Hearing impairment, Mobility challenges" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="familyMedicalHistory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Family Medical History</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., History of heart disease (Father), Diabetes (Mother)" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? "Saving..." : "Save Details"}
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    