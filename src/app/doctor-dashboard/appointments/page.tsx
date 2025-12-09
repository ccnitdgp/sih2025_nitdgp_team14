
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, FileText, CheckCircle, Pencil, Receipt, Building, Video, XCircle, Check, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, useDoc, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { differenceInYears, parse, addMinutes, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const billSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  category: z.enum(['Consultation', 'Lab Tests', 'Pharmacy', 'Radiology']),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
});

const scheduleSchema = z.object({
  date: z.string().min(1, 'Date is required.'),
  time: z.string().min(1, 'Time is required.'),
  meetLink: z.string().url('Must be a valid URL.').optional(),
});


export default function DoctorAppointmentsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const appointmentsQuery = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'appointments'), where('doctorId', '==', user.uid));
  }, [user, firestore]);

  const { data: appointments, isLoading: isLoadingAppointments } = useCollection(appointmentsQuery);
  
  const upcomingAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(a => a.status === 'Scheduled')
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

   const pendingAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(a => a.status === 'Pending')
      .sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
  }, [appointments]);


  const pastAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(a => a.status !== 'Scheduled' && a.status !== 'Pending')
      .sort((a,b) => new Date(b.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);


  useEffect(() => {
    if (!selectedAppointment) {
      if (pendingAppointments && pendingAppointments.length > 0) {
        setSelectedAppointment(pendingAppointments[0]);
      } else if (upcomingAppointments && upcomingAppointments.length > 0) {
        setSelectedAppointment(upcomingAppointments[0]);
      }
    }
  }, [upcomingAppointments, pendingAppointments, selectedAppointment]);


  const billForm = useForm<z.infer<typeof billSchema>>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      description: '',
      category: 'Consultation',
      amount: 0,
    },
  });

  const scheduleForm = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      date: '',
      time: '',
      meetLink: '',
    },
  });

  const handleWritePrescription = () => {
    if (selectedAppointment) {
      router.push(`/doctor-dashboard/prescriptions?patientId=${selectedAppointment.patientId}`);
    }
  };
  
 const handleGenerateBill = (values: z.infer<typeof billSchema>) => {
    if (!selectedAppointment?.patientId || !firestore || !user) return;
    
    const billsRef = collection(firestore, 'users', selectedAppointment.patientId, 'healthRecords');
    const newBillRef = doc(billsRef);

    const billData = {
      id: newBillRef.id,
      recordType: 'bill',
      dateCreated: serverTimestamp(),
      userId: selectedAppointment.patientId,
      addedBy: user.uid,
      details: {
        title: values.description,
        category: values.category,
        amount: values.amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Due',
      }
    };
    
    addDocumentNonBlocking(billsRef, billData);

    toast({
      title: 'Bill Generated',
      description: `A bill for Rs. ${values.amount} has been generated for ${selectedAppointment?.patientName}.`,
    });
    setIsBillDialogOpen(false);
    billForm.reset();
  }

  const handleAcceptRequest = (appointment: any) => {
    if (appointment.type === 'Virtual') {
        setSelectedAppointment(appointment);
        setIsScheduleDialogOpen(true);
    } else { // In-Person
        if(!firestore || !user) return;
        
        // Link patient to doctor
        const patientUserRef = doc(firestore, 'users', appointment.patientId);
        updateDocumentNonBlocking(patientUserRef, { doctorId: user.uid });

        const apptRef = doc(firestore, 'appointments', appointment.id);
        updateDocumentNonBlocking(apptRef, { status: 'Scheduled' });
        toast({ title: "Appointment Accepted", description: `Appointment with ${appointment.patientName} has been scheduled.` });
    }
  };
  
  const handleScheduleSubmit = (values: z.infer<typeof scheduleSchema>) => {
    if(!selectedAppointment || !firestore || !user) return;

    // Link patient to doctor
    const patientUserRef = doc(firestore, 'users', selectedAppointment.patientId);
    updateDocumentNonBlocking(patientUserRef, { doctorId: user.uid });

    // Update appointment status
    const apptRef = doc(firestore, 'appointments', selectedAppointment.id);
    updateDocumentNonBlocking(apptRef, {
        status: 'Scheduled',
        date: values.date,
        time: values.time,
        meetLink: values.meetLink || null
    });
    
    toast({ title: "Appointment Scheduled", description: "The patient has been notified and linked."});
    setIsScheduleDialogOpen(false);
  }

  const handleRejectRequest = (appointment: any) => {
      if(!firestore) return;
      const apptRef = doc(firestore, 'appointments', appointment.id);
      updateDocumentNonBlocking(apptRef, { status: 'Canceled' });
      toast({ title: "Appointment Rejected", variant: "destructive"});
  }
  
  const handleMarkAsComplete = () => {
    if(!selectedAppointment || !firestore) return;
    const apptRef = doc(firestore, 'appointments', selectedAppointment.id);
    updateDocumentNonBlocking(apptRef, { status: 'Completed' });
    toast({ title: "Appointment marked as complete."});
  }


  const AppointmentDetails = ({ appointment }: { appointment: any | null }) => {
    const firestore = useFirestore();
    const patientDocRef = useMemoFirebase(() => {
        if (!appointment?.patientId || !firestore) return null;
        return doc(firestore, 'users', appointment.patientId);
    }, [appointment, firestore]);
    const { data: patientProfile, isLoading: isPatientLoading } = useDoc(patientDocRef);

    const getAge = (dob) => {
        if (!dob) return 'N/A';
        const date = dob.toDate ? dob.toDate() : parseISO(dob);
        try {
            return differenceInYears(new Date(), date);
        } catch (e) {
            return 'N/A';
        }
    };


    if (!appointment) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center text-muted-foreground pt-6">
            <p>Select an appointment to see details.</p>
          </CardContent>
        </Card>
      );
    }
    
    const patientDisplayName = patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : appointment.patientName;
    const patientDisplayId = appointment.patientDisplayId;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>For {patientDisplayName}{patientDisplayId && ` (ID: ${patientDisplayId})`}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="font-semibold">{appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Pending'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="font-semibold">{appointment.time || 'Pending'}</p>
                </div>
              </div>
            </div>
             <div className="mt-4 flex justify-end">
                <Badge variant={appointment.status === 'Scheduled' ? 'secondary' : (appointment.status === 'Canceled' ? 'destructive' : (appointment.status === 'Pending' ? 'outline' : 'default'))}>{appointment.status}</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Patient Information</h3>
            <div className="p-4 border rounded-lg flex items-center gap-4">
               <Avatar className="h-14 w-14">
                <AvatarImage src={`https://picsum.photos/seed/${appointment.patientId}/200`} alt={patientDisplayName} />
                <AvatarFallback>{patientDisplayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 w-full">
                <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /> {patientDisplayName}</div>
                <div className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-muted-foreground" /> ID: {patientDisplayId}</div>
                 <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> 
                    {isPatientLoading ? '...' : `${getAge(patientProfile?.dateOfBirth)} years old`}
                </div>
                <div className="flex items-center gap-2 text-sm">
                    {appointment.type === 'Virtual' ? <Video className="h-4 w-4 text-muted-foreground"/> : <Building className="h-4 w-4 text-muted-foreground" />} 
                    {appointment.type}
                </div>
              </div>
            </div>
          </div>

           <div>
            <h3 className="font-semibold mb-2">Patient's Chief Complaint</h3>
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground italic">&quot;{appointment.reason || 'Not specified'}&quot;</p>
            </div>
          </div>
          
           {appointment.status === 'Pending' && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button onClick={() => handleAcceptRequest(appointment)}><Check className="mr-2 h-4 w-4" />Accept Request</Button>
                  <Button variant="destructive" onClick={() => handleRejectRequest(appointment)}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
              </div>
            )}

           {appointment.status === 'Scheduled' && (
             <div className="flex flex-wrap gap-2 pt-4 border-t">
                {appointment.type === 'Virtual' && appointment.meetLink && (
                    <Button asChild>
                        <a href={appointment.meetLink} target="_blank" rel="noopener noreferrer">
                            <Video className="mr-2 h-4 w-4"/>Join Video Call <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                )}
                <Button onClick={handleMarkAsComplete}><CheckCircle />Mark as Complete</Button>
                <Button variant="outline" onClick={handleWritePrescription}><Pencil />Write Prescription</Button>
                <Button variant="outline" onClick={() => setIsBillDialogOpen(true)}><Receipt />Generate Bill</Button>
            </div>
           )}

        </CardContent>
      </Card>
    )
  }

  const AppointmentListItem = ({ appointment, onSelect, isSelected }) => {
    const patientDisplayId = appointment.patientDisplayId;
    return (
        <button
            key={appointment.id}
            onClick={() => onSelect(appointment)}
            className={cn(
                "w-full text-left p-3 rounded-lg border",
                isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted"
            )}
        >
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="font-semibold">{appointment.patientName}</p>
                    {patientDisplayId && <p className="text-xs text-muted-foreground">{patientDisplayId}</p>}
                    <p className="text-sm text-muted-foreground">{appointment.type} on {appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pending'}</p>
                </div>
                <p className="font-medium text-sm">{appointment.time}</p>
            </div>
        </button>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="md:col-span-1">
                 <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending">Requests ({pendingAppointments?.length || 0})</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments?.length || 0})</TabsTrigger>
                        <TabsTrigger value="history">History ({pastAppointments?.length || 0})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Requests</CardTitle>
                                <CardDescription>You have {pendingAppointments?.length || 0} new requests.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 p-2">
                                {isLoadingAppointments ? <p>Loading...</p> : pendingAppointments?.map(appt => (
                                    <AppointmentListItem 
                                        key={appt.id}
                                        appointment={appt}
                                        onSelect={setSelectedAppointment}
                                        isSelected={selectedAppointment?.id === appt.id}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="upcoming" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Appointments</CardTitle>
                                <CardDescription>You have {upcomingAppointments?.length || 0} appointments scheduled.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 p-2">
                                {isLoadingAppointments ? <p>Loading...</p> : upcomingAppointments?.map(appt => (
                                    <AppointmentListItem 
                                        key={appt.id}
                                        appointment={appt}
                                        onSelect={setSelectedAppointment}
                                        isSelected={selectedAppointment?.id === appt.id}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                         <Card>
                             <CardHeader>
                                <CardTitle>Past Appointments</CardTitle>
                                <CardDescription>{pastAppointments?.length || 0} appointments completed.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-2 p-2">
                                {isLoadingAppointments ? <p>Loading...</p> : pastAppointments?.map(appt => (
                                      <AppointmentListItem 
                                        key={appt.id}
                                        appointment={appt}
                                        onSelect={setSelectedAppointment}
                                        isSelected={selectedAppointment?.id === appt.id}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                 </Tabs>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
                <AppointmentDetails appointment={selectedAppointment} />
            </div>
        </div>
        
        <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate New Bill</DialogTitle>
                    <DialogDescription>
                        Create a new bill for {selectedAppointment?.patientName}. This will be visible to the patient immediately.
                    </DialogDescription>
                </DialogHeader>
                <Form {...billForm}>
                    <form onSubmit={billForm.handleSubmit(handleGenerateBill)} className="space-y-4">
                         <FormField
                            control={billForm.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Consultation Fee" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={billForm.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Consultation">Consultation</SelectItem>
                                        <SelectItem value="Lab Tests">Lab Tests</SelectItem>
                                        <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                                        <SelectItem value="Radiology">Radiology</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={billForm.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Amount (Rs.)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Enter amount" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsBillDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Generate Bill</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule Virtual Appointment</DialogTitle>
                    <DialogDescription>
                        Set the date, time, and meeting link for the consultation with {selectedAppointment?.patientName}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...scheduleForm}>
                    <form onSubmit={scheduleForm.handleSubmit(handleScheduleSubmit)} className="space-y-4">
                        <FormField control={scheduleForm.control} name="date" render={({ field }) => (
                           <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={scheduleForm.control} name="time" render={({ field }) => (
                           <FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={scheduleForm.control} name="meetLink" render={({ field }) => (
                           <FormItem><FormLabel>Google Meet Link (Optional)</FormLabel><FormControl><Input placeholder="https://meet.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Confirm Schedule</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
