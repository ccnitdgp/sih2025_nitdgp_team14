'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, MapPin, Calendar as CalendarIcon, Star, Clock } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const doctors = [
  {
    name: 'Dr. Anjali Sharma',
    specialty: 'Cardiologist',
    location: 'Apollo Hospital, Delhi',
    nextAvailable: 'Tomorrow, 10:00 AM',
    rating: 4.9,
    reviews: 120,
    avatar: 'https://picsum.photos/seed/doc1/200',
    availableSlots: {
      '2024-09-01': ['10:00 AM', '11:30 AM'],
      '2024-09-02': ['02:00 PM', '04:00 PM'],
      '2024-09-03': ['10:00 AM', '11:00 AM', '12:00 PM'],
    }
  },
  {
    name: 'Dr. Vikram Singh',
    specialty: 'Dermatologist',
    location: 'Max Healthcare, Gurgaon',
    nextAvailable: 'Today, 4:30 PM',
    rating: 4.8,
    reviews: 85,
    avatar: 'https://picsum.photos/seed/doc2/200',
     availableSlots: {
      '2024-08-31': ['04:30 PM', '05:00 PM'],
      '2024-09-01': ['09:00 AM'],
    }
  },
  {
    name: 'Dr. Priya Gupta',
    specialty: 'General Physician',
    location: 'Fortis Hospital, Noida',
    nextAvailable: 'Today, 2:00 PM',
    rating: 4.9,
    reviews: 210,
    avatar: 'https://picsum.photos/seed/doc3/200',
    availableSlots: {
      '2024-08-31': ['02:00 PM', '03:15 PM'],
      '2024-09-01': ['10:00 AM'],
    }
  },
];

type Doctor = (typeof doctors)[0];

export default function AppointmentsPage() {
  const [symptoms, setSymptoms] = useState('');
  const [suggestion, setSuggestion] = useState<SymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const { toast } = useToast();

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
        title: "AI Suggestion Failed",
        description: "The AI service is currently busy. Please wait a moment and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSlots = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  };

  const handleCloseDialog = () => {
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  }

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    
    toast({
      title: 'Appointment Booked!',
      description: `Your appointment with ${selectedDoctor.name} on ${format(selectedDate, 'PPP')} at ${selectedTime} has been successfully scheduled.`,
    });
    handleCloseDialog();
  };

  const filteredDoctors = suggestion
    ? doctors.filter(doc => doc.specialty === suggestion.specialistSuggestion)
    : doctors;
    
  const doctorsToShow = filteredDoctors.length > 0 ? filteredDoctors : doctors;

  const availableTimesForSelectedDate = selectedDoctor && selectedDate 
    ? selectedDoctor.availableSlots[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <>
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Book an Appointment
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Get an AI-powered suggestion for a specialist or browse doctors near you.
          </p>
        </div>

        <Card className="shadow-lg border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">AI-Powered Symptom Checker</CardTitle>
            </div>
             <p className="text-muted-foreground pt-2">Describe your symptoms, and we&apos;ll suggest the right specialist for you.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="symptoms" className="font-medium">Describe your health problem</label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., I have a skin rash on my arm, or I've been having chest pain..."
                className="mt-2 min-h-[100px]"
              />
            </div>
            <Button onClick={handleGetSuggestion} disabled={isLoading || !symptoms}>
              {isLoading ? 'Getting Suggestion...' : 'Get Suggestion'}
            </Button>
            {suggestion && (
              <div className="!mt-6 p-4 bg-accent/20 border border-accent/50 rounded-lg flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-accent" />
                <p>
                  Based on your symptoms, we suggest you see a{' '}
                  <span className="font-bold">{suggestion.specialistSuggestion}</span>.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            {suggestion && filteredDoctors.length > 0 ? `Suggested ${suggestion.specialistSuggestion}s` : 'Doctors Near You'}
          </h2>
          {suggestion && filteredDoctors.length === 0 && (
              <p className="text-center text-muted-foreground mb-6">
                No doctors found for the suggested specialty. Showing all doctors.
              </p>
          )}
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
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                     <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary"/>
                        <span>{doctor.location}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary"/>
                        <span>Next available: {doctor.nextAvailable}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500"/>
                        <span>{doctor.rating} ({doctor.reviews} reviews)</span>
                     </div>
                  </div>
                  <div className="flex md:justify-end">
                    <Button onClick={() => handleOpenSlots(doctor)}>Book Appointment</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    <Dialog open={!!selectedDoctor} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment with {selectedDoctor?.name}</DialogTitle>
            <DialogDescription>
              Select an available date and time slot below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="flex justify-center items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(undefined);
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) {
                    return true;
                  }
                  const dateString = format(date, 'yyyy-MM-dd');
                  // This part is crucial: we check if there are ANY slots for a given date.
                  // If not, the date should be disabled.
                  const availableSlots = selectedDoctor?.availableSlots[dateString];
                  return !availableSlots || availableSlots.length === 0;
                }}
                initialFocus
              />
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-center md:text-left">Available Time Slots</h4>
              {selectedDate ? (
                  availableTimesForSelectedDate.length > 0 ? (
                  <RadioGroup 
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                    className="grid grid-cols-2 gap-2"
                  >
                    {availableTimesForSelectedDate.map(time => (
                      <div key={time} className="flex items-center">
                        <RadioGroupItem value={time} id={time} className="peer sr-only" />
                        <Label htmlFor={time} className="flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer w-full peer-data-[state=checked]:border-primary [&:has(.peer[data-state=checked])]:border-primary">
                          <Clock className="h-4 w-4"/> {time}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <p className="text-sm text-muted-foreground text-center md:text-left">No slots available on this date.</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground text-center md:text-left">Please select a date to see available times.</p>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
             <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
             <Button onClick={handleBookAppointment} disabled={!selectedDate || !selectedTime}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
