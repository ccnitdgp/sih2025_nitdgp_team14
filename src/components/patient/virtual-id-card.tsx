
'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { format } from 'date-fns';


const IdField = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value || 'N/A'}</p>
  </div>
);

const IdFieldSmall = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-gray-500">{label}</p>
    <p className="text-xs font-mono text-gray-700">{value}</p>
  </div>
);

const BackField = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-blue-800">{label}</p>
    <p className="text-xs text-gray-600">{value}</p>
  </div>
);


const VirtualIdCardFront = ({ user, userProfile, t }) => {
    const qrCodeUrl = typeof window !== 'undefined' ? `${window.location.origin}/doctor-dashboard/patient/${user.uid}` : '';

    return (
        <div className="w-full h-[280px] bg-white rounded-lg p-4 border-2 border-gray-300 flex flex-col justify-between">
             <div className="flex justify-between items-start border-b-2 border-gray-200 pb-2">
                <Logo className="scale-90 -ml-2" />
                <div className="text-right">
                     <p className="font-bold text-sm text-gray-700">{userProfile.firstName} {userProfile.lastName}</p>
                    <p className="text-xs text-gray-500">{userProfile.patientId || 'N/A'}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex flex-col items-center col-span-1">
                     <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarImage src={user?.photoURL ?? ''} />
                        <AvatarFallback className="text-3xl">{userProfile?.firstName?.charAt(0).toUpperCase() ?? 'P'}</AvatarFallback>
                    </Avatar>
                </div>
                 <div className="col-span-2 space-y-2">
                    <IdField label={t('id_card_dob', 'Date of Birth')} value={userProfile.dateOfBirth?.toDate ? format(userProfile.dateOfBirth.toDate(), 'dd/MM/yyyy') : 'N/A'} />
                    <IdField label={t('id_card_gender', 'Gender')} value={userProfile.gender} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 items-center">
                 <div className="col-span-2 space-y-2">
                     <IdField label={t('id_card_issue_date', 'Date of Issue')} value="01/01/2024" />
                </div>
                <div className="col-span-1 flex justify-center items-center h-full">
                    <div className="bg-white p-1 rounded-sm border">
                         <QRCode value={qrCodeUrl} size={64} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const VirtualIdCardBack = ({ userProfile, t }) => (
    <div className="w-full h-[280px] bg-white rounded-lg p-3 border-2 border-gray-300 text-sm leading-tight text-gray-700 flex flex-col justify-between">
        <div className="text-center border-b pb-2">
            <h4 className="font-bold text-base text-primary">{t('id_card_back_important_info', 'Important Information')}</h4>
        </div>
        
        <div className="mt-2 space-y-3 flex-grow">
            <div>
                <p className="font-semibold text-xs text-muted-foreground">{t('id_card_back_emergency_text_title', 'In case of emergency, please call:')}</p>
                <p className="text-base font-bold">{userProfile?.emergencyContact?.phone || t('id_card_back_no_contact', 'Not Provided')}</p>
                <p className="text-xs text-muted-foreground">({userProfile?.emergencyContact?.relation || 'Emergency Contact'})</p>
            </div>

            <div className="border-t pt-2">
                <p className="font-semibold text-xs text-muted-foreground">{t('id_card_back_user_address', 'Registered Address:')}</p>
                <p className="text-xs">{userProfile?.address?.fullAddress || t('id_card_back_no_address', 'No address on file.')}</p>
                 <p className="text-xs">{userProfile?.address?.cityStateCountry}</p>
            </div>
        </div>

        <div className="text-center text-[10px] text-muted-foreground mt-2 pt-2 border-t">
            {t('id_card_back_is_not_insurance', 'This is not an insurance card.')}
        </div>
    </div>
);


export function VirtualIdCard({ user, userProfile, t }) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!userProfile || !user) {
      return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                 <Skeleton className="h-8 w-3/4" />
                 <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-44 w-full" />
                 <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
      )
  }

  return (
    <Card className="shadow-sm w-full max-w-lg mx-auto">
        <CardContent className="pt-6 relative">
             <div className="relative" style={{ perspective: '1000px' }}>
                <div 
                    className="relative w-full transition-transform duration-700"
                    style={{
                        height: '280px',
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    <div className="absolute w-full h-full top-0 left-0" style={{backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'}}>
                         <VirtualIdCardFront user={user} userProfile={userProfile} t={t}/>
                    </div>
                     <div className="absolute w-full h-full top-0 left-0 [transform:rotateY(180deg)]" style={{backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'}}>
                        <VirtualIdCardBack userProfile={userProfile} t={t}/>
                    </div>
                </div>
            </div>

            <Button onClick={() => setIsFlipped(!isFlipped)} variant="outline" className="w-full mt-4">
                <RotateCw className="mr-2 h-4 w-4" />
                {isFlipped ? t('show_front_button', 'Show Front') : t('show_back_button', 'Show Back')}
            </Button>
        </CardContent>
    </Card>
  );
}
