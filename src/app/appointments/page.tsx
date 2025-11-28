
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, MapPin, Calendar as CalendarIcon, Star, Clock, Search, ClipboardList, History, Video, GraduationCap, Loader2 } from 'lucide-react';
import { getSpecialistSuggestion, type SymptomCheckerOutput } from '@/ai/flows/symptom-checker-flow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Calendar } from '@/components/ui/calendar';
import { format, addDays, startOfDay, addMinutes, getDay, setHours, setMinutes } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';


const languageFiles = { hi, bn, ta, te, mr };

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviews: number;
  avatar: string;
  availableSlots: Record<string, string[]>;
  qualifications?: string;
  yearsOfExperience?: number;
  teleconsultation?: boolean;
  availability?: {
    workingHours?: string;
    availableDays?: string;
    appointmentDuration?: number;
  }
};

const parseTime = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const time = timeStr.toLowerCase().trim();
    const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
    if (!match) return null;

    let [_, hour, minute, ampm] = match;
    let hourNum = parseInt(hour, 10);
    const minuteNum = minute ? parseInt(minute, 10) : 0;

    if (ampm === 'pm' && hourNum < 12) {
        hourNum += 12;
    }
    if (ampm === 'am' && hourNum === 12) { // Midnight case: 12am is 00:00
        hourNum = 0;
    }

    const date = new Date();
    date.setHours(hourNum, minuteNum, 0, 0);
    return date;
};


const generateTimeSlots = (workingHours?: string, duration?: number): string[] => {
    if (!workingHours || !duration) return [];
    
    const slots: string[] = [];
    const parts = workingHours.split('-').map(s => s.trim());
    if (parts.length !== 2) {
        console.error("Invalid working hours format:", workingHours);
        return [];
    };

    const startTime = parseTime(parts[0]);
    const endTime = parseTime(parts[1]);
    
    if (!startTime || !endTime || endTime <= startTime) {
         console.error("Invalid working hours format or range:", workingHours);
        return [];
    }

    let currentTime = startTime;
    while (currentTime < endTime) {
        slots.push(format(currentTime, 'hh:mm a'));
        currentTime = addMinutes(currentTime, duration);
    }

    return slots;
}

const parseAvailableDays = (daysString?: string): number[] => {
    if (!daysString) return [];

    const dayMap: { [key: string]: number } = {
        sun: 0, sunday: 0,
        mon: 1, monday: 1,
        tue: 2, tuesday: 2,
        wed: 3, wednesday: 3,
        thu: 4, thursday: 4,
        fri: 5, friday: 5,
        sat: 6, saturday: 6,
    };

    const availableDays = new Set<number>();
    const daySegments = daysString.toLowerCase().split(',').map(s => s.trim());

    for (const segment of daySegments) {
        const rangeParts = segment.split(/-|to/).map(p => p.trim());
        if (rangeParts.length === 2) {
            const startDayStr = rangeParts[0].substring(0, 3);
            const endDayStr = rangeParts[1].substring(0, 3);

            const startDay = dayMap[startDayStr];
            const endDay = dayMap[endDayStr];

            if (startDay !== undefined && endDay !== undefined) {
                if (startDay <= endDay) {
                    for (let dayIndex = startDay; dayIndex <= endDay; dayIndex++) {
                        availableDays.add(dayIndex);
                    }
                } else { // Handle ranges like Sat - Tue
                    for (let dayIndex = startDay; dayIndex <= 6; dayIndex++) {
                        availableDays.add(dayIndex);
                    }
                    for (let dayIndex = 0; dayIndex <= endDay; dayIndex++) {
                        availableDays.add(dayIndex);
                    }
                }
            }
        } else if (rangeParts.length === 1) {
            const dayStr = rangeParts[0].substring(0, 3);
            const day = dayMap[dayStr];
            if (day !== undefined) {
                availableDays.add(day);
            }
        }
    }

    return Array.from(availableDays);
}


const FindDoctors = ({ t, userProfile }) => {
  const [symptoms, setSymptoms] = useState('');
  const [suggestion, setSuggestion] = useState<SymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [appointmentType, setAppointmentType] = useState('In-Person');
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const doctorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'doctors');
  }, [firestore]);

  const { data: doctorsData, isLoading: isLoadingDoctors } = useCollection(doctorsQuery);
  
  const appointmentsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'appointments');
  }, [firestore]);
  
  const { data: allAppointments } = useCollection(appointmentsQuery);

  const doctors = useMemo(() => {
    if (!doctorsData) return [];
    return doctorsData.map(doc => {
      const availableSlots: Record<string, string[]> = {};
      const workingDays = parseAvailableDays(doc.availability?.availableDays);
      const slots = generateTimeSlots(doc.availability?.workingHours, doc.availability?.appointmentDuration);

      for (let i = 0; i < 30; i++) {
        const date = addDays(startOfDay(new Date()), i);
        const dayOfWeek = getDay(date); // 0 (Sun) to 6 (Sat)
        
        if (workingDays.includes(dayOfWeek)) {
            const dateString = format(date, 'yyyy-MM-dd');
            availableSlots[dateString] = slots;
        }
      }
      
      return {
        id: doc.id,
        name: `Dr. ${doc.firstName} ${doc.lastName}`,
        specialty: doc.specialty || 'General Physician',
        location: `${doc.city || ''}, ${doc.state || ''}`.replace(/^, |, $/g, ''),
        rating: doc.stats?.averageRating || 4.5,
        reviews: doc.stats?.totalConsultations || 0,
        avatar: `https://picsum.photos/seed/${doc.id}/200`,
        qualifications: doc.qualifications,
        yearsOfExperience: doc.yearsOfExperience,
        teleconsultation: doc.teleconsultation,
        availability: doc.availability,
        availableSlots: availableSlots,
      }
    });
  }, [doctorsData]);
  

  const handleGetSuggestion = async () => {
    if (!symptoms) return;
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getSpecialistSuggestion({ symptomDescription: symptoms });
      setSuggestion(result);
    } catch (error) {
      console.error('Error getting suggestion:', error);
      toast({
        variant: "destructive",
        title: t('ai_suggestion_failed_title', "AI Suggestion Failed"),
        description: t('ai_suggestion_failed_desc', "The AI service is currently busy. Please wait a moment and try again."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSlots = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(new Date());
    setSelectedTime(undefined);
    setAppointmentType('In-Person');
  };

  const handleCloseDialog = () => {
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  }

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !user || !firestore || !userProfile) return;
    
    const newAppointmentRef = doc(collection(firestore, "appointments"));
    const patientName = `${userProfile.firstName} ${userProfile.lastName}`;

    const newAppointment = {
        id: newAppointmentRef.id,
        doctorId: selectedDoctor.id,
        patientId: user.uid,
        patientName: patientName,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        type: appointmentType,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        location: selectedDoctor.location,
        status: 'Scheduled',
    };
    
    addDocumentNonBlocking(collection(firestore, "appointments"), newAppointment);

    toast({
      title: t('appointment_booked_title', 'Appointment Booked!'),
      description: t('appointment_booked_desc', `Your appointment with ${selectedDoctor.name} on ${format(selectedDate, 'PPP')} at ${selectedTime} has been successfully scheduled.`),
    });
    handleCloseDialog();
  };

  const filteredDoctors = suggestion && !isLoadingDoctors
    ? doctors.filter(doc => doc.specialty === suggestion.specialistSuggestion)
    : doctors;
    
  const doctorsToShow = filteredDoctors.length > 0 ? filteredDoctors : doctors;

  const getAvailableTimesForDate = (doctor: Doctor, date: Date) => {
      const dateString = format(date, 'yyyy-MM-dd');
      const allSlots = doctor.availableSlots[dateString] || [];
      
      const bookedSlotsOnDate = allAppointments
          ?.filter(appt => appt.doctorId === doctor.id && appt.date === dateString)
          .map(appt => appt.time) || [];
      
      return allSlots.filter(slot => !bookedSlotsOnDate.includes(slot));
  };

  const availableTimesForSelectedDate = selectedDoctor && selectedDate 
    ? getAvailableTimesForDate(selectedDoctor, selectedDate)
    : [];

    return (
        <>
        <div className="space-y-8">
             <Card className="shadow-lg border-t-4 border-primary">
                <CardHeader>
                    <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">{t('symptom_checker_title', 'AI-Powered Symptom Checker')}</CardTitle>
                    </div>
                    <p className="text-muted-foreground pt-2">{t('symptom_checker_desc', "Describe your symptoms, and we'll suggest the right specialist for you.")}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                    <label htmlFor="symptoms" className="font-medium">{t('symptom_checker_label', 'Describe your health problem')}</label>
                    <Textarea
                        id="symptoms"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder={t('symptom_checker_placeholder', "e.g., I have a skin rash on my arm, or I've been having chest pain...")}
                        className="mt-2 min-h-[100px]"
                    />
                    </div>
                    <Button onClick={handleGetSuggestion} disabled={isLoading || !symptoms}>
                    {isLoading ? t('getting_suggestion_button_loading', 'Getting Suggestion...') : t('get_suggestion_button', 'Get Suggestion')}
                    </Button>
                    {suggestion && (
                    <div className="!mt-6 p-4 bg-accent/20 border border-accent/50 rounded-lg flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 text-accent" />
                        <p>
                        {t('suggestion_text_prefix', 'Based on your symptoms, we suggest you see a ')}
                        <span className="font-bold">{suggestion.specialistSuggestion}</span>.
                        </p>
                    </div>
                    )}
                </CardContent>
            </Card>

            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">
                    {suggestion && filteredDoctors.length > 0 ? t('suggested_specialists_title', `Suggested ${suggestion.specialistSuggestion}s`) : t('doctors_near_you_title', 'Doctors Near You')}
                </h2>
                {suggestion && !isLoadingDoctors && filteredDoctors.length === 0 && (
                    <p className="text-center text-muted-foreground mb-6">
                        {t('no_doctors_found_text', 'No doctors found for the suggested specialty. Showing all doctors.')}
                    </p>
                )}
                {isLoadingDoctors ? (<div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>) : 
                <div className="space-y-6">
                    {doctorsToShow.map((doctor, index) => (
                    <Card key={index} className="transition-shadow hover:shadow-lg">
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                            <AvatarImage src={doctor.avatar} />
                            <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                            <h3 className="font-bold text-lg">{doctor.name}</h3>
                            <p className="text-sm text-primary font-semibold">{doctor.specialty}</p>
                            {doctor.qualifications && <p className="text-xs text-muted-foreground">{doctor.qualifications}</p>}
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary"/>
                                <span>{doctor.location}</span>
                            </div>
                             {doctor.teleconsultation && (
                                <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-primary"/>
                                    <span>Teleconsultation Available</span>
                                </div>
                             )}
                            {doctor.yearsOfExperience && (
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary"/>
                                    <span>{doctor.yearsOfExperience} years of experience</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2">
                            <Button onClick={() => handleOpenSlots(doctor)}>{t('book_appointment_button', 'Book Appointment')}</Button>
                        </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
                }
            </div>
        </div>
        <Dialog open={!!selectedDoctor} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{t('book_appointment_with_title', 'Book Appointment with')} {selectedDoctor?.name}</DialogTitle>
                <DialogDescription>
                {t('select_slot_desc', 'Select an available date and time slot below.')}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 {selectedDoctor?.teleconsultation && (
                    <div>
                        <Label>Appointment Type</Label>
                        <RadioGroup value={appointmentType} onValueChange={setAppointmentType} className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <RadioGroupItem value="In-Person" id="in-person" className="peer sr-only" />
                                <Label htmlFor="in-person" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    In-Person
                                </Label>
                            </div>

                            <div>
                                <RadioGroupItem value="Virtual" id="virtual" className="peer sr-only" />
                                <Label htmlFor="virtual" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    Virtual
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                setSelectedDate(date);
                                setSelectedTime(undefined);
                            }}
                             disabled={(date) => {
                                if (date < startOfDay(new Date())) return true;
                                if (!selectedDoctor) return true;
                                const availableTimes = getAvailableTimesForDate(selectedDoctor, date);
                                return availableTimes.length === 0;
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Select onValueChange={setSelectedTime} value={selectedTime} disabled={!selectedDate || availableTimesForSelectedDate.length === 0}>
                    <SelectTrigger>
                        <SelectValue placeholder={availableTimesForSelectedDate.length > 0 ? t('select_time_prompt', 'Pick a time slot') : t('no_slots_available_text', 'No slots available')} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableTimesForSelectedDate.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground">
                    A confirmation will be sent to your registered email address. The clinic will contact you if any changes are needed.
                </p>
            </div>
            <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={handleCloseDialog}>{t('cancel_button', 'Cancel')}</Button>
                <Button onClick={handleBookAppointment} disabled={!selectedDate || !selectedTime}>{t('confirm_booking_button', 'Confirm Booking')}</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
     </>
    )
}

const MyAppointments = ({ t }) => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);

    const appointmentsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'appointments'), where('patientId', '==', user.uid));
    }, [user, firestore]);

    const { data: allAppointments, isLoading } = useCollection(appointmentsQuery);

    const upcomingAppointments = allAppointments?.filter(appt => appt.status === 'Scheduled');

    const handleCancelAppointment = () => {
        if (!appointmentToCancel || !firestore) return;
        const apptRef = doc(firestore, 'appointments', appointmentToCancel.id);
        updateDocumentNonBlocking(apptRef, { status: 'Canceled' });
        toast({
            variant: "destructive",
            title: "Appointment Canceled",
            description: `Your appointment with ${appointmentToCancel.doctorName} has been canceled.`,
        });
        setAppointmentToCancel(null);
    };

    const handleReschedule = (newDate, newTime) => {
        if (!appointmentToReschedule || !firestore) return;
        const apptRef = doc(firestore, 'appointments', appointmentToReschedule.id);
        updateDocumentNonBlocking(apptRef, {
            date: format(newDate, 'yyyy-MM-dd'),
            time: newTime,
        });
        toast({
            title: "Appointment Rescheduled",
            description: `Your appointment with ${appointmentToReschedule.doctorName} is now on ${format(newDate, 'PPP')} at ${newTime}.`,
        });
        setAppointmentToReschedule(null);
    };

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>{t('upcoming_appointments_title', 'Upcoming Appointments')}</CardTitle>
                <CardDescription>{t('upcoming_appointments_desc', 'Here are your scheduled appointments.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? <p>Loading appointments...</p> : 
                 upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments.map(appt => (
                    <Card key={appt.id} className="p-4 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://picsum.photos/seed/${appt.doctorId}/200`} />
                                <AvatarFallback>{appt.doctorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg">{appt.doctorName}</h3>
                                <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{format(new Date(appt.date), 'PPP')} at {appt.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {appt.type === 'Virtual' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                                    <span>{appt.type === 'Virtual' ? 'Virtual Consultation' : appt.location}</span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center">
                                <Button variant="outline" onClick={() => setAppointmentToReschedule(appt)}>{t('reschedule_button', 'Reschedule')}</Button>
                                <Button variant="destructive" onClick={() => setAppointmentToCancel(appt)}>{t('cancel_button', 'Cancel')}</Button>
                            </div>
                        </div>
                        {appt.type === 'Virtual' && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button asChild>
                                    <Link href={`/video-call/${appt.id}`}><Video className="mr-2 h-4 w-4" />Join Call</Link>
                                </Button>
                            </div>
                        )}
                    </Card>
                )) : <p>No upcoming appointments.</p>}
            </CardContent>
        </Card>
        
        {appointmentToCancel && (
            <AlertDialog open={!!appointmentToCancel} onOpenChange={() => setAppointmentToCancel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cancel your appointment with {appointmentToCancel.doctorName} on {format(new Date(appointmentToCancel.date), 'PPP')}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelAppointment}>Confirm Cancellation</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}

        {appointmentToReschedule && <RescheduleDialog t={t} appointment={appointmentToReschedule} onConfirm={handleReschedule} onOpenChange={() => setAppointmentToReschedule(null)} />}
        </>
    )
}

const RescheduleDialog = ({ t, appointment, onConfirm, onOpenChange }) => {
    const firestore = useFirestore();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);

    const doctorQuery = useMemoFirebase(() => {
        if (!firestore || !appointment?.doctorId) return null;
        return doc(firestore, 'doctors', appointment.doctorId);
    }, [firestore, appointment?.doctorId]);
    const { data: doctorData } = useDoc(doctorQuery);

    const appointmentsQuery = useMemoFirebase(() => {
        if (!firestore || !appointment?.doctorId) return null;
        return query(collection(firestore, 'appointments'), where('doctorId', '==', appointment.doctorId));
    }, [firestore, appointment?.doctorId]);
    const { data: doctorAppointments } = useCollection(appointmentsQuery);

    const doctor = useMemo(() => {
        if (!doctorData) return null;
        const availableSlots: Record<string, string[]> = {};
        const workingDays = parseAvailableDays(doctorData.availability?.availableDays);
        const slots = generateTimeSlots(doctorData.availability?.workingHours, doctorData.availability?.appointmentDuration);
  
        for (let i = 0; i < 30; i++) {
          const date = addDays(startOfDay(new Date()), i);
          const dayOfWeek = getDay(date);
          if (workingDays.includes(dayOfWeek)) {
              const dateString = format(date, 'yyyy-MM-dd');
              availableSlots[dateString] = slots;
          }
        }
        return { availableSlots: availableSlots };
    }, [doctorData]);


    const getAvailableTimesForDate = (date: Date) => {
        if (!doctor) return [];
        const dateString = format(date, 'yyyy-MM-dd');
        const allSlots = doctor.availableSlots[dateString] || [];
        
        const bookedSlotsOnDate = doctorAppointments
            ?.filter(appt => appt.id !== appointment.id && appt.date === dateString)
            .map(appt => appt.time) || [];
        
        return allSlots.filter(slot => !bookedSlotsOnDate.includes(slot));
    };

    const availableTimesForSelectedDate = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

    return (
        <Dialog open={!!appointment} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reschedule Appointment</DialogTitle>
                    <DialogDescription>
                        Select a new date and time for your appointment with {appointment.doctorName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    setSelectedDate(date);
                                    setSelectedTime(undefined);
                                }}
                                disabled={(date) => {
                                    if (date < startOfDay(new Date())) return true;
                                    if (!doctor) return true;
                                    return getAvailableTimesForDate(date).length === 0;
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Select onValueChange={setSelectedTime} value={selectedTime} disabled={!selectedDate || availableTimesForSelectedDate.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder={availableTimesForSelectedDate.length > 0 ? t('select_time_prompt', 'Pick a time slot') : t('no_slots_available_text', 'No slots available')} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTimesForSelectedDate.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => onConfirm(selectedDate, selectedTime)} disabled={!selectedDate || !selectedTime}>Confirm Reschedule</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const HistoryTab = ({ t }) => {
     const { user } = useUser();
    const firestore = useFirestore();
    const appointmentsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'appointments'), where('patientId', '==', user.uid));
    }, [user, firestore]);

    const { data: allAppointments } = useCollection(appointmentsQuery);

     const pastAppointments = allAppointments?.filter(appt => appt.status !== 'Scheduled');
    return (
         <Card>
            <CardHeader>
                <CardTitle>{t('appointment_history_title', 'Appointment History')}</CardTitle>
                <CardDescription>{t('appointment_history_desc', 'Here are your past appointments.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {pastAppointments && pastAppointments.length > 0 ? pastAppointments.map(appt => (
                    <Card key={appt.id} className="p-4 flex flex-col sm:flex-row items-start gap-4">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://picsum.photos/seed/${appt.doctorId}/200`} />
                            <AvatarFallback>{appt.doctorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                             <h3 className="font-bold text-lg">{appt.doctorName}</h3>
                            <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                             <div className="flex items-center gap-2 mt-2 text-sm">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{format(new Date(appt.date), 'PPP')} at {appt.time}</span>
                            </div>
                             <div className="flex items-center gap-2 text-sm">
                                {appt.type === 'Virtual' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                                <span>{appt.type === 'Virtual' ? 'Virtual Consultation' : appt.location}</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 self-start sm:self-center">
                             {appt.status === 'Completed' && (
                                <Button>{t('book_again_button', 'Book Again')}</Button>
                             )}
                             <Badge variant={appt.status === 'Canceled' ? 'destructive' : 'secondary'}>{appt.status}</Badge>
                        </div>
                    </Card>
                )) : <p>No past appointments.</p>}
            </CardContent>
        </Card>
    )
}


export default function AppointmentsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState({});

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  useEffect(() => {
    if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
      setTranslations(languageFiles[userProfile.preferredLanguage]);
    } else {
      setTranslations({});
    }
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                {t('book_appointment_page_title', 'Book an Appointment')}
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                {t('book_appointment_page_desc', 'Find doctors, manage your upcoming appointments, and view your consultation history.')}
            </p>
        </div>

        <Tabs defaultValue="find-doctors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="find-doctors">
                    <Search className="mr-2 h-4 w-4"/> {t('find_doctors_tab', 'Find Doctors')}
                </TabsTrigger>
                <TabsTrigger value="my-appointments">
                    <ClipboardList className="mr-2 h-4 w-4" /> {t('my_appointments_tab', 'My Appointments')}
                </TabsTrigger>
                <TabsTrigger value="history">
                    <History className="mr-2 h-4 w-4" /> {t('history_tab', 'History')}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="find-doctors" className="mt-8">
                <FindDoctors t={t} userProfile={userProfile}/>
            </TabsContent>
            <TabsContent value="my-appointments" className="mt-8">
                <MyAppointments t={t}/>
            </TabsContent>
            <TabsContent value="history" className="mt-8">
                <HistoryTab t={t}/>
            </TabsContent>
        </Tabs>
    </div>
  );
}
