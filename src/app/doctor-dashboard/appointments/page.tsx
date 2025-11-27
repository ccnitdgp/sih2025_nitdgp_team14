
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, FileText, CheckCircle, Pencil, Receipt, Building, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { differenceInYears } from 'date-fns';


const billSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  category: z.enum(['Consultation', 'Lab Tests', 'Pharmacy', 'Radiology']),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
});


export default function DoctorAppointmentsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const appointmentsQuery = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return query(collection(firestore, 'appointments'), where('doctorId', '==', user.uid));
  }, [user, firestore]);

  const { data: appointments, isLoading: isLoadingAppointments } = useCollection(appointmentsQuery);
  
  const upcomingAppointments = appointments?.filter(a => a.status === 'Scheduled');
  const pastAppointments = appointments?.filter(a => a.status !== 'Scheduled');

  useEffect(() => {
    if (!selectedAppointment && upcomingAppointments && upcomingAppointments.length > 0) {
      setSelectedAppointment(upcomingAppointments[0]);
    }
  }, [upcomingAppointments, selectedAppointment]);


  const form = useForm<z.infer<typeof billSchema>>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      description: '',
      category: 'Consultation',
      amount: 0,
    },
  });

  const handleWritePrescription = () => {
    if (selectedAppointment) {
      router.push(`/doctor-dashboard/prescriptions?patientId=${selectedAppointment.patientId}`);
    }
  };
  
  const handleGenerateBill = (values: z.infer<typeof billSchema>) => {
    console.log('Bill Generated:', values);
    toast({
      title: 'Bill Generated',
      description: `A bill for Rs. ${values.amount} has been generated for ${selectedAppointment?.patientName}.`,
    });
    setIsBillDialogOpen(false);
    form.reset();
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
        const date = dob.toDate ? dob.toDate() : new Date(dob);
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
    const patientDisplayId = patientProfile?.patientId;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>For {patientDisplayName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="font-semibold">{new Date(appointment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="font-semibold">{appointment.time}</p>
                </div>
              </div>
            </div>
             <div className="mt-4 flex justify-end">
                <Badge variant={appointment.status === 'Scheduled' ? 'secondary' : 'default'}>{appointment.status}</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Patient Information</h3>
            <div className="p-4 border rounded-lg flex items-center gap-4">
               <Avatar className="h-14 w-14">
                <AvatarImage src={`https://picsum.photos/seed/${appointment.patientId}/200`} alt={patientDisplayName} />
                <AvatarFallback>{patientDisplayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /> {patientDisplayName}</div>
                 <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> 
                    {isPatientLoading ? '...' : `${getAge(patientProfile?.dateOfBirth)} years old`}
                </div>
                <div className="flex items-center gap-2 text-sm">
                    {appointment.type === 'Virtual' ? <Video className="h-4 w-4 text-muted-foreground"/> : <Building className="h-4 w-4 text-muted-foreground" />} 
                    {appointment.type}
                </div>
                <div className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-muted-foreground" /> ID: {patientDisplayId}</div>
              </div>
            </div>
          </div>

           <div>
            <h3 className="font-semibold mb-2">Patient's Chief Complaint</h3>
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground italic">&quot;{appointment.reason || 'Not specified'}&quot;</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
             {appointment.type === 'Virtual' && (
              <Button asChild>
                <Link href="https://meet.google.com" target="_blank"><Video className="mr-2 h-4 w-4"/>Join Video Call</Link>
              </Button>
            )}
            <Button onClick={handleMarkAsComplete} disabled={appointment.status !== 'Scheduled'}><CheckCircle />Mark as Complete</Button>
            <Button variant="outline" onClick={handleWritePrescription}><Pencil />Write Prescription</Button>
            <Button variant="outline" onClick={() => setIsBillDialogOpen(true)}><Receipt />Generate Bill</Button>
          </div>

        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="md:col-span-1">
                 <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments?.length || 0})</TabsTrigger>
                        <TabsTrigger value="history">History ({pastAppointments?.length || 0})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upcoming" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Appointments</CardTitle>
                                <CardDescription>You have {upcomingAppointments?.length || 0} appointments scheduled.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 p-2">
                                {upcomingAppointments?.map(appt => (
                                    <button
                                        key={appt.id}
                                        onClick={() => setSelectedAppointment(appt)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-lg border",
                                            selectedAppointment?.id === appt.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                                        )}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{appt.patientName}</p>
                                                <p className="text-sm text-muted-foreground">{appt.type} on {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                            <p className="font-medium text-sm">{appt.time}</p>
                                        </div>
                                    </button>
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
                                {pastAppointments?.map(appt => (
                                     <button
                                        key={appt.id}
                                        onClick={() => setSelectedAppointment(appt)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-lg border",
                                            selectedAppointment?.id === appt.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                                        )}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{appt.patientName}</p>
                                                <p className="text-sm text-muted-foreground">{appt.type} on {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                             <p className="font-medium text-sm">{appt.time}</p>
                                        </div>
                                    </button>
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleGenerateBill)} className="space-y-4">
                         <FormField
                            control={form.control}
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
                            control={form.control}
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
                            control={form.control}
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
    </div>
  );
}

    