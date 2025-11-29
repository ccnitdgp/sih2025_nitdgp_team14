
'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, ShieldOff, MoreHorizontal, UserCheck } from 'lucide-react';
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
    updateDocumentNonBlocking(docRef, { isVerified: true });
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
    <TableRow>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Doctor Name</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>Registration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                        ) : doctors && doctors.length > 0 ? (
                            doctors.map(doctor => (
                                <TableRow key={doctor.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/doctor-dashboard/profile`} className="hover:underline text-primary">
                                            Dr. {doctor.firstName} {doctor.lastName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{doctor.specialty || 'N/A'}</TableCell>
                                    <TableCell>{doctor.registrationDetails?.registrationNumber || 'N/A'}</TableCell>
                                    <TableCell>
                                        {doctor.isVerified ? (
                                            <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                                        ) : (
                                            <Badge variant="destructive">Not Verified</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
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
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No doctors found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
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
