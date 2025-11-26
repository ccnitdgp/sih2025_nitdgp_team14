'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Pill, Info, Sparkles, Bot, ScanText, Stethoscope, Calendar, Volume2, Clock, BarChart, Power } from 'lucide-react';
import Image from 'next/image';
import { analyzePrescription, type AnalyzePrescriptionOutput } from '@/ai/flows/analyze-prescription-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

export default function AnalyzePrescriptionPage() {
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzePrescriptionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!prescriptionImage) {
      toast({
        variant: "destructive",
        title: t('no_image_selected_toast_title', "No Image Selected"),
        description: t('no_image_selected_toast_desc', "Please upload an image of your prescription first."),
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const result = await analyzePrescription({ photoDataUri: prescriptionImage });
      setAnalysis(result);
      toast({
          title: t('analysis_complete_toast_title', "Analysis Complete"),
          description: t('analysis_complete_toast_desc', "Prescription details extracted successfully."),
      });
    } catch (error) {
      console.error('Error analyzing prescription:', error);
      toast({
        variant: 'destructive',
        title: t('analysis_failed_toast_title', 'Analysis Failed'),
        description: t('analysis_failed_toast_desc', 'The AI service could not analyze the prescription. Please try again.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    } else {
        toast({
            variant: "destructive",
            title: t('unsupported_feature_toast_title', "Unsupported Feature"),
            description: t('unsupported_feature_toast_desc', "Text-to-speech is not supported in your browser."),
        });
    }
  };


  const AnalysisSkeleton = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
        </div>
        <Separator />
        {[...Array(2)].map((_, i) => (
         <div key={i} className="space-y-4 py-4 border-b">
            <Skeleton className="h-6 w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
        ))}
    </div>
  );
  
  const DetailItem = ({ icon: Icon, label, value, textToSpeak }) => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span><span className="font-semibold text-foreground">{label}:</span> {value}</span>
        {textToSpeak && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleTextToSpeech(textToSpeak)}><Volume2 className="h-4 w-4" /></Button>}
    </div>
  );

  return (
    <div className="space-y-8">
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <ScanText className="h-6 w-6" />
              <CardTitle className="text-2xl">{t('analyze_prescription_page_title', 'Analyze Prescription')}</CardTitle>
            </div>
            <CardDescription>
                {t('analyze_prescription_page_desc', 'Upload an image of a prescription to automatically extract key details using AI.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                <Label htmlFor="prescription-upload">{t('prescription_image_label', 'Prescription Image')}</Label>
                 <div
                  className="group relative"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    id="prescription-upload"
                  />
                  <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground bg-secondary/40 hover:bg-secondary/80"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {prescriptionImage ? t('change_image_button', 'Change Image') : t('select_image_button', 'Select an Image')}
                  </Button>
                </div>
            </div>

            {prescriptionImage && (
                <div className="relative w-full max-w-sm mx-auto p-2 border rounded-md">
                     <Image
                        src={prescriptionImage}
                        alt="Prescription preview"
                        width={400}
                        height={300}
                        className="rounded-md object-contain"
                    />
                     <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-7 w-7"
                        onClick={(e) => {
                        e.stopPropagation();
                        setPrescriptionImage(null);
                        setAnalysis(null);
                        if(fileInputRef.current) fileInputRef.current.value = "";
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            
            <Button onClick={handleAnalyze} disabled={!prescriptionImage || isLoading}>
               <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? t('analyzing_button_loading', 'Analyzing...') : t('analyze_prescription_button', 'Analyze Prescription')}
            </Button>
          </CardContent>
        </Card>

        {isLoading && <Card><CardContent className="pt-6"><AnalysisSkeleton /></CardContent></Card>}
        
        {analysis && (
          <Card>
            <CardHeader>
                <CardTitle>{t('analysis_result_title', 'Analysis Result')}</CardTitle>
                <CardDescription>{t('analysis_result_desc', 'The extracted information from the prescription is shown below.')}</CardDescription>
                 <Alert variant="destructive" className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t('disclaimer_title', 'Disclaimer')}</AlertTitle>
                    <AlertDescription>
                        {t('ai_disclaimer_desc', 'This analysis is AI-generated for informational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist regarding your treatment.')}
                    </AlertDescription>
                </Alert>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary"/>
                        <span className="font-semibold">{t('doctor_label', 'Doctor')}: {analysis.doctor}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTextToSpeech(`Doctor: ${analysis.doctor}`)}>
                            <Volume2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary"/>
                        <span className="font-semibold">{t('date_prescribed_label', 'Date Prescribed')}: {analysis.datePrescribed}</span>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTextToSpeech(`Date Prescribed: ${analysis.datePrescribed}`)}>
                            <Volume2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    {analysis.medications.map((med, index) => (
                    <div key={index} className="py-6 border-b last:border-b-0">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-primary">{med.medicationName}</h3>
                            <Button variant="ghost" size="icon" onClick={() => handleTextToSpeech(
                                `Medication: ${med.medicationName}. Dosage: ${med.dosage}. Use: ${med.use}. Frequency: ${med.frequency}. Status: ${med.status}`
                            )}>
                                <Volume2 className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-3">
                                <DetailItem icon={BarChart} label={t('dosage_label', 'Dosage')} value={med.dosage} />
                                <DetailItem icon={Info} label={t('use_label', 'Use')} value={med.use} />
                                <DetailItem icon={Power} label={t('status_label', 'Status')} value={med.status} />
                            </div>
                            <div className="space-y-3">
                               <DetailItem icon={Clock} label={t('frequency_label', 'Frequency')} value={med.frequency} />
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
