
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorPatientsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const patientsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/patients`);
  }, [user, firestore]);

  const { data: patients, isLoading } = useCollection(patientsCollectionRef);

  const filteredPatients = patients?.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.customPatientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PatientSkeleton = () => (
    <TableRow>
        <TableCell>
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
    </TableRow>
  )

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle>My Patients</CardTitle>
                    <CardDescription>A list of all patients under your care.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/doctor-dashboard/add-patient">
                        <UserPlus />
                        Add New Patient
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="mb-6 max-w-sm relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, email, or ID..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Patient Details</TableHead>
                            <TableHead>Patient ID</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <>
                                    <PatientSkeleton />
                                    <PatientSkeleton />
                                    <PatientSkeleton />
                                </>
                            ) : filteredPatients && filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <TableRow key={patient.patientId}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://picsum.photos/seed/${patient.patientId}/200`} />
                                                <AvatarFallback>{patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                                                <p className="text-sm text-muted-foreground">{patient.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-muted-foreground">{patient.customPatientId}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" asChild>
                                            <Link href={`/doctor-dashboard/patient/${patient.patientId}`}>
                                                View Profile <ArrowRight className="ml-2"/>
                                            </Link>
                                        </Button>
                                    </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        {searchTerm ? 'No patients found.' : 'No patients have been added yet.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

    