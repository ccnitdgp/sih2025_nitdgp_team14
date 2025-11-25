'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, User, MapPin, Calendar, Star } from 'lucide-react';
import { getSpecialistSuggestion, type SymptomCheckerOutput } from '@/ai/flows/symptom-checker-flow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const doctors = [
  {
    name: 'Dr. Anjali Sharma',
    specialty: 'Cardiologist',
    location: 'Apollo Hospital, Delhi',
    nextAvailable: 'Tomorrow, 10:00 AM',
    rating: 4.9,
    reviews: 120,
    avatar: 'https://picsum.photos/seed/doc1/200',
  },
  {
    name: 'Dr. Vikram Singh',
    specialty: 'Dermatologist',
    location: 'Max Healthcare, Gurgaon',
    nextAvailable: 'Today, 4:30 PM',
    rating: 4.8,
    reviews: 85,
    avatar: 'https://picsum.photos/seed/doc2/200',
  },
  {
    name: 'Dr. Priya Gupta',
    specialty: 'General Physician',
    location: 'Fortis Hospital, Noida',
    nextAvailable: 'Today, 2:00 PM',
    rating: 4.9,
    reviews: 210,
    avatar: 'https://picsum.photos/seed/doc3/200',
  },
];


export default function AppointmentsPage() {
  const [symptoms, setSymptoms] = useState('');
  const [suggestion, setSuggestion] = useState<SymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSuggestion = async () => {
    if (!symptoms) return;
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getSpecialistSuggestion({ symptomDescription: symptoms });
      setSuggestion(result);
    } catch (error) {
      console.error('Error getting suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedDoctors = suggestion ? doctors.filter(doc => doc.specialty === suggestion.specialistSuggestion) : doctors;

  return (
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
          <h2 className="text-3xl font-bold tracking-tight mb-6">Doctors Near You</h2>
          <div className="space-y-6">
            {(suggestion ? suggestedDoctors : doctors).map((doctor, index) => (
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
                    <Button>Book Appointment</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {suggestion && suggestedDoctors.length === 0 && (
                <p className="text-center text-muted-foreground">No doctors found for the suggested specialty. Showing all doctors.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
