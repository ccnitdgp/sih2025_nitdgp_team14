
'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeartPulse, ShieldAlert, Users, Accessibility } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
            <h4 className="font-semibold text-foreground">{label}</h4>
            <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{value || 'None reported'}</p>
        </div>
    </div>
);

export function MedicalDetailsTab({ patientId, patientProfile, isLoading }: { patientId: string, patientProfile: any | null, isLoading: boolean }) {
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
  }

  const medicalDetails = patientProfile?.medicalDetails;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <HeartPulse className="h-6 w-6" />
          <CardTitle className="text-2xl">Medical Details</CardTitle>
        </div>
        <CardDescription>
          A patient-provided summary of key health information for quick reference.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {!medicalDetails || Object.values(medicalDetails).every(v => !v) ? (
             <p className="text-muted-foreground text-center py-4">No medical details provided by the patient.</p>
        ) : (
            <>
                <DetailItem icon={HeartPulse} label="Existing Medical Conditions" value={medicalDetails.existingMedicalConditions} />
                <DetailItem icon={ShieldAlert} label="Known Allergies" value={medicalDetails.knownAllergies} />
                <DetailItem icon={Accessibility} label="Disabilities" value={medicalDetails.disabilities} />
                <DetailItem icon={Users} label="Family Medical History" value={medicalDetails.familyMedicalHistory} />
            </>
        )}
      </CardContent>
    </Card>
  );
}
