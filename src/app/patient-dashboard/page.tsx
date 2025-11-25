'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus, Receipt, ScanText, Mic, ArrowRight } from 'lucide-react';
import { doc } from 'firebase/firestore';
import Link from 'next/link';

export default function PatientDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {userProfile?.firstName || user?.email?.split('@')[0]}!</h1>
            <p className="text-muted-foreground">Here's a quick overview of your health dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 flex items-center gap-4">
                      <div className="p-3 bg-accent/20 rounded-lg">
                          <CalendarPlus className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                          <h3 className="font-semibold">Book Appointment</h3>
                          <p className="text-sm text-muted-foreground">Find a doctor and schedule a visit</p>
                      </div>
                  </CardContent>
              </Card>
               <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 flex items-center gap-4">
                      <div className="p-3 bg-accent/20 rounded-lg">
                          <Receipt className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                          <h3 className="font-semibold">Pay a Bill</h3>
                          <p className="text-sm text-muted-foreground">View and manage your medical bills</p>
                      </div>
                  </CardContent>
              </Card>
               <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 flex items-center gap-4">
                      <div className="p-3 bg-accent/20 rounded-lg">
                          <ScanText className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                          <h3 className="font-semibold">Analyze Prescription</h3>
                          <p className="text-sm text-muted-foreground">Upload and extract prescription details</p>
                      </div>
                  </CardContent>
              </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                  <Card>
                      <CardHeader>
                          <CardTitle>Health Information Assistant</CardTitle>
                           <p className="text-sm text-muted-foreground pt-1">
                              Ask about your health conditions, prescriptions, or any other health-related questions in your preferred language.
                          </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                           <div className="space-y-2">
                              <label htmlFor="question" className="text-sm font-medium">Your Question</label>
                              <div className="relative">
                                 <Textarea 
                                  id="question"
                                  placeholder="e.g., What are the side effects of Paracetamol? or Tell me about diabetes management."
                                  className="pr-10"
                                  rows={4}
                                 />
                                 <Button variant="ghost" size="icon" className="absolute bottom-2 right-2 text-muted-foreground">
                                  <Mic className="h-5 w-5"/>
                                 </Button>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label htmlFor="language" className="text-sm font-medium">Language</label>
                              <Select>
                                  <SelectTrigger id="language">
                                      <SelectValue placeholder="English" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="en">English</SelectItem>
                                      <SelectItem value="hi">Hindi</SelectItem>
                                      <SelectItem value="es">Spanish</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <Button className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">Get Information</Button>
                      </CardContent>
                  </Card>
              </div>
              <div>
                   <Card>
                      <CardHeader>
                          <CardTitle>My Profile</CardTitle>
                          <p className="text-sm text-muted-foreground pt-1">A quick glance at your profile.</p>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center text-center">
                          <Avatar className="h-24 w-24 mb-4">
                              <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/200`} data-ai-hint="profile photo" />
                              <AvatarFallback>{userProfile?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold">{userProfile?.firstName} {userProfile?.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                          <Button variant="link" asChild className="mt-4 text-primary">
                              <Link href="#">
                                  View Full Profile <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                          </Button>
                      </CardContent>
                   </Card>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}
