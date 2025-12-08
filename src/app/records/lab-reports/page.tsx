
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FlaskConical, FileDown, Scan, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { useToast } from '@/hooks/use-toast';

const languageFiles = { hi, bn, ta, te, mr };

const reportIcons = {
  labReport: <FlaskConical className="h-5 w-5 text-primary" />,
  scanReport: <Scan className="h-5 w-5 text-primary" />,
  vaccinationRecord: <ShieldCheck className="h-5 w-5 text-primary" />,
  other: <FileText className="h-5 w-5 text-primary" />,
};

const ReportCard = ({ report, onDownload, t }) => (
    <Card className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
            <div className="p-2 bg-primary/10 rounded-md">
                {reportIcons[report.recordType] || <FileText className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-lg">{report.details.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('date_label', 'Date')}: {report.details.date} - {t('issued_by_label', 'Issued by')}: {report.details.issuer}
                </p>
            </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => onDownload(report)}>
            <FileDown className="mr-2 h-4 w-4"/>
            {t('download_button', 'Download')}
        </Button>
    </Card>
);

export default function LabReportsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
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

  const healthRecordsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, `users/${user.uid}/healthRecords`),
        where('recordType', 'in', ['labReport', 'scanReport', 'vaccinationRecord', 'other'])
    );
  }, [user, firestore]);
  
  const { data: healthRecords, isLoading } = useCollection(healthRecordsQuery);

  const handleDownload = async (report: any) => {
    if (!report.details?.downloadUrl) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "The file URL is missing or invalid.",
      });
      return;
    }
    try {
      window.open(report.details.downloadUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not open the file. Please check popup blockers and try again.",
      });
    }
  };

  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-9 w-28" />
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                <FlaskConical className="h-6 w-6" />
                <CardTitle className="text-2xl">{t('lab_reports_page_title', 'Uploaded Reports')}</CardTitle>
                </div>
                <CardDescription>
                    {t('lab_reports_page_desc', 'View and manage your diagnostic lab, scan, and other uploaded reports.')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading ? <SkeletonLoader /> : healthRecords && healthRecords.length > 0 ? (
                    healthRecords.map((report) => (
                        <ReportCard 
                            key={report.id}
                            report={report}
                            onDownload={handleDownload}
                            t={t}
                        />
                    ))
                ) : (
                    !isLoading && <p className="text-muted-foreground text-center py-4">{t('no_lab_reports_text', 'No reports uploaded yet.')}</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
