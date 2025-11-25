'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { medicalHistory } from '@/lib/data';
import { History, Volume2 } from 'lucide-react';

export default function MedicalHistoryPage() {

    const handleTextToSpeech = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in your browser.');
        }
    };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <History className="h-6 w-6" />
          <CardTitle className="text-2xl">Medical History</CardTitle>
        </div>
        <CardDescription>
          A summary of your past and present medical conditions as recorded by
          your doctor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {medicalHistory.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border bg-background p-4"
          >
            <p>- {item}</p>
            <Button variant="ghost" size="icon" onClick={() => handleTextToSpeech(item)}>
              <Volume2 className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
