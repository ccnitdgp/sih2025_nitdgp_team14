
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
import { AtSign, BriefcaseMedical, Building, Phone, User as UserIcon, Pencil, X, Save, Star, Activity, Languages, GraduationCap, FileBadge, Calendar, Clock, BookText, Stethoscope, Wallet, Globe, Video, ShieldCheck, FilePen, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { VerificationCenter } from '@/components/doctor/verification-center';
import { BackButton } from '@/components/layout/back-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits."),
  languagesKnown: z.string().optional(),
  biography: z.string().optional(),
  
  specialty: z.string().min(1, "Specialty is required."),
  qualifications: z.string().optional(),
  licenseNumber: z.string().optional(),
  yearsOfExperience: z.coerce.number().optional(),
  designation: z.string().optional(),
  clinic: z.string().min(1, "Clinic/Hospital is required."),
  
  registrationNumber: z.string().optional(),
  issuingCouncil: z.string().optional(),
  issuedYear: z.coerce.number().optional(),

  treatmentsAndProcedures: z.string().optional(),
  conditionsHandled: z.string().optional(),
  teleconsultation: z.boolean().default(false),

  workingHours: z.string().optional(),
  availableDays: z.string().optional(),
  appointmentDuration: z.coerce.number().optional(),

  clinicFee: z.coerce.number().optional(),
  onlineFee: z.coerce.number().optional(),
});


const ProfileDetail = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-semibold whitespace-pre-wrap">{value}</p>
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

  const { data: userProfile, isLoading: isUserLoading } = useDoc(userDocRef);
  const { data: publicProfile, isLoading: isPublicLoading } = useDoc(doctorPublicProfileRef);

  const isLoading = isUserLoading || isPublicLoading;

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      languagesKnown: '',
      biography: '',
      specialty: '',
      qualifications: '',
      licenseNumber: '',
      yearsOfExperience: '' as any,
      designation: '',
      clinic: '',
      registrationNumber: '',
      issuingCouncil: '',
      issuedYear: '' as any,
      treatmentsAndProcedures: '',
      conditionsHandled: '',
      teleconsultation: false,
      workingHours: '',
      availableDays: '',
      appointmentDuration: '' as any,
      clinicFee: '' as any,
      onlineFee: '' as any,
    }
  });

  useEffect(() => {
    if (userProfile && publicProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phoneNumber: userProfile.phoneNumber || '',
        languagesKnown: (publicProfile.languagesKnown || []).join(', '),
        biography: publicProfile.biography || '',

        specialty: publicProfile.specialty || '',
        qualifications: publicProfile.qualifications || '',
        licenseNumber: publicProfile.licenseNumber || '',
        yearsOfExperience: publicProfile.yearsOfExperience || '',
        designation: publicProfile.designation || '',
        clinic: publicProfile.clinic || '',
        
        registrationNumber: publicProfile.registrationDetails?.registrationNumber || '',
        issuingCouncil: publicProfile.registrationDetails?.issuingCouncil || '',
        issuedYear: publicProfile.registrationDetails?.issuedYear || '',

        treatmentsAndProcedures: publicProfile.treatmentsAndProcedures || '',
        conditionsHandled: publicProfile.conditionsHandled || '',
        teleconsultation: publicProfile.teleconsultation || false,

        workingHours: publicProfile.availability?.workingHours || '',
        availableDays: publicProfile.availability?.availableDays || '',
        appointmentDuration: publicProfile.availability?.appointmentDuration || '',

        clinicFee: publicProfile.pricing?.clinicFee || '',
        onlineFee: publicProfile.pricing?.onlineFee || '',
      });
    }
  }, [userProfile, publicProfile, form, isEditing]);

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!userDocRef || !doctorPublicProfileRef || !user) return;

    const privateProfileUpdate = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        specialty: values.specialty,
    };
    
    const publicProfileUpdate = {
        id: user.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        specialty: values.specialty,
        clinic: values.clinic,
        biography: values.biography,
        qualifications: values.qualifications,
        licenseNumber: values.licenseNumber,
        yearsOfExperience: values.yearsOfExperience || null,
        designation: values.designation,
        registrationDetails: {
            registrationNumber: values.registrationNumber,
            issuingCouncil: values.issuingCouncil,
            issuedYear: values.issuedYear || null
        },
        treatmentsAndProcedures: values.treatmentsAndProcedures,
        conditionsHandled: values.conditionsHandled,
        teleconsultation: values.teleconsultation,
        languagesKnown: values.languagesKnown?.split(',').map(lang => lang.trim()).filter(Boolean),
        availability: {
            workingHours: values.workingHours,
            availableDays: values.availableDays,
            appointmentDuration: values.appointmentDuration || null,
        },
        pricing: {
            clinicFee: values.clinicFee || null,
            onlineFee: values.onlineFee || null,
        },
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
    <div className="container mx-auto max-w-5xl px-6 py-12">
        <BackButton />
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                Doctor Profile
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Manage your professional and contact information and verify your credentials.
            </p>
        </div>

        {isLoading ? <ProfileSkeleton /> : (
            userProfile ? (
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-card rounded-lg border">
                        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            <Avatar className="h-32 w-32 border-4 border-primary">
                            <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/doc-profile/200`} />
                            <AvatarFallback className="text-5xl">
                                {userProfile?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-3xl font-bold">Dr. {userProfile.firstName} {userProfile.lastName}</h2>
                                    {publicProfile?.isVerified ? (
                                        <Badge className="bg-green-500 hover:bg-green-600"><ShieldCheck className="mr-1 h-4 w-4" />Verified</Badge>
                                    ) : (
                                         <Badge variant="destructive">Not Verified</Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground">{user?.email}</p>
                                <Badge variant="secondary" className="mt-2 text-base font-semibold">{publicProfile?.specialty || 'General Physician'}</Badge>
                            </div>
                        </div>
                        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"} size="sm">
                             {isEditing ? <X className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </Button>
                    </div>

                    {isEditing ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon/> Basic Information</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                        <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="languagesKnown" render={({ field }) => (<FormItem><FormLabel>Languages Known (comma-separated)</FormLabel><FormControl><Input placeholder="e.g. English, Hindi, Marathi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="biography" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Biography / About</FormLabel><FormControl><Textarea placeholder="A brief introduction about yourself..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>

                                 <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><BriefcaseMedical/> Professional Details</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                         <FormField control={form.control} name="specialty" render={({ field }) => (<FormItem><FormLabel>Specialization</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="designation" render={({ field }) => (<FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="e.g. Senior Consultant" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="qualifications" render={({ field }) => (<FormItem><FormLabel>Qualifications</FormLabel><FormControl><Input placeholder="e.g. MBBS, MD" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="yearsOfExperience" render={({ field }) => (<FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="licenseNumber" render={({ field }) => (<FormItem><FormLabel>Medical License Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="clinic" render={({ field }) => (<FormItem><FormLabel>Primary Clinic/Hospital</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><FilePen/> Registration Details</CardTitle>
                                        <CardDescription>Details for online verification. This information will be cross-checked with the official medical council registry.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                                         <FormField control={form.control} name="registrationNumber" render={({ field }) => (<FormItem><FormLabel>Registration Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="issuingCouncil" render={({ field }) => (<FormItem><FormLabel>Issuing Council (e.g. NMC)</FormLabel><FormControl><Input placeholder="National Medical Commission" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="issuedYear" render={({ field }) => (<FormItem><FormLabel>Year of Issue</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope/> Expertise & Services</CardTitle></CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                         <FormField control={form.control} name="conditionsHandled" render={({ field }) => (<FormItem><FormLabel>Conditions Handled (comma-separated)</FormLabel><FormControl><Textarea placeholder="e.g. Diabetes, Hypertension" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="treatmentsAndProcedures" render={({ field }) => (<FormItem><FormLabel>Treatments & Procedures (comma-separated)</FormLabel><FormControl><Textarea placeholder="e.g. ECG, Nebulization" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField
                                            control={form.control}
                                            name="teleconsultation"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Enable Teleconsultation</FormLabel>
                                                        <FormDescription>
                                                            Allow patients to book virtual appointments with you.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Calendar/> Scheduling & Availability</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                                         <FormField control={form.control} name="availableDays" render={({ field }) => (<FormItem><FormLabel>Available Days</FormLabel><FormControl><Input placeholder="e.g. Mon - Fri, Sun" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="workingHours" render={({ field }) => (<FormItem><FormLabel>Working Hours</FormLabel><FormControl><Input placeholder="e.g. 9 AM - 5 PM" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="appointmentDuration" render={({ field }) => (<FormItem><FormLabel>Appointment Duration (mins)</FormLabel><FormControl><Input type="number" placeholder="15" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Wallet/> Pricing</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                         <FormField control={form.control} name="clinicFee" render={({ field }) => (<FormItem><FormLabel>In-Clinic Consultation Fee (Rs.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="onlineFee" render={({ field }) => (<FormItem><FormLabel>Online Consultation Fee (Rs.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                                
                                <div className="flex justify-end">
                                    <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Changes</Button>
                                </div>
                            </form>
                        </Form>
                    ) : (
                        <>
                             <Alert variant="default" className="mb-8">
                                <ShieldCheck className="h-4 w-4" />
                                <AlertTitle>How Verification Works</AlertTitle>
                                <AlertDescription>
                                To get a 'Verified' badge, please ensure your registration details are accurate and all required documents are uploaded. Our team will review your submission and check it against the official Indian Medical Register (IMR). Verification is required for your profile to be visible to patients.
                                </AlertDescription>
                            </Alert>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon/> Basic Information</CardTitle></CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                        <ProfileDetail icon={UserIcon} label="Full Name" value={`Dr. ${userProfile.firstName} ${userProfile.lastName}`} />
                                        <ProfileDetail icon={AtSign} label="Email Address" value={user?.email} />
                                        <ProfileDetail icon={Phone} label="Contact Number" value={userProfile.phoneNumber} />
                                        <ProfileDetail icon={Languages} label="Languages" value={(publicProfile.languagesKnown || []).join(', ')} />
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader><CardTitle className="flex items-center gap-2"><BookText/> About</CardTitle></CardHeader>
                                        <CardContent className="pt-6">
                                        <p className="text-muted-foreground">{publicProfile?.biography || 'No biography provided.'}</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader><CardTitle className="flex items-center gap-2"><BriefcaseMedical/> Professional Details</CardTitle></CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                        <ProfileDetail icon={BriefcaseMedical} label="Specialty" value={publicProfile?.specialty} />
                                        <ProfileDetail icon={GraduationCap} label="Qualifications" value={publicProfile?.qualifications} />
                                        <ProfileDetail icon={FileBadge} label="Medical License Number" value={publicProfile?.licenseNumber} />
                                        <ProfileDetail icon={Calendar} label="Years of Experience" value={publicProfile?.yearsOfExperience ? `${publicProfile.yearsOfExperience} years` : null} />
                                        <ProfileDetail icon={UserIcon} label="Designation" value={publicProfile?.designation} />
                                        <ProfileDetail icon={Building} label="Primary Clinic/Hospital" value={publicProfile?.clinic} />
                                        </CardContent>
                                    </Card>

                                     <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2"><FilePen/> Registration Details</CardTitle>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href="https://www.nmc.org.in/information-desk/indian-medical-register/" target="_blank" rel="noopener noreferrer">
                                                        Check IMR Online <ExternalLink className="ml-2 h-4 w-4"/>
                                                    </a>
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                            <ProfileDetail icon={FilePen} label="Registration Number" value={publicProfile?.registrationDetails?.registrationNumber} />
                                            <ProfileDetail icon={Building} label="Issuing Council" value={publicProfile?.registrationDetails?.issuingCouncil} />
                                            <ProfileDetail icon={Calendar} label="Year of Issue" value={publicProfile?.registrationDetails?.issuedYear} />
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope/> Expertise & Services</CardTitle></CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                        <ProfileDetail icon={Stethoscope} label="Conditions Handled" value={publicProfile?.conditionsHandled} />
                                        <ProfileDetail icon={Stethoscope} label="Treatments & Procedures" value={publicProfile?.treatmentsAndProcedures} />
                                        <ProfileDetail icon={Video} label="Teleconsultation" value={publicProfile?.teleconsultation ? 'Available' : 'Not Available'} />
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-8">
                                    <Card className="bg-muted/30 hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Calendar/> Availability</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-2">
                                        <div>
                                            <h4 className="font-semibold text-sm flex items-center gap-2"><Calendar className="h-4 w-4"/> Days</h4>
                                            <p className="font-bold text-lg text-primary">{publicProfile?.availability?.availableDays || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm flex items-center gap-2"><Clock className="h-4 w-4"/> Hours</h4>
                                            <p className="font-bold text-lg text-primary">{publicProfile?.availability?.workingHours || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm flex items-center gap-2"><Clock className="h-4 w-4"/> Duration</h4>
                                            <p className="font-bold text-lg text-primary">{publicProfile?.availability?.appointmentDuration ? `${publicProfile.availability.appointmentDuration} minutes` : 'Not specified'}</p>
                                        </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted/30 hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Wallet/> Pricing</CardTitle></CardHeader>
                                        <CardContent className="space-y-4 pt-2">
                                        <div>
                                            <h4 className="font-semibold text-sm">In-Clinic Fee</h4>
                                            <p className="font-bold text-lg text-primary">{publicProfile?.pricing?.clinicFee ? `Rs. ${publicProfile.pricing.clinicFee}` : 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm">Online Fee</h4>
                                            <p className="font-bold text-lg text-primary">{publicProfile?.pricing?.onlineFee ? `Rs. ${publicProfile.pricing.onlineFee}`: 'Not specified'}</p>
                                        </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <VerificationCenter 
                                publicProfile={publicProfile} 
                                doctorPublicProfileRef={doctorPublicProfileRef}
                            />
                        </>
                    )}
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

    