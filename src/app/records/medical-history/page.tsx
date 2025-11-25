
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, PlusCircle, Volume2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

export default function MedicalHistoryPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [newHistoryItem, setNewHistoryItem] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const healthRecordsRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/healthRecords`);
    }, [user, firestore]);
    
    // This is a simplified query. In a real app, you would filter by recordType.
    const { data: medicalHistory, isLoading } = useCollection(healthRecordsRef);

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
    
    const handleAddItem = async () => {
        if (!newHistoryItem.trim() || !healthRecordsRef) return;
        
        setIsAdding(true);
        try {
            await addDoc(healthRecordsRef, {
                recordType: 'medicalHistory',
                details: newHistoryItem,
                dateCreated: serverTimestamp(),
                userId: user?.uid,
            });
            setNewHistoryItem('');
            toast({
                title: "Success",
                description: "Medical history item added.",
            });
        } catch (error) {
            console.error("Error adding medical history:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not add medical history item.",
            });
        } finally {
            setIsAdding(false);
        }
    }
    
    const SkeletonLoader = () => (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-background p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    );

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
        {isLoading ? <SkeletonLoader /> : medicalHistory && medicalHistory.length > 0 ? (
          medicalHistory
            .filter(item => item.recordType === 'medicalHistory')
            .map((item) => (
            <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border bg-background p-4"
            >
                <p>- {item.details}</p>
                <Button variant="ghost" size="icon" onClick={() => handleTextToSpeech(item.details)}>
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
            ))
        ) : (
          !isLoading && <p className="text-muted-foreground text-center py-4">No medical history recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
