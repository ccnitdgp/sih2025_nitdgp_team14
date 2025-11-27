
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
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, startOfDay, addMinutes, getDay, setHours, setMinutes } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useDoc, useFirestore, useMemoFirebase, addDocumentNonBlocking, useCollection } from '@/firebase';
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
  availability?: {
    workingHours?: string;
    availableDays?: string;
    appointmentDuration?: number;
  }
};

const parseTime = (timeStr: string): Date | null => {
    const time = timeStr.toLowerCase().trim();
    const match = time.match(/(\d{1,2}):?(\d{2})?\s?(am|pm)/);
    if (!match) return null;

    let [_, hour, minute, ampm] = match;
    let hourNum = parseInt(hour, 10);
    const minuteNum = minute ? parseInt(minute, 10) : 0;

    if (ampm === 'pm' && hourNum < 12) {
        hourNum += 12;
    }
    if (ampm === 'am' && hourNum === 12) { // Midnight case
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
    if (parts.length !== 2) return [];

    const [startTimeStr, endTimeStr] = parts;
    
    const startTime = parseTime(startTimeStr);
    const endTime = parseTime(endTimeStr);

    if (!startTime || !endTime || endTime <= startTime) {
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
            const startDayStr = rangeParts[0];
            const endDayStr = rangeParts[1];

            const startDay = dayMap[startDayStr];
            const endDay = dayMap[endDayStr];

            if (startDay !== undefined && endDay !== undefined) {
                // Handle ranges that wrap around the week, e.g., Sat - Mon
                if (startDay <= endDay) {
                    for (let dayIndex = startDay; dayIndex <= endDay; dayIndex++) {
                        availableDays.add(dayIndex);
                    }
                } else { // e.g. Sat - Tue
                    for (let dayIndex = startDay; dayIndex <= 6; dayIndex++) {
                        availableDays.add(dayIndex);
                    }
                    for (let dayIndex = 0; dayIndex <= endDay; dayIndex++) {
                        availableDays.add(dayIndex);
                    }
                }
            }
        } else if (rangeParts.length === 1) {
            const day = dayMap[rangeParts[0]];
            if (day !== undefined) {
                availableDays.add(day);
            }
        }
    }

    return Array.from(availableDays);
}


const FindDoctors = ({ t }) => {
  const [symptoms, setSymptoms] = useState('');
  const [suggestion, setSuggestion] = useState<SymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
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
  };

  const handleCloseDialog = () => {
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  }

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !user || !firestore) return;
    
    const newAppointmentRef = doc(collection(firestore, "appointments"));

    const newAppointment = {
        id: newAppointmentRef.id,
        doctorId: selectedDoctor.id,
        patientId: user.uid,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        type: 'In-Person', // Defaulting to In-Person for new bookings
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
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
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
                            {doctor.yearsOfExperience && (
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary"/>
                                    <span>{doctor.yearsOfExperience} years of experience</span>
                                </div>
                            )}
                        </div>
                        <div className="flex md:justify-end">
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
    const appointmentsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'appointments'), where('patientId', '==', user.uid));
    }, [user, firestore]);

    const { data: allAppointments } = useCollection(appointmentsQuery);

    const upcomingAppointments = allAppointments?.filter(appt => new Date(appt.date) >= startOfDay(new Date()));

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('upcoming_appointments_title', 'Upcoming Appointments')}</CardTitle>
                <CardDescription>{t('upcoming_appointments_desc', 'Here are your scheduled appointments.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments.map(appt => (
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
                                <MapPin className="h-4 w-4" />
                                <span>{appt.location}</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center">
                            {appt.type === 'Virtual' && (
                              <Button asChild>
                                <Link href="https://meet.google.com" target="_blank"><Video className="mr-2 h-4 w-4" />Join Call</Link>
                              </Button>
                            )}
                            <Button variant="outline">{t('reschedule_button', 'Reschedule')}</Button>
                            <Button variant="destructive">{t('cancel_button', 'Cancel')}</Button>
                        </div>
                    </Card>
                )) : <p>No upcoming appointments.</p>}
            </CardContent>
        </Card>
    )
}

const HistoryTab = ({ t }) => {
     const { user } = useUser();
    const firestore = useFirestore();
    const appointmentsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'appointments'), where('patientId', '==', user.uid));
    }, [user, firestore]);

    const { data: allAppointments } = useCollection(appointmentsQuery);

     const pastAppointments = allAppointments?.filter(appt => new Date(appt.date) < startOfDay(new Date()));
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
                                <MapPin className="h-4 w-4" />
                                <span>{appt.location}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 self-start sm:self-center">
                             {appt.type === 'Virtual' && (
                              <Button disabled>Call Ended</Button>
                            )}
                            <Button>{t('book_again_button', 'Book Again')}</Button>
                            <Button variant="outline">{t('view_details_button', 'View Details')}</Button>
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
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
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
                <FindDoctors t={t}/>
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

    