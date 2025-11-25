
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, User, MapPin, Calendar, Star } from 'lucide-react';
import { getSpecialistSuggestion, type SymptomCheckerOutput } from '@/ai/flows/symptom-checker-flow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const doctors = [
  {
    name: 'Dr. Anjali Sharma',
    specialty: 'Cardiologist',
    location: 'Apollo Hospital, Delhi',
    nextAvailable: 'Tomorrow, 10:00 AM',
    rating: 4.9,
    reviews: 120,
    avatar: 'https://picsum.photos/seed/doc1/200',
    availableSlots: [
        { date: '2024-09-01', time: '10:00 AM' },
        { date: '2024-09-01', time: '11:30 AM' },
        { date: '2024-09-02', time: '02:00 PM' },
        { date: '2024-09-02', time: '04:00 PM' },
    ],
  },
  {
    name: 'Dr. Vikram Singh',
    specialty: 'Dermatologist',
    location: 'Max Healthcare, Gurgaon',
    nextAvailable: 'Today, 4:30 PM',
    rating: 4.8,
    reviews: 85,
    avatar: 'https://picsum.photos/seed/doc2/200',
    availableSlots: [
        { date: '2024-08-31', time: '04:30 PM' },
        { date: '2024-08-31', time: '05:00 PM' },
        { date: '2024-09-01', time: '09:00 AM' },
    ],
  },
  {
    name: 'Dr. Priya Gupta',
    specialty: 'General Physician',
    location: 'Fortis Hospital, Noida',
    nextAvailable: 'Today, 2:00 PM',
    rating: 4.9,
    reviews: 210,
    avatar: 'https://picsum.photos/seed/doc3/200',
    availableSlots: [
        { date: '2024-08-31', time: '02:00 PM' },
        { date: '2024-08-31', time: '03:15 PM' },
        { date: '2024-09-01', time: '10:00 AM' },
    ],
  },
];

type Doctor = (typeof doctors)[0];
type Slot = (typeof doctors)[0]['availableSlots'][0];

export default function AppointmentsPage() {
  const [symptoms, setSymptoms] = useState('');
  const [suggestion, setSuggestion] = useState<SymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
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
  };

  const handleBookAppointment = (doctorName: string, slot: Slot) => {
    setSelectedDoctor(null); // Close the dialog
    toast({
      title: 'Appointment Booked!',
      description: `Your appointment with ${doctorName} on ${new Date(slot.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${slot.time} has been successfully scheduled.`,
    });
  };

  const filteredDoctors = suggestion
    ? doctors.filter(doc => doc.specialty === suggestion.specialistSuggestion)
    : doctors;
    
  const doctorsToShow = filteredDoctors.length > 0 ? filteredDoctors : doctors;

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
                        <Calendar className="h-4 w-4 text-primary"/>
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
    
    <Dialog open={!!selectedDoctor} onOpenChange={(isOpen) => !isOpen && setSelectedDoctor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment with {selectedDoctor?.name}</DialogTitle>
            <DialogDescription>
              Select an available time slot below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-3">
              {selectedDoctor?.availableSlots.map((slot, index) => (
                <Button 
                  key={index} 
                  variant="outline"
                  onClick={() => handleBookAppointment(selectedDoctor.name, slot)}
                  className="flex flex-col h-auto py-2"
                >
                  <span>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="font-bold text-base">{slot.time}</span>
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setSelectedDoctor(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
