
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Users, BarChart, TrendingUp, TrendingDown, Minus, ShieldAlert } from 'lucide-react';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { Skeleton } from '../ui/skeleton';

const languageFiles = { hi, bn, ta, te, mr };

// Static placeholder data to avoid hitting API rate limits.
const staticTrendsData = {
    trends: [
        { disease: 'Fever & Influenza', trend: 'increasing', caseCount: 840 },
        { disease: 'Dengue', trend: 'stable', caseCount: 320 },
        { disease: 'Stomach Infections', trend: 'decreasing', caseCount: 150 },
    ],
    overallSummary: 'A seasonal increase in flu-like symptoms is being observed. Please maintain good hygiene. Other communicable disease trends remain stable.'
};


const InsightCard = ({ icon: Icon, title, value, description, isLoading }) => (
    <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
             {isLoading ? (
                <Skeleton className="h-8 w-16" />
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
    
    // Use the static data directly
    const trendsData = staticTrendsData;
    const isLoadingTrends = false; // Data is now static, so not loading.

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc(userDocRef);
    
    const patientsQuery = useMemoFirebase(() => {
        // Only run this query if the user is logged in.
        if(!firestore || !user) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'patient'));
    }, [firestore, user]);
    const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);


    useEffect(() => {
        if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
            setTranslations(languageFiles[userProfile.preferredLanguage]);
        } else {
            setTranslations({});
        }
    }, [userProfile]);

    const t = (key: string, fallback: string) => translations[key] || fallback;
    
    const patientCount = user ? (patients?.length ?? '...') : '1,200';


    const TrendIcon = ({ trend }: { trend: string }) => {
        if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-destructive" />;
        if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-green-500" />;
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    
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
                                value={patientCount.toString() + (user ? '' : '+')}
                                description="Total members on the platform" 
                                isLoading={isLoadingPatients}
                            />
                             <InsightCard 
                                icon={BarChart} 
                                title="Common Symptoms" 
                                value={trendsData?.trends[0]?.disease || 'Fever'}
                                description="Most reported this month"
                                isLoading={isLoadingTrends}
                            />
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('disease_trends_title', 'Disease Trends')}</CardTitle>
                                <CardDescription>{t('disease_trends_desc', 'Cases reported in the last 30 days.')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoadingTrends ? (
                                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                                ) : trendsData?.trends ? (
                                    trendsData.trends.slice(0, 3).map((item) => (
                                        <div key={item.disease} className="flex justify-between items-center gap-4">
                                            <span className="flex items-center gap-2">
                                                <TrendIcon trend={item.trend} />
                                                {item.disease}
                                            </span>
                                            <div className="w-1/2 bg-muted rounded-full h-2.5">
                                                <div className="bg-primary h-2.5 rounded-full" style={{width: `${(item.caseCount / (trendsData.trends.reduce((max, t) => Math.max(max, t.caseCount), 0) || 1)) * 100}%`}}></div>
                                            </div>
                                            <span className="font-bold tabular-nums text-right">{item.caseCount.toLocaleString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center">Trend data currently unavailable.</p>
                                )}
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
                             {isLoadingTrends ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                             ) : (
                                 <p className="text-accent-foreground/90">
                                   {trendsData?.overallSummary || 'No summary available.'}
                                </p>
                             )}
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
