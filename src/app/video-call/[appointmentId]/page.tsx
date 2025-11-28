
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, PhoneOff, Mic, MicOff, VideoOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function VideoCallPage() {
  const router = useRouter();
  const params = useParams();
  const { appointmentId } = params;
  const firestore = useFirestore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        // Request both video and audio permissions
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Clean up stream when component unmounts
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };

      } catch (error) {
        console.error('Error accessing media devices:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera & Mic Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings to use the video call feature.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);

  const handleLeaveCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    if (firestore && appointmentId) {
        const apptRef = doc(firestore, 'appointments', appointmentId as string);
        updateDocumentNonBlocking(apptRef, { status: 'Completed' });
    }

    router.back();
  };

  const toggleMic = () => {
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsMicMuted(!track.enabled);
        });
    }
  };

  const toggleCamera = () => {
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsCameraOff(!track.enabled);
        });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Virtual Consultation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full bg-black rounded-md overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black/50">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-xl font-semibold text-white">Camera Access Required</h3>
                <p className="text-muted-foreground text-white/80">
                  Please allow camera and microphone access in your browser settings to start the video call.
                </p>
              </div>
            )}
             {isCameraOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="flex flex-col items-center gap-2">
                         <VideoOff className="h-10 w-10 text-white" />
                         <p className="text-white font-medium">Camera is off</p>
                    </div>
                </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-muted/50 py-4">
             <Button
                variant="outline"
                size="icon"
                onClick={toggleMic}
                className={cn("h-12 w-12 rounded-full", isMicMuted && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
                {isMicMuted ? <MicOff /> : <Mic />}
            </Button>
             <Button
                variant="outline"
                size="icon"
                onClick={toggleCamera}
                className={cn("h-12 w-12 rounded-full", isCameraOff && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            >
                {isCameraOff ? <VideoOff /> : <Video />}
            </Button>
             <Button
                variant="destructive"
                size="icon"
                onClick={handleLeaveCall}
                className="h-12 w-12 rounded-full"
                aria-label="Leave call"
            >
                <PhoneOff />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
