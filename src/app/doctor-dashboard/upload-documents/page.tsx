
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BackButton } from '@/components/layout/back-button';
import { Upload } from 'lucide-react';

export default function UploadDocumentsPage() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-12 space-y-8">
        <BackButton />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6" />
            <CardTitle>Upload Medical Document</CardTitle>
          </div>
          <CardDescription>This feature is currently being updated. Please check back later.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Upload functionality will be available here.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
