'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { personalNotifications } from '@/lib/data';
import { Calendar, Volume2, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';

type PlaybackState = {
  isPlaying: boolean;
  isLoading: boolean;
  notificationId: number | null;
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [playback, setPlayback] = React.useState<PlaybackState>({
    isPlaying: false,
    isLoading: false,
    notificationId: null,
  });
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleTextToSpeech = async (notification: typeof personalNotifications[0]) => {
    // If another audio is playing or loading, stop it.
    if (playback.isPlaying || playback.isLoading) {
      audioRef.current?.pause();
      setPlayback({ isPlaying: false, isLoading: false, notificationId: null });
      // If the same button is clicked, just stop and return.
      if (playback.notificationId === notification.id) {
        return;
      }
    }
    
    setPlayback({ isPlaying: false, isLoading: true, notificationId: notification.id });

    try {
      const { audioDataUri } = await textToSpeech({ text: notification.message });
      
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play();
        setPlayback({ isPlaying: true, isLoading: false, notificationId: notification.id });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Speech Failed",
        description: "Could not generate audio for this notification.",
      });
      setPlayback({ isPlaying: false, isLoading: false, notificationId: null });
    }
  };
  
  React.useEffect(() => {
    // Effect to handle audio element events
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      setPlayback({ isPlaying: false, isLoading: false, notificationId: null });
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
        <CardDescription>You have {personalNotifications.length} total notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {personalNotifications.map((notification) => {
          const isCurrent = playback.notificationId === notification.id;
          const isLoading = isCurrent && playback.isLoading;
          const isPlaying = isCurrent && playback.isPlaying;

          return (
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
              <Button variant="ghost" size="icon" onClick={() => handleTextToSpeech(notification)} disabled={isLoading}>
                 {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Play className="h-5 w-5 text-primary fill-primary" />
                ) : (
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}
