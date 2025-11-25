
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AtSign, Cake, Droplet, Heart, Home, Phone, User as UserIcon, Users } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc(userDocRef);

  const getAge = (dob) => {
    if (!dob) return null;
    // Firestore Timestamps need to be converted to JS Dates
    const date = dob.toDate ? dob.toDate() : new Date(dob);
    try {
      return differenceInYears(new Date(), date);
    } catch (e) {
      return null;
    }
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
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(5)].map((_, i) => (
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
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
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
    </div>
  );

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                Patient Profile
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Your complete health and contact information.
            </p>
        </div>

        {isLoading ? <ProfileSkeleton /> : (
            userProfile ? (
                <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-lg border">
                    <Avatar className="h-32 w-32 border-4 border-primary">
                    <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/200`} data-ai-hint="profile photo" />
                    <AvatarFallback className="text-5xl">
                        {userProfile?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold">{userProfile.firstName} {userProfile.lastName}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    {userProfile.dateOfBirth && <p className="text-muted-foreground">{getAge(userProfile.dateOfBirth)} years old</p>}
                    {userProfile.role && <Badge variant="outline" className="mt-2 text-base font-semibold">{userProfile.role}</Badge>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ProfileDetail icon={UserIcon} label="Full Name" value={`${userProfile.firstName} ${userProfile.lastName}`} />
                        <ProfileDetail icon={Cake} label="Date of Birth" value={userProfile.dateOfBirth?.toDate ? userProfile.dateOfBirth.toDate().toLocaleDateString() : 'Not Provided'} />
                        <ProfileDetail icon={Users} label="Gender" value={userProfile.gender} />
                        <ProfileDetail icon={Droplet} label="Blood Group" value={userProfile.bloodGroup} />
                        <ProfileDetail icon={Heart} label="Marital Status" value={userProfile.maritalStatus} />
                    </CardContent>
                    </Card>

                    <Card>
                    <CardHeader>
                        <CardTitle>Contact Details</CardTitle>
                    </CardHeader>
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
                </div>
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

    