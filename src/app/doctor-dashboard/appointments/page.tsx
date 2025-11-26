'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, FileText, CheckCircle, Pencil, Receipt, Building } from 'lucide-react';
import { doctorUpcomingAppointments, doctorPastAppointments, type DoctorAppointment } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DoctorAppointmentsPage() {
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointment | null>(doctorUpcomingAppointments[0] || null);
  const router = useRouter();

  const handleWritePrescription = () => {
    if (selectedAppointment) {
      router.push(`/doctor-dashboard/prescriptions?patientId=${selectedAppointment.patientId}`);
    }
  };


  const AppointmentDetails = ({ appointment }: { appointment: DoctorAppointment | null }) => {
    if (!appointment) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center text-muted-foreground pt-6">
            <p>Select an appointment to see details.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>For {appointment.patientName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="font-semibold">{appointment.date}</p>
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
                <AvatarImage src={appointment.patientAvatar} alt={appointment.patientName} />
                <AvatarFallback>{appointment.patientName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /> {appointment.patientName}</div>
                <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /> {appointment.patientAge} years old</div>
                <div className="flex items-center gap-2 text-sm"><Building className="h-4 w-4 text-muted-foreground" /> {appointment.type}</div>
                <div className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-muted-foreground" /> ID: {appointment.patientId}</div>
              </div>
            </div>
          </div>

           <div>
            <h3 className="font-semibold mb-2">Patient's Chief Complaint</h3>
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground italic">&quot;{appointment.reason}&quot;</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button><CheckCircle />Mark as Complete</Button>
            <Button variant="outline" onClick={handleWritePrescription}><Pencil />Write Prescription</Button>
            <Button variant="outline" disabled><Receipt />Generate Bill</Button>
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
                        <TabsTrigger value="upcoming">Upcoming ({doctorUpcomingAppointments.length})</TabsTrigger>
                        <TabsTrigger value="history">History ({doctorPastAppointments.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upcoming" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Appointments</CardTitle>
                                <CardDescription>You have {doctorUpcomingAppointments.length} appointments scheduled.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 p-2">
                                {doctorUpcomingAppointments.map(appt => (
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
                                <CardDescription>{doctorPastAppointments.length} appointments completed.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-2 p-2">
                                {doctorPastAppointments.map(appt => (
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
    </div>
  );
}
