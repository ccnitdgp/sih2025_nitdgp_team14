
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AtSign, Cake, Droplet, Phone, User as UserIcon, Users, Home, Pencil, X } from 'lucide-react';
import { differenceInYears, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits."),
  address: z.string().min(1, "Address is required."),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
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

export default function PatientProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc(userDocRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        dateOfBirth: userProfile.dateOfBirth?.toDate ? userProfile.dateOfBirth.toDate() : new Date(),
        gender: userProfile.gender || '',
        bloodGroup: userProfile.bloodGroup || '',
        phoneNumber: userProfile.phoneNumber || '',
        address: userProfile.address || '',
        emergencyContactName: userProfile.emergencyContact?.name || '',
        emergencyContactPhone: userProfile.emergencyContact?.phone || '',
        emergencyContactRelation: userProfile.emergencyContact?.relation || '',
      });
    }
  }, [userProfile, form]);
  
  const getAge = (dob) => {
    if (!dob) return null;
    const date = dob.toDate ? dob.toDate() : new Date(dob);
    try {
      return differenceInYears(new Date(), date);
    } catch (e) {
      return null;
    }
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!userDocRef) return;
    
    const updatedData = {
        ...values,
        emergencyContact: {
            name: values.emergencyContactName,
            phone: values.emergencyContactPhone,
            relation: values.emergencyContactRelation
        }
    };
    // remove the separate emergency contact fields
    delete updatedData.emergencyContactName;
    delete updatedData.emergencyContactPhone;
    delete updatedData.emergencyContactRelation;

    updateDocumentNonBlocking(userDocRef, updatedData);
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
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
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
    <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="text-center mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                Patient Profile
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Your complete health and contact information.
            </p>
        </div>

        {isLoading ? <ProfileSkeleton /> : (
            userProfile ? (
              <>
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <Avatar className="h-32 w-32 border-4 border-primary">
                            <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/200`} data-ai-hint="profile photo" />
                            <AvatarFallback className="text-5xl">
                                {userProfile?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold">{userProfile.firstName} {userProfile.lastName}</h2>
                            <p className="text-muted-foreground">{user?.email}</p>
                            {userProfile.dateOfBirth && <p className="text-muted-foreground">{getAge(userProfile.dateOfBirth)} years old</p>}
                        </div>
                    </div>
                    <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'destructive' : 'outline'}>
                        {isEditing ? <><X className="mr-2 h-4 w-4" />Cancel</> : <><Pencil className="mr-2 h-4 w-4" />Edit Profile</>}
                    </Button>
                </div>

                {isEditing ? (
                  <Card>
                    <CardHeader><CardTitle>Edit Your Profile</CardTitle></CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           </div>
                           <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="bloodGroup" render={({ field }) => (<FormItem><FormLabel>Blood Group</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem><SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem><SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem><SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                           </div>
                           <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

                           <div>
                            <FormLabel>Emergency Contact</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                                <FormField control={form.control} name="emergencyContactName" render={({ field }) => (<FormItem><FormControl><Input placeholder="Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (<FormItem><FormControl><Input type="tel" placeholder="Phone" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="emergencyContactRelation" render={({ field }) => (<FormItem><FormControl><Input placeholder="Relation" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                           </div>
                           <div className="flex justify-end pt-4">
                            <Button type="submit">Save Changes</Button>
                           </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <Card>
                        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <ProfileDetail icon={UserIcon} label="Full Name" value={`${userProfile.firstName} ${userProfile.lastName}`} />
                            <ProfileDetail icon={Cake} label="Date of Birth" value={userProfile.dateOfBirth?.toDate ? userProfile.dateOfBirth.toDate().toLocaleDateString() : 'Not Provided'} />
                            <ProfileDetail icon={Users} label="Gender" value={userProfile.gender} />
                            <ProfileDetail icon={Droplet} label="Blood Group" value={userProfile.bloodGroup} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <ProfileDetail icon={Phone} label="Phone Number" value={userProfile.phoneNumber} />
                            <ProfileDetail icon={AtSign} label="Email Address" value={user?.email} />
                            <ProfileDetail icon={Home} label="Full Address" value={userProfile.address} />
                             {userProfile.emergencyContact?.name && (
                                <div className="flex items-start gap-4">
                                    <Users className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                                        <p className="font-semibold">{userProfile.emergencyContact.name} ({userProfile.emergencyContact.relation})</p>
                                        <p className="text-sm font-semibold">{userProfile.emergencyContact.phone}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                      </Card>
                  </div>
                )}
              </>
            ) : (
                 <Card className="text-center p-8">
                    <CardTitle>Profile Not Found</CardTitle>
                    <CardDescription>We couldn't load your profile data. Please create a profile or try again later.</CardDescription>
                </Card>
            )
        )}
    </div>
  );
}
