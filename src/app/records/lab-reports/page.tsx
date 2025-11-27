
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FlaskConical, FileDown, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, where, or } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useMemo } from 'react';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { dummyPdfContent } from '@/lib/dummy-pdf';

const languageFiles = { hi, bn, ta, te, mr };

const ReportCard = ({ report, icon, onDownload, t }) => (
    <Card className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
            <div className="p-2 bg-primary/10 rounded-md">
                {icon}
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
        where('recordType', 'in', ['labReport', 'scanReport'])
    );
  }, [user, firestore]);
  
  const { data: healthRecords, isLoading } = useCollection(healthRecordsQuery);

  const labReports = useMemo(() => healthRecords?.filter(r => r.recordType === 'labReport') || [], [healthRecords]);
  const scanReports = useMemo(() => healthRecords?.filter(r => r.recordType === 'scanReport') || [], [healthRecords]);

  const handleDownload = (report) => {
    const link = document.createElement('a');
    link.href = dummyPdfContent;
    const fileName = report.details?.fileName || `${report.details.name.replace(/\s+/g, '-')}.pdf`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                <CardTitle className="text-2xl">{t('lab_reports_page_title', 'Lab & Scan Reports')}</CardTitle>
                </div>
                <CardDescription>
                    {t('lab_reports_page_desc', 'View and manage your diagnostic lab and scan reports.')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" />{t('lab_reports_section_title', 'Lab Reports')}</h3>
                    <div className="space-y-4">
                        {isLoading ? <SkeletonLoader /> : labReports.length > 0 ? (
                            labReports.map((report) => (
                                <ReportCard 
                                    key={report.id}
                                    report={report}
                                    icon={<FlaskConical className="h-5 w-5 text-primary" />}
                                    onDownload={handleDownload}
                                    t={t}
                                />
                            ))
                        ) : (
                          !isLoading && <p className="text-muted-foreground text-center py-4">{t('no_lab_reports_text', 'No lab reports uploaded yet.')}</p>
                        )}
                    </div>
                </div>

                <div className="border-t pt-6">
                     <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Scan className="h-5 w-5 text-primary" />{t('scan_reports_section_title', 'Scans')}</h3>
                    <div className="space-y-4">
                        {isLoading ? <SkeletonLoader /> : scanReports.length > 0 ? (
                            scanReports.map((report) => (
                                <ReportCard 
                                    key={report.id}
                                    report={report}
                                    icon={<Scan className="h-5 w-5 text-primary" />}
                                    onDownload={handleDownload}
                                    t={t}
                                />
                            ))
                        ) : (
                          !isLoading && <p className="text-muted-foreground text-center py-4">{t('no_scan_reports_text', 'No scan reports uploaded yet.')}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
