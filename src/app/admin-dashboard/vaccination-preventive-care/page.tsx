
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Syringe,
  Tent
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/back-button';
import { VaccinationCoverageChart } from '@/components/admin/vaccination-coverage-chart';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';


export default function VaccinationPreventiveCarePage() {
    const firestore = useFirestore();

    const drivesQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'vaccinationDrives'), orderBy('schedule', 'desc')) : null),
        [firestore]
    );
    const { data: drives, isLoading: isLoadingDrives } = useCollection(drivesQuery);

     const campsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'healthCamps'), orderBy('startTime', 'desc'));
    }, [firestore]);
    const { data: camps, isLoading: isLoadingCamps } = useCollection(campsQuery);

    const upcomingEvents = useMemo(() => {
        if (!drives && !camps) return [];

        const allEvents = [
            ...(drives || []).map(d => ({...d, type: 'drive', date: d.schedule})),
            ...(camps || []).map(c => ({...c, type: 'camp', date: c.startTime}))
        ];
        
        return allEvents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [drives, camps]);

  
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <BackButton />
        <div className="space-y-8 mt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Vaccination & Preventive Care
              </h1>
              <p className="text-muted-foreground">
                Analytics for vaccination drives, health camps, and population coverage.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <Syringe />
                        Vaccination Coverage
                        </CardTitle>
                        <CardDescription>
                        Total vaccination coverage by age group.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <VaccinationCoverageChart />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <Tent />
                        Upcoming Drives & Camps
                        </CardTitle>
                        <CardDescription>
                        Status of scheduled public health events.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingDrives || isLoadingCamps ? (
                                [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                upcomingEvents.slice(0, 5).map(event => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.vaccineType || event.description}</TableCell>
                                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge>On Track</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Syringe />
                      Drive Performance
                    </CardTitle>
                    <CardDescription>
                      Breakdown of vaccination numbers and stock per drive.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Drive Name</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Actual</TableHead>
                                <TableHead>Remaining Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {isLoadingDrives ? (
                                 [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                drives?.map(drive => (
                                     <TableRow key={drive.id}>
                                        <TableCell className="font-medium">{drive.vaccineType}</TableCell>
                                        <TableCell>500</TableCell>
                                        <TableCell>420</TableCell>
                                        <TableCell>80</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                     </Table>
                  </CardContent>
                </Card>

                 <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tent />
                      Camp Performance
                    </CardTitle>
                    <CardDescription>
                      Breakdown of attendees and follow-ups per camp.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Camp Name</TableHead>
                                <TableHead>Target Attendees</TableHead>
                                <TableHead>Actual Attendees</TableHead>
                                <TableHead>Follow-ups</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {isLoadingCamps ? (
                                 [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                camps?.map(camp => (
                                     <TableRow key={camp.id}>
                                        <TableCell className="font-medium">{camp.description}</TableCell>
                                        <TableCell>300</TableCell>
                                        <TableCell>250</TableCell>
                                        <TableCell>45</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                     </Table>
                  </CardContent>
                </Card>
             </div>
        </div>
      </div>
    </div>
  );
}
