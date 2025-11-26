
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
        <div className="w-full bg-white rounded-lg p-4 border-2 border-gray-300">
            <div className="flex justify-between items-start border-b-2 border-gray-200 pb-2">
                <Logo className="scale-90 -ml-2" />
                <div className="text-right">
                    <p className="font-bold text-sm text-gray-700">{t('health_plan_of_swasthya', 'Health Plan of Swasthya')}</p>
                    <p className="text-xs text-gray-500">{t('medicaid', 'Medicaid')}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex flex-col items-center col-span-1">
                     <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarImage src={user?.photoURL ?? ''} />
                        <AvatarFallback className="text-3xl">{userProfile?.firstName?.charAt(0).toUpperCase() ?? 'P'}</AvatarFallback>
                    </Avatar>
                </div>
                 <div className="col-span-2">
                    <IdField label={t('id_card_member', 'Member')} value={`${userProfile.firstName || ''} ${userProfile.lastName || 'SAMPLE ID'}`} />
                    <div className="mt-2">
                        <IdField label={t('id_card_member_id', 'Member ID')} value={user?.uid.substring(0, 11) + '-01' || '999999992-00'} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 items-center">
                 <div className="col-span-2 space-y-2">
                    <IdField label={t('id_card_dob', 'Date of Birth')} value={userProfile.dateOfBirth?.toDate ? format(userProfile.dateOfBirth.toDate(), 'dd/MM/yyyy') : 'N/A'} />
                    <IdField label={t('id_card_gender', 'Gender')} value={userProfile.gender} />
                </div>
                <div className="col-span-1 flex justify-center items-center h-full">
                    <div className="bg-white p-1 rounded-sm border">
                         <QRCode value={qrCodeUrl} size={64} />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end mt-2 text-xs text-gray-500 pt-2 border-t">
                <div>
                    <p>{t('id_card_issue_date', 'Date of Issue')}</p>
                    <p className="font-semibold text-gray-700">01/01/2024</p>
                </div>
                <p className="text-[10px]">{t('id_card_underwritten_by', 'Underwritten by Health Plan of Swasthya, Inc.')}</p>
            </div>
        </div>
    );
};

const VirtualIdCardBack = ({ t }) => (
    <div className="w-full bg-white rounded-lg p-3 border-2 border-gray-300 text-[11px] leading-tight text-gray-700">
        <p>{t('id_card_back_emergency_text', 'In a life-threatening emergency, call 911 or go to an emergency room.')}</p>
        <p className="mt-2">{t('id_card_back_disclaimer_text', 'Card does not guarantee coverage. Obtain prior authorization or verify benefits at')} <span className="text-blue-600 font-semibold">myHPNmedicaid.com</span> {t('or_call_member_services', 'or call Member Services.')}</p>

        <div className="grid grid-cols-2 gap-x-4 mt-2">
            <div className="space-y-1">
                <BackField label={t('id_card_back_member_services', 'Member Services:')} value="1-800-962-8074"/>
                <BackField label="TTY/TDD:" value="711"/>
                <BackField label={t('id_card_back_advice_nurse', '24 Hour Advice Nurse:')} value="1-800-288-2264"/>
                <BackField label={t('id_card_back_behavioral_health', 'Behavioral Health:')} value="1-800-873-2246"/>
            </div>
             <div className="space-y-1">
                <BackField label={t('id_card_back_virtual_visits', '24 Hour Virtual Visits:')} value="Download the NowClinic 7 app"/>
                <BackField label={t('id_card_back_mobile_medical', 'Mobile Medical Center:')} value="1-800-382-0870"/>
            </div>
        </div>

        <div className="mt-2 border-t-2 border-blue-700 pt-1">
            <BackField label={t('id_card_back_for_providers', 'For Providers: myHPNmedicaid.com')} value="1-800-962-8074"/>
        </div>
         <div className="mt-1">
            <BackField label={t('id_card_back_medical_claims', 'Medical Claims:')} value="HPN Claims, PO Box 15645, Las Vegas, NV 89114-5645"/>
        </div>

        <div className="mt-2 border-t-2 border-blue-700 pt-1">
            <p className="text-xs font-semibold text-blue-800">{t('id_card_back_provider_network', 'HPN MEDICAID PROVIDER NETWORK')}</p>
        </div>
        <div className="mt-1">
            <BackField label={t('id_card_back_pharmacy_claims', 'Pharmacy Claims:')} value="OptumRx, PO Box 650334, Dallas, TX 75265-0334"/>
        </div>
         <div className="mt-1">
            <BackField label={t('id_card_back_for_pharmacists', 'For Pharmacists:')} value="1-800-443-8197"/>
        </div>
        <p className="text-center text-[10px] mt-1">{t('id_card_back_got_questions', 'Got medical questions? Call 1-800-288-2264, 24 Hours/day, 7 days a week.')}</p>
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
            <div className={cn("transition-transform duration-700", isFlipped ? '[transform:rotateY(180deg)]' : '')} style={{ transformStyle: 'preserve-3d'}}>
                <div className="absolute w-full h-full top-0 left-0" style={{backfaceVisibility: 'hidden'}}>
                     <VirtualIdCardFront user={user} userProfile={userProfile} t={t}/>
                </div>
                 <div className="absolute w-full h-full top-0 left-0 [transform:rotateY(180deg)]" style={{backfaceVisibility: 'hidden'}}>
                    <VirtualIdCardBack t={t}/>
                </div>
            </div>
             {/* Placeholder to maintain height */}
            <div className="opacity-0">
                <VirtualIdCardFront user={user} userProfile={userProfile} t={t} />
            </div>

            <Button onClick={() => setIsFlipped(!isFlipped)} variant="outline" className="w-full mt-4">
                <RotateCw className="mr-2 h-4 w-4" />
                {isFlipped ? t('show_front_button', 'Show Front') : t('show_back_button', 'Show Back')}
            </Button>
        </CardContent>
    </Card>
  );
}
