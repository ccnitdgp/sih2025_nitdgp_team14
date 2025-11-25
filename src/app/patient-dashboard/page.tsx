
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome back, {userProfile?.firstName || user?.email?.split('@')[0]}!</h1>
            <p className="text-lg text-muted-foreground mt-2">Here's a quick overview of your health dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/appointments" className="block">
                <Card className="h-full hover:shadow-lg hover:border-primary transition-all">
                    <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <CalendarPlus className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Book Appointment</h3>
                            <p className="text-sm text-muted-foreground mt-1">Find a doctor and schedule a visit</p>
                        </div>
                    </CardContent>
                </Card>
              </Link>
               <Link href="/billing" className="block">
                <Card className="h-full hover:shadow-lg hover:border-primary transition-all">
                    <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Receipt className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Pay a Bill</h3>
                            <p className="text-sm text-muted-foreground mt-1">View and manage your medical bills</p>
                        </div>
                    </CardContent>
                </Card>
              </Link>
              <Link href="/analyze-prescription" className="block">
                 <Card className="h-full hover:shadow-lg hover:border-primary transition-all">
                    <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <ScanText className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Analyze Prescription</h3>
                            <p className="text-sm text-muted-foreground mt-1">Upload and extract prescription details</p>
                        </div>
                    </CardContent>
                </Card>
              </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                  <Card className="shadow-sm">
                      <CardHeader>
                          <CardTitle>Health Information Assistant</CardTitle>
                           <CardDescription>
                              Ask about your health conditions, prescriptions, or any other health-related questions in your preferred language.
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                           <div className="space-y-2">
                              <label htmlFor="question" className="text-sm font-medium">Your Question</label>
                              <div className="relative">
                                 <Textarea 
                                  id="question"
                                  placeholder="e.g., What are the side effects of Paracetamol? or Tell me about diabetes management."
                                  className="pr-12 min-h-[120px]"
                                  rows={4}
                                 />
                                 <Button variant="ghost" size="icon" className="absolute bottom-2.5 right-2.5 text-muted-foreground">
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
                          <Button>Get Information</Button>
                      </CardContent>
                  </Card>
              </div>
              <div>
                   <Card className="shadow-sm">
                      <CardHeader>
                          <CardTitle>My Profile</CardTitle>
                          <CardDescription>A quick glance at your profile.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center text-center">
                          <Avatar className="h-28 w-28 mb-4 border-2 border-primary">
                              <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/200`} data-ai-hint="profile photo" />
                              <AvatarFallback className="text-3xl">{userProfile?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-xl">{userProfile?.firstName} {userProfile?.lastName}</h3>
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
