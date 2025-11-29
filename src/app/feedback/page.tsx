
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Bug, Lightbulb, MessageSquare } from 'lucide-react';
import { BackButton } from '@/components/layout/back-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

const Rating = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
    </div>
);

const FeedbackCard = ({ feedback }) => (
    <Card>
        <CardHeader className="flex flex-row items-center gap-4">
            <Avatar>
                <AvatarFallback>{feedback.userName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-lg">{feedback.userName}</CardTitle>
                <Rating rating={feedback.rating} />
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground italic">&quot;{feedback.message}&quot;</p>
            <p className="text-xs text-muted-foreground mt-4">{new Date(feedback.createdAt.seconds * 1000).toLocaleDateString()}</p>
        </CardContent>
    </Card>
);

const FeedbackSkeleton = () => (
    <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
            <div key={i}>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        ))}
    </div>
);

const FeedbackCategory = ({ title, icon: Icon, feedbackList }) => {
    if (!feedbackList || feedbackList.length === 0) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Icon className="h-6 w-6 text-primary" />
                {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedbackList.map((item) => (
                    <FeedbackCard key={item.id} feedback={item} />
                ))}
            </div>
        </div>
    );
}

export default function ViewFeedbackPage() {
    const firestore = useFirestore();
    const feedbackQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: feedback, isLoading } = useCollection(feedbackQuery);

    const categorizedFeedback = useMemo(() => {
        if (!feedback) return { general: [], bugs: [], features: [] };
        return {
            general: feedback.filter(f => f.feedbackType === 'General Feedback'),
            bugs: feedback.filter(f => f.feedbackType === 'Bug Report'),
            features: feedback.filter(f => f.feedbackType === 'Feature Request'),
        };
    }, [feedback]);
    
    return (
        <div className="container mx-auto max-w-4xl px-6 py-12">
            <BackButton />
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                    User Feedback
                </h1>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                    See what our users are saying about Swasthya.
                </p>
            </div>

            <div className="space-y-12">
                {isLoading ? <FeedbackSkeleton /> : feedback && feedback.length > 0 ? (
                    <>
                        <FeedbackCategory title="General Feedback" icon={MessageSquare} feedbackList={categorizedFeedback.general} />
                        <FeedbackCategory title="Bug Reports" icon={Bug} feedbackList={categorizedFeedback.bugs} />
                        <FeedbackCategory title="Feature Requests" icon={Lightbulb} feedbackList={categorizedFeedback.features} />
                    </>
                ) : (
                    <Card className="text-center p-8">
                        <CardTitle>No Feedback Yet</CardTitle>
                        <CardDescription>Check back later to see what our users are saying.</CardDescription>
                    </Card>
                )}
            </div>
        </div>
    )
}
