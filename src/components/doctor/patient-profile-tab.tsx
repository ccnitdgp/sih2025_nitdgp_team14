
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AtSign, Cake, Droplet, Home, Phone, User as UserIcon, Users, HeartPulse, Scale, TrendingUp, Activity, Droplets } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileDetail = ({ icon: Icon, label, value, description }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start gap-4">
      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-semibold whitespace-pre-wrap">{value}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
};

const ProfileSkeleton = () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-7">
        <div className='md:col-span-4 space-y-8'>
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
             <Card>
                <CardHeader>
                <CardTitle>Contact & Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {[...Array(3)].map((_, i) => (
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
        <div className="md:col-span-3 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Health Metrics</CardTitle>
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
        </div>
    </div>
);


export function PatientProfileTab({ patientId, patientProfile, isLoading }) {
  
  const getAge = (dob) => {
    if (!dob) return null;
    const date = dob.toDate ? dob.toDate() : new Date(dob);
    try {
      return differenceInYears(new Date(), date);
    } catch (e) {
      return null;
    }
  };

  const calculateBmi = () => {
      const height = patientProfile?.healthMetrics?.height;
      const weight = patientProfile?.healthMetrics?.weight;
      if (height && weight) {
          const heightInMeters = height / 100;
          const bmi = weight / (heightInMeters * heightInMeters);
          return bmi.toFixed(1);
      }
      return null;
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!patientProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load profile data for this patient.</p>
        </CardContent>
      </Card>
    )
  }

  const { medicalDetails } = patientProfile;

  return (
     <div className="grid grid-cols-1 gap-8 md:grid-cols-7">
        <div className='md:col-span-4 space-y-8'>
            <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <ProfileDetail icon={UserIcon} label="Full Name" value={`${patientProfile.firstName} ${patientProfile.lastName}`} />
                <ProfileDetail icon={Cake} label="Age" value={getAge(patientProfile.dateOfBirth) ? `${getAge(patientProfile.dateOfBirth)} years old` : 'Not Provided'} />
                <ProfileDetail icon={Users} label="Gender" value={patientProfile.gender || 'N/A'} />
                <ProfileDetail icon={Droplet} label="Blood Group" value={patientProfile.bloodGroup || 'N/A'} />
            </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Key Medical Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <ProfileDetail icon={HeartPulse} label="Existing Conditions" value={medicalDetails?.existingMedicalConditions || 'None reported'} />
                    <ProfileDetail icon={HeartPulse} label="Known Allergies" value={medicalDetails?.knownAllergies || 'None reported'} />
                    <ProfileDetail icon={Users} label="Family Medical History" value={medicalDetails?.familyMedicalHistory || 'None reported'} />
                    <ProfileDetail icon={HeartPulse} label="Disabilities" value={medicalDetails?.disabilities || 'None reported'} />
                </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Contact & Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <ProfileDetail icon={Phone} label="Phone Number" value={patientProfile.phoneNumber || 'N/A'} />
                <ProfileDetail icon={AtSign} label="Email Address" value={patientProfile.email} />
                <ProfileDetail icon={Home} label="Full Address" value={`${patientProfile.address?.fullAddress || ''}, ${patientProfile.address?.city || ''}, ${patientProfile.address?.state || ''}, ${patientProfile.address?.country || ''} - ${patientProfile.address?.pinCode || ''}`.replace(/, , /g, ', ').replace(/^, |, $/g, '').replace(/ - $/g, '') || 'N/A'} />
                {patientProfile.emergencyContact?.name && (
                    <div className="flex items-start gap-4">
                        <Users className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                            <p className="font-semibold">{patientProfile.emergencyContact.name} ({patientProfile.emergencyContact.relation})</p>
                            <p className="text-sm font-semibold">{patientProfile.emergencyContact.phone}</p>
                        </div>
                    </div>
                )}
            </CardContent>
            </Card>
        </div>
        <div className="md:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>Health Metrics</CardTitle>
                    <CardDescription>Patient's last recorded metrics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ProfileDetail icon={Scale} label="Height" value={patientProfile.healthMetrics?.height ? `${patientProfile.healthMetrics.height} cm` : 'N/A'} />
                    <ProfileDetail icon={Scale} label="Weight" value={patientProfile.healthMetrics?.weight ? `${patientProfile.healthMetrics.weight} kg` : 'N/A'} />
                    <ProfileDetail icon={TrendingUp} label="Body Mass Index (BMI)" value={calculateBmi() || 'N/A'} />
                    <ProfileDetail icon={Activity} label="Blood Pressure" value={patientProfile.healthMetrics?.bloodPressure || 'N/A'} description="Last reading" />
                    <ProfileDetail icon={Droplets} label="Blood Sugar" value={patientProfile.healthMetrics?.bloodSugar ? `${patientProfile.healthMetrics.bloodSugar} mg/dL` : 'N/A'} description="Fasting" />
                    <ProfileDetail icon={HeartPulse} label="Pulse Rate" value={patientProfile.healthMetrics?.pulseRate ? `${patientProfile.healthMetrics.pulseRate} bpm` : 'N/A'} description="Resting" />
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
