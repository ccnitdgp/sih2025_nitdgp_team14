'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Pill, Info, Sparkles, Bot } from 'lucide-react';
import Image from 'next/image';
import { analyzePrescription, type AnalyzePrescriptionOutput } from '@/ai/flows/analyze-prescription-flow';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyzePrescriptionPage() {
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzePrescriptionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        title: "No Image Selected",
        description: "Please upload an image of your prescription first.",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const result = await analyzePrescription({ photoDataUri: prescriptionImage });
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing prescription:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'The AI service could not analyze the prescription. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const AnalysisSkeleton = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
         <Card key={i} className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4 pl-16">
            <div className='space-y-2'>
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
            </div>
             <div className='space-y-2'>
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Analyze Your Prescription
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Upload a photo of your prescription to get a simple explanation of your medications.
          </p>
        </div>

        <Card className="shadow-lg border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Upload Prescription</CardTitle>
            </div>
            <CardDescription>
                Click to upload or drag and drop an image of your prescription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className="group relative flex h-64 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 transition-colors hover:border-primary hover:bg-primary/10"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                  const fakeEvent = { target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;
                  handleFileChange(fakeEvent);
                }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              {prescriptionImage ? (
                <>
                  <Image
                    src={prescriptionImage}
                    alt="Prescription preview"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg p-2"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrescriptionImage(null);
                      setAnalysis(null);
                      if(fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Upload className="mx-auto h-12 w-12" />
                  <p className="mt-4">Click to upload or drag and drop</p>
                  <p className="text-sm">PNG, JPG, or GIF</p>
                </div>
              )}
            </div>

            <Button onClick={handleAnalyze} disabled={!prescriptionImage || isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Analyzing...' : 'Analyze Prescription'}
            </Button>
          </CardContent>
        </Card>

        {isLoading && <AnalysisSkeleton />}
        
        {analysis && (
          <Card>
            <CardHeader>
               <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-primary" />
                <CardTitle>Prescription Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Disclaimer</AlertTitle>
                    <AlertDescription>
                        This analysis is AI-generated for informational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist regarding your treatment.
                    </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                    {analysis.medications.map((med, index) => (
                    <Card key={index} className="shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Pill className="h-6 w-6 text-primary" />
                            <CardTitle className="text-xl">{med.medicationName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pl-16">
                            <div>
                                <h4 className="font-semibold">How to Take It:</h4>
                                <p className="text-muted-foreground">{med.howToTake}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Why You're Taking It:</h4>
                                <p className="text-muted-foreground">{med.purpose}</p>
                            </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
