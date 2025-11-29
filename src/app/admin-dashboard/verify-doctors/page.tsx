'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ShieldOff, MoreHorizontal, UserCheck, ExternalLink, FileText, Clock, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/back-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const verificationItems = [
    { id: 'medicalDegree', label: 'Medical Degree Certificate' },
    { id: 'internshipCertificate', label: 'Internship Completion Certificate' },
    { id: 'registrationCertificate', label: 'Medical Council Registration' },
    { id: 'identityProof', label: 'Identity Proof (Govt. Issued)' },
    { id: 'photograph', label: 'Passport-size Photograph' },
    { id: 'goodStandingCertificate', label: 'Good Standing Certificate' },
    { id: 'specializationCertificate', label: 'Specialization Certificate' },
];


const StatusBadge = ({ status }) => {
    switch (status) {
        case 'Verified':
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>;
        case 'Pending':
            return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
        case 'Rejected':
            return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
        case 'Suspended':
             return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-foreground"><AlertTriangle className="mr-1 h-3 w-3" />Suspended</Badge>;
        default:
            return <Badge variant="outline">Not Uploaded</Badge>;
    }
};


export default function VerifyDoctorsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [actionType, setActionType] = useState<'reject' | 'suspend' | null>(null);
  const [reason, setReason] = useState('');

  const doctorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'doctors'));
  }, [firestore]);

  const { data: doctors, isLoading } = useCollection(doctorsQuery);

  const handleApprove = (doctorId: string) => {
    const docRef = doc(firestore, 'doctors', doctorId);
    updateDocumentNonBlocking(docRef, { isVerified: true, verificationNote: '' });
    toast({ title: "Doctor Approved", description: "The doctor's profile is now verified and public." });
  };

  const openActionDialog = (doctor: any, type: 'reject' | 'suspend') => {
    setSelectedDoctor(doctor);
    setActionType(type);
  };
  
  const handleActionSubmit = () => {
    if(!selectedDoctor || !actionType) return;

    const docRef = doc(firestore, 'doctors', selectedDoctor.id);
    const updateData = {
        isVerified: false,
        verificationNote: `[${actionType.toUpperCase()}] ${reason}`
    };

    updateDocumentNonBlocking(docRef, updateData);

    toast({
        title: `Doctor ${actionType === 'reject' ? 'Rejected' : 'Suspended'}`,
        variant: 'destructive'
    });
    
    setSelectedDoctor(null);
    setActionType(null);
    setReason('');
  }

  const SkeletonRow = () => (
    <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex items-center gap-4">
             <Skeleton className="h-5 w-24" />
             <Skeleton className="h-5 w-24" />
             <Skeleton className="h-6 w-20 rounded-md" />
             <Skeleton className="h-8 w-8" />
        </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <UserCheck className="h-6 w-6 text-primary"/>
                    <CardTitle>Doctor Verification Center</CardTitle>
                </div>
                <CardDescription>
                    Review, approve, or reject new doctor registrations. Verified doctors will be visible to patients.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-md">
                    <div className="flex items-center justify-between p-4 font-medium text-muted-foreground border-b text-sm">
                        <span className="w-1/3">Doctor Name</span>
                        <div className="flex items-center justify-between w-2/3">
                            <span className="w-1/3">Specialty</span>
                            <span className="w-1/3">Registration #</span>
                            <span className="w-1/4 text-center">Status</span>
                            <span className="w-10"></span>
                        </div>
                    </div>
                    {isLoading ? (
                        [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                    ) : doctors && doctors.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {doctors.map(doctor => (
                                <AccordionItem value={doctor.id} key={doctor.id} className="border-b last:border-b-0">
                                     <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-2 w-1/3">
                                            <AccordionTrigger />
                                            <span className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</span>
                                        </div>
                                        <div className="flex items-center justify-between w-2/3">
                                            <span className="text-sm w-1/3">{doctor.specialty || 'N/A'}</span>
                                            <span className="text-sm w-1/3">{doctor.registrationDetails?.registrationNumber || 'N/A'}</span>
                                            <div className="w-1/4 flex justify-center">
                                                <StatusBadge status={doctor.isVerified ? 'Verified' : (doctor.verificationNote ? 'Rejected' : 'Pending')} />
                                            </div>
                                            <div className="w-10">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleApprove(doctor.id)} disabled={doctor.isVerified}>
                                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openActionDialog(doctor, 'reject')}>
                                                            <XCircle className="mr-2 h-4 w-4 text-red-500"/>
                                                            Reject
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openActionDialog(doctor, 'suspend')} disabled={!doctor.isVerified}>
                                                            <ShieldOff className="mr-2 h-4 w-4 text-yellow-500"/>
                                                            Suspend
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                    <AccordionContent>
                                        <div className="bg-muted/50 p-4 border-t">
                                            <h4 className="font-semibold mb-4">Uploaded Documents</h4>
                                             {doctor.verificationNote && <p className="text-sm text-destructive mb-4">Note: {doctor.verificationNote}</p>}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {verificationItems.map(item => {
                                                    const docInfo = doctor.verification?.[item.id];
                                                    return (
                                                        <div key={item.id} className="flex items-center justify-between p-3 bg-background border rounded-md">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                                <div>
                                                                    <p className="font-medium text-sm">{item.label}</p>
                                                                    <StatusBadge status={docInfo?.status} />
                                                                </div>
                                                            </div>
                                                            <Button asChild variant="secondary" size="sm" disabled={!docInfo?.url || docInfo.url === '#'}>
                                                                <a href={docInfo?.url} target="_blank" rel="noopener noreferrer">
                                                                    View <ExternalLink className="ml-2 h-4 w-4"/>
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                         <div className="text-center p-8 text-muted-foreground">No doctors found.</div>
                    )}
                </div>
            </CardContent>
        </Card>

        <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm {actionType === 'reject' ? 'Rejection' : 'Suspension'}</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for {actionType === 'reject' ? 'rejecting' : 'suspending'} Dr. {selectedDoctor?.lastName}. This will be recorded.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     <Textarea 
                        placeholder="e.g., 'Incomplete documents provided' or 'License number not verifiable'."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                     <Button 
                        type="button" 
                        variant="destructive"
                        onClick={handleActionSubmit} 
                        disabled={!reason}
                    >
                        Confirm {actionType === 'reject' ? 'Rejection' : 'Suspension'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
