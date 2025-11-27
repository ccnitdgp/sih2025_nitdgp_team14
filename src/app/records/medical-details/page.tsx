
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
import { HeartPulse, Save, Pencil, X, ShieldAlert, Users, Accessibility } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const medicalDetailsSchema = z.object({
  disabilities: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  knownAllergies: z.string().optional(),
  existingMedicalConditions: z.string().optional(),
});

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
            <h4 className="font-semibold text-foreground">{label}</h4>
            <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{value || 'None reported'}</p>
        </div>
    </div>
);


export default function MedicalDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc(userDocRef);

  const form = useForm<z.infer<typeof medicalDetailsSchema>>({
    resolver: zodResolver(medicalDetailsSchema),
    defaultValues: {
        disabilities: '',
        familyMedicalHistory: '',
        knownAllergies: '',
        existingMedicalConditions: '',
    }
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
    setIsEditing(false);
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
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <div className="flex items-center gap-3">
            <HeartPulse className="h-6 w-6" />
            <CardTitle className="text-2xl">Medical Details</CardTitle>
            </div>
            <CardDescription>
            Provide details about your health for a more comprehensive medical record. This information is confidential.
            </CardDescription>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="icon">
            {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            <span className="sr-only">{isEditing ? 'Cancel' : 'Edit'}</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
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
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            <Save className="mr-2 h-4 w-4" />
                            {form.formState.isSubmitting ? "Saving..." : "Save Details"}
                        </Button>
                    </div>
                </form>
            </Form>
        ) : (
            <div className="space-y-8">
                <DetailItem icon={HeartPulse} label="Existing Medical Conditions" value={userProfile?.medicalDetails?.existingMedicalConditions} />
                <DetailItem icon={ShieldAlert} label="Known Allergies" value={userProfile?.medicalDetails?.knownAllergies} />
                <DetailItem icon={Accessibility} label="Disabilities" value={userProfile?.medicalDetails?.disabilities} />
                <DetailItem icon={Users} label="Family Medical History" value={userProfile?.medicalDetails?.familyMedicalHistory} />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
