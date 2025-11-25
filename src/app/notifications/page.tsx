'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { personalNotifications } from '@/lib/data';
import { Calendar, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {

    const { toast } = useToast();

    const handleTextToSpeech = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            toast({
                variant: "destructive",
                title: "Unsupported Feature",
                description: "Text-to-speech is not supported in your browser.",
            });
        }
    };


  return (
    <Card>
        <CardHeader>
            <CardTitle>Notification History</CardTitle>
            <CardDescription>You have {personalNotifications.length} total notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {personalNotifications.map((notification) => (
                 <div
                    key={notification.id}
                    className="flex items-center justify-between rounded-lg border bg-background p-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-md">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p>{notification.message}</p>
                            <p className="text-sm text-muted-foreground">{notification.time}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleTextToSpeech(notification.message)}>
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                    </Button>
              </div>
            ))}
        </CardContent>
    </Card>
  );
}
