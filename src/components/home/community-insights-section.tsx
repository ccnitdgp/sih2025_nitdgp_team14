
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Users, BarChart, AreaChart, PieChart, ShieldAlert } from 'lucide-react';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

const InsightCard = ({ icon: Icon, title, value, description, isLoading }) => (
    <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
             {isLoading ? (
                <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
             ) : (
                <div className="text-2xl font-bold">{value}</div>
             )}
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);


export function CommunityInsightsSection() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [translations, setTranslations] = useState({});

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc(userDocRef);
    
    const patientsQuery = useMemoFirebase(() => {
        if(!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'patient'));
    }, [firestore]);
    const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);


    useEffect(() => {
        if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
            setTranslations(languageFiles[userProfile.preferredLanguage]);
        } else {
            setTranslations({});
        }
    }, [userProfile]);

    const t = (key: string, fallback: string) => translations[key] || fallback;
    
    return (
        <section id="community-insights" className="py-12 sm:py-24">
            <div className="container mx-auto max-w-7xl px-6">
                 <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                        {t('community_insights_title', 'Community Health Insights')}
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
                        {t('community_insights_desc', 'Anonymized and aggregated data for public health awareness. This does not use any personal medical records.')}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <InsightCard 
                                icon={Users} 
                                title="Registered Patients" 
                                value={patients?.length ?? '0'} 
                                description="Total members on the platform" 
                                isLoading={isLoadingPatients}
                            />
                            <InsightCard 
                                icon={BarChart} 
                                title={t('common_symptoms_card_title', 'Common Symptoms')} 
                                value={t('common_symptoms_card_value', 'Fever, Cough')} 
                                description={t('common_symptoms_card_desc', 'Reported this month')} 
                                isLoading={false}
                            />
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('disease_trends_title', 'Disease Trends')}</CardTitle>
                                <CardDescription>{t('disease_trends_desc', 'Cases reported in the last 30 days.')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>{t('disease_flu', 'Influenza')}</span>
                                    <div className="w-2/3 bg-muted rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{width: "75%"}}></div>
                                    </div>
                                     <span className="font-bold">340</span>
                                </div>
                                 <div className="flex justify-between items-center">
                                    <span>{t('disease_dengue', 'Dengue')}</span>
                                    <div className="w-2/3 bg-muted rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{width: "45%"}}></div>
                                    </div>
                                    <span className="font-bold">180</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>{t('disease_typhoid', 'Typhoid')}</span>
                                    <div className="w-2/3 bg-muted rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{width: "30%"}}></div>
                                    </div>
                                    <span className="font-bold">110</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                     <Card className="bg-accent/10 border-accent/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-accent">
                                <Lightbulb />
                                {t('ai_summary_title', 'AI-Powered Weekly Summary')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-accent-foreground/90">
                               {t('ai_summary_content', 'This week we saw an increase in respiratory cases. Consider taking precautions like avoiding crowded areas and wearing masks if needed. Stay hydrated to combat the effects of the current heatwave.')}
                            </p>
                            <Alert variant="destructive" className="mt-4 bg-background/50 text-foreground border-foreground/20">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle className="font-semibold">{t('disclaimer_title', 'Disclaimer')}</AlertTitle>
                                <AlertDescription className="text-xs">
                                    {t('ai_summary_disclaimer', 'This is an AI-generated summary based on anonymized data and is not a personal diagnosis. For any health issue, consult a doctor.')}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </section>
    );
}
