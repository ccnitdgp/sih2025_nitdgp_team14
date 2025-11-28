
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { personalNotifications } from '@/lib/data';
import { Calendar, Volume2, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';

const languageFiles = { hi, bn, ta, te, mr };

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

  const { user } = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = React.useState({});

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  React.useEffect(() => {
    if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
      setTranslations(languageFiles[userProfile.preferredLanguage]);
    } else {
      setTranslations({});
    }
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;


  const handleTextToSpeech = async (notification: typeof personalNotifications[0]) => {
    if (!userProfile) return;

    // Check if the specific notification type is enabled in user settings
    const settingKey = notification.type;
    if (userProfile.notificationSettings && !userProfile.notificationSettings[settingKey]) {
      toast({
        variant: "default",
        title: "Reminders Disabled",
        description: `Please enable "${t(settingKey, settingKey)}" reminders in settings to hear this notification.`,
      });
      return;
    }

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
        title: t('ai_speech_failed_title', "AI Speech Failed"),
        description: t('ai_speech_failed_desc', "Could not generate audio for this notification."),
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
        <CardTitle>{t('notification_history_title', 'Notification History')}</CardTitle>
        <CardDescription>{t('total_notifications_desc', `You have ${personalNotifications.length} total notifications.`)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {personalNotifications.length > 0 ? (
          personalNotifications.map((notification) => {
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
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No notifications to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
