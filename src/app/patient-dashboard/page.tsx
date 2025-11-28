
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus, Receipt, ScanText, Mic, ArrowRight, Sparkles, Bot, BookUser, FlaskConical, History, ShieldCheck, FileText, ChevronRight, ChevronsUpDown, Volume2, Loader2, Play } from 'lucide-react';
import { doc, collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { getHealthInformation, type HealthAssistantOutput } from '@/ai/flows/health-assistant-flow';
import { textToSpeech, type TextToSpeechOutput } from '@/ai/flows/text-to-speech-flow';
import { useToast } from '@/hooks/use-toast';
import { VirtualIdCard } from '@/components/patient/virtual-id-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const languageFiles = { hi, bn, ta, te, mr };

interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

export default function PatientDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [translations, setTranslations] = useState({});

  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState<HealthAssistantOutput | null>(null);

  const [isAssistantResponseOpen, setIsAssistantResponseOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const [playback, setPlayback] = useState<{isPlaying: boolean, isLoading: boolean}>({isPlaying: false, isLoading: false});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  const billsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, `users/${user.uid}/healthRecords`),
        where('recordType', '==', 'bill')
    );
  }, [user, firestore]);

  const { data: bills, isLoading: isLoadingBills } = useCollection(billsQuery);

  const recentBills = useMemo(() => {
    if (!bills) return [];
    return bills.sort((a,b) => b.dateCreated?.toMillis() - a.dateCreated?.toMillis()).slice(0,3);
  }, [bills]);

  useEffect(() => {
    if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
      setTranslations(languageFiles[userProfile.preferredLanguage]);
      setLanguage(userProfile.preferredLanguage);
    } else {
      setTranslations({});
      setLanguage('en');
    }
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;
  
  useEffect(() => {
    const SpeechRecognition = (window as IWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        toast({ variant: 'destructive', title: 'Speech Recognition Error', description: `Could not start listening. Error: ${event.error}` });
      }
      setIsListening(false);
    };

    const audio = new Audio();
    audioRef.current = audio;
    audio.onended = () => {
        setPlayback({ isPlaying: false, isLoading: false });
    };

    return () => {
      recognition.stop();
      audio.pause();
    };
  }, [toast]);
  
  useEffect(() => {
    if(recognitionRef.current) {
        recognitionRef.current.lang = language;
    }
  }, [language]);


  const handleListen = () => {
    if (!recognitionRef.current) {
      toast({ variant: 'destructive', title: 'Feature Not Supported', description: 'Speech recognition is not supported in your browser.' });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch(e) {
        console.error("Could not start speech recognition", e);
        setIsListening(false); // Ensure state is reset on error
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start the speech recognition service. Please check microphone permissions.' });
      }
    }
  };

  const handleTextToSpeech = async (text: string) => {
    if(playback.isLoading || playback.isPlaying) {
        audioRef.current?.pause();
        setPlayback({ isPlaying: false, isLoading: false });
        return;
    }

    setPlayback({ isPlaying: false, isLoading: true });
    try {
        const { audioDataUri } = await textToSpeech({ text });
        if(audioRef.current) {
            audioRef.current.src = audioDataUri;
            audioRef.current.play();
            setPlayback({ isPlaying: true, isLoading: false });
        }
    } catch(e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Text-to-Speech failed' });
        setPlayback({ isPlaying: false, isLoading: false });
    }
  }


  const handleGetInformation = async () => {
    if (!question) return;
    setIsLoading(true);
    setAssistantResponse(null);
    try {
      const result = await getHealthInformation({ question, language });
      setAssistantResponse(result);
    } catch (error) {
      console.error('Error getting health information:', error);
      toast({
        variant: 'destructive',
        title: t('ai_assistant_failed_title', 'AI Assistant Failed'),
        description: t('ai_assistant_failed_desc', 'The AI service is currently busy. Please wait a moment and try again.'),
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('welcome_back_message', 'Welcome back')}, {userProfile?.firstName || user?.email?.split('@')[0]}!</h1>
            <p className="text-lg text-muted-foreground mt-2">{t('dashboard_overview_subtitle', 'Here\'s a quick overview of your health dashboard.')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">

                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <Link href="/appointments" className="block">
                        <Card className="h-full hover:shadow-lg hover:border-primary transition-all">
                            <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <CalendarPlus className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{t('book_appointment_card_title', 'Book Appointment')}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{t('book_appointment_card_desc', 'Find a doctor and schedule a visit')}</p>
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
                                    <h3 className="font-semibold text-lg">{t('pay_bill_card_title', 'Pay a Bill')}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{t('pay_bill_card_desc', 'View and manage your medical bills')}</p>
                                </div>
                            </CardContent>
                        </Card>
                      </Link>
                      <Link href="/records/analyze-prescription" className="block">
                         <Card className="h-full hover:shadow-lg hover:border-primary transition-all">
                            <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <ScanText className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{t('analyze_prescription_card_title', 'Analyze Prescription')}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{t('analyze_prescription_card_desc', 'Upload and extract prescription details')}</p>
                                </div>
                            </CardContent>
                        </Card>
                      </Link>
                  </div>
            
                  <Card id="health-assistant" className="shadow-sm border-t-4 border-primary">
                      <CardHeader>
                          <div className="flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <CardTitle>{t('health_assistant_title', 'Health Information Assistant')}</CardTitle>
                          </div>
                           <CardDescription>
                              {t('health_assistant_desc', 'Ask about health conditions, prescriptions, or any wellness questions in your preferred language.')}
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                           <div className="space-y-2">
                              <label htmlFor="question" className="text-sm font-medium">{t('your_question_label', 'Your Question')}</label>
                              <div className="relative">
                                 <Textarea 
                                  id="question"
                                  value={question}
                                  onChange={(e) => setQuestion(e.target.value)}
                                  placeholder={t('health_assistant_placeholder', 'e.g., What are the side effects of Paracetamol? or Tell me about diabetes management.')}
                                  className="pr-12 min-h-[120px]"
                                  rows={4}
                                 />
                                 <Button variant="ghost" size="icon" className="absolute bottom-2.5 right-2.5 text-muted-foreground" onClick={handleListen}>
                                  <Mic className={cn("h-5 w-5", isListening && "text-primary")}/>
                                 </Button>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label htmlFor="language" className="text-sm font-medium">{t('language_label', 'Language')}</label>
                              <Select value={language} onValueChange={setLanguage}>
                                  <SelectTrigger id="language">
                                      <SelectValue placeholder="English" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="en">English</SelectItem>
                                      <SelectItem value="hi">Hindi</SelectItem>
                                      <SelectItem value="bn">Bengali</SelectItem>
                                      <SelectItem value="ta">Tamil</SelectItem>
                                      <SelectItem value="te">Telugu</SelectItem>
                                      <SelectItem value="mr">Marathi</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <Button onClick={handleGetInformation} disabled={isLoading || !question}>
                            {isLoading ? t('getting_info_button_loading', 'Getting Information...') : t('get_info_button', 'Get Information')}
                          </Button>
                      </CardContent>
                  </Card>
                   {assistantResponse && (
                    <Collapsible asChild open={isAssistantResponseOpen} onOpenChange={setIsAssistantResponseOpen}>
                      <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Bot className="h-6 w-6 text-accent" />
                              <CardTitle>{t('assistant_response_title', 'Assistant\'s Response')}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" disabled={playback.isLoading} onClick={() => handleTextToSpeech(assistantResponse.answer)}>
                                    {playback.isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : playback.isPlaying ? (
                                        <Play className="h-5 w-5 text-primary fill-primary" />
                                    ) : (
                                        <Volume2 className="h-5 w-5" />
                                    )}
                                </Button>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <ChevronsUpDown className="h-4 w-4" />
                                        <span className="sr-only">Toggle</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                        </CardHeader>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="prose prose-sm max-w-full text-foreground whitespace-pre-wrap">
                              {assistantResponse.answer}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  )}
              </div>
              <div className="space-y-8">
                   <Card className="shadow-sm">
                      <CardHeader>
                          <CardTitle>{t('my_profile_card_title', 'My Profile')}</CardTitle>
                          <CardDescription>{t('my_profile_card_desc', 'A quick glance at your profile.')}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center text-center">
                          <Avatar className="h-28 w-28 mb-4 border-2 border-primary">
                              <AvatarImage src={user?.photoURL ?? ''} data-ai-hint="profile photo" />
                              <AvatarFallback className="text-3xl">{userProfile?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-xl">{userProfile?.firstName} {userProfile?.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                          <Button variant="link" asChild className="mt-4 text-primary">
                              <Link href="/patient-profile">
                                  {t('view_full_profile_link', 'View Full Profile')} <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                          </Button>
                      </CardContent>
                   </Card>
                   <VirtualIdCard user={user} userProfile={userProfile} t={t} />
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('my_health_records_card_title', 'My Health Records')}</CardTitle>
                <CardDescription>{t('my_health_records_card_desc', 'View your medical history, prescriptions, and more.')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                      <Link href="/records/medical-history" className="flex items-center gap-3 p-3 rounded-md hover:bg-muted">
                        <History className="h-5 w-5 text-primary"/>
                        <span className="font-medium">{t('medical_history_link', 'Medical History')}</span>
                      </Link>
                       <Link href="/records/prescriptions" className="flex items-center gap-3 p-3 rounded-md hover:bg-muted">
                        <BookUser className="h-5 w-5 text-primary"/>
                        <span className="font-medium">{t('prescriptions_link', 'Prescriptions')}</span>
                      </Link>
                       <Link href="/records/lab-reports" className="flex items-center gap-3 p-3 rounded-md hover:bg-muted">
                        <FlaskConical className="h-5 w-5 text-primary"/>
                        <span className="font-medium">{t('lab_reports_link', 'Lab Reports')}</span>
                      </Link>
                       <Link href="/records/vaccination-records" className="flex items-center gap-3 p-3 rounded-md hover:bg-muted">
                        <ShieldCheck className="h-5 w-5 text-primary"/>
                        <span className="font-medium">{t('vaccinations_link', 'Vaccinations')}</span>
                      </Link>
                  </div>
                  <Button variant="link" asChild className="mt-4 text-primary p-0 h-auto">
                    <Link href="/records">{t('view_all_link', 'View All')} <ChevronRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>{t('my_bills_card_title', 'My Bills')}</CardTitle>
                    <CardDescription>{t('my_bills_card_desc', 'A summary of your recent medical expenses.')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingBills ? (
                         <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-2/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            ))}
                        </div>
                    ) : recentBills.length > 0 ? (
                        <ul className="space-y-3">
                            {recentBills.map(bill => (
                                <li key={bill.id} className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{bill.details.title}</span>
                                    <span className="font-semibold">{t('currency_symbol', 'Rs.')} {bill.details.amount.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No recent bills.</p>
                    )}

                     <Button variant="link" asChild className="mt-4 text-primary p-0 h-auto">
                        <Link href="/billing">{t('view_all_bills_link', 'View All Bills')} <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
