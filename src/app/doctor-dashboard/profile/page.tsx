
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AtSign, BriefcaseMedical, Building, Phone, User as UserIcon, Pencil, X, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits."),
  specialty: z.string().min(1, "Specialty is required."),
  clinic: z.string().min(1, "Clinic/Hospital is required."),
});


const ProfileDetail = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default function DoctorProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const doctorPublicProfileRef = useMemoFirebase(() => {
    if(!user || !firestore) return null;
    return doc(firestore, 'doctors', user.uid)
  }, [user, firestore])

  const { data: userProfile, isLoading } = useDoc(userDocRef);
  const { data: publicProfile } = useDoc(doctorPublicProfileRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (userProfile && publicProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phoneNumber: userProfile.phoneNumber || '',
        specialty: publicProfile.specialty || 'General Physician',
        clinic: publicProfile.clinic || 'Swasthya General Hospital',
      });
    }
  }, [userProfile, publicProfile, form, isEditing]);

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!userDocRef || !doctorPublicProfileRef) return;

    const privateProfileUpdate = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
    };
    
    const publicProfileUpdate = {
        firstName: values.firstName,
        lastName: values.lastName,
        specialty: values.specialty,
        clinic: values.clinic,
    }

    updateDocumentNonBlocking(userDocRef, privateProfileUpdate);
    updateDocumentNonBlocking(doctorPublicProfileRef, publicProfileUpdate);

    toast({ title: 'Profile Updated', description: 'Your changes have been saved successfully.' });
    setIsEditing(false);
  };


  const ProfileSkeleton = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-lg border">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="space-y-2 text-center md:text-left">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Professional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className='w-full space-y-2'>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                Doctor Profile
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Your professional and contact information.
            </p>
        </div>

        {isLoading ? <ProfileSkeleton /> : (
            userProfile ? (
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-card rounded-lg border">
                        <div className="flex items-center gap-6 text-center md:text-left">
                            <Avatar className="h-32 w-32 border-4 border-primary">
                            <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/doc-profile/200`} />
                            <AvatarFallback className="text-5xl">
                                {userProfile?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                            <h2 className="text-3xl font-bold">Dr. {userProfile.firstName} {userProfile.lastName}</h2>
                            <p className="text-muted-foreground">{user?.email}</p>
                            <Badge variant="secondary" className="mt-2 text-base font-semibold">{publicProfile?.specialty || 'General Physician'}</Badge>
                            </div>
                        </div>
                        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"} size="sm">
                             {isEditing ? <X className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isEditing ? (
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="specialty" render={({ field }) => (<FormItem><FormLabel>Specialty</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                      <FormField control={form.control} name="clinic" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Primary Clinic/Hospital</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                  </div>
                                  <div className="flex justify-end">
                                      <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Changes</Button>
                                  </div>
                                </form>
                              </Form>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <ProfileDetail icon={UserIcon} label="Full Name" value={`Dr. ${userProfile.firstName} ${userProfile.lastName}`} />
                              <ProfileDetail icon={BriefcaseMedical} label="Specialty" value={publicProfile?.specialty || 'General Physician'} />
                              <ProfileDetail icon={AtSign} label="Email Address" value={user?.email} />
                              <ProfileDetail icon={Phone} label="Contact Number" value={userProfile.phoneNumber} />
                              <ProfileDetail icon={Building} label="Primary Clinic/Hospital" value={publicProfile?.clinic || 'Swasthya General Hospital'} />
                            </div>
                          )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                 <Card className="text-center p-8">
                    <CardTitle>Profile Not Found</CardTitle>
                    <CardDescription>We couldn't load your profile data. Please try again later.</CardDescription>
                </Card>
            )
        )}
    </div>
  );
}
