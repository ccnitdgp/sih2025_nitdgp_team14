
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Send, Bug, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { BackButton } from '@/components/layout/back-button';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const feedbackSchema = z.object({
  feedbackType: z.enum(["General Feedback", "Bug Report", "Feature Request"]),
  rating: z.number().min(1, "Please select a rating.").max(5),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

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
        {[...Array(2)].map((_, i) => (
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

export default function SubmitFeedbackPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  const feedbackQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: feedback, isLoading: isLoadingFeedback } = useCollection(feedbackQuery);
  
  const categorizedFeedback = useMemo(() => {
      if (!feedback) return { general: [], bugs: [], features: [] };
      return {
          general: feedback.filter(f => f.feedbackType === 'General Feedback'),
          bugs: feedback.filter(f => f.feedbackType === 'Bug Report'),
          features: feedback.filter(f => f.feedbackType === 'Feature Request'),
      };
  }, [feedback]);


  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedbackType: "General Feedback",
      rating: 0,
      message: '',
    },
  });
  
  const rating = form.watch('rating');

  const onSubmit = (values: z.infer<typeof feedbackSchema>) => {
    if (!user || !userProfile || !firestore) return;
    
    setIsSubmitting(true);
    const feedbackColRef = collection(firestore, 'feedback');

    const feedbackData = {
        userId: user.uid,
        userName: `${userProfile.firstName} ${userProfile.lastName}`,
        feedbackType: values.feedbackType,
        rating: values.rating,
        message: values.message,
        createdAt: serverTimestamp(),
        status: "New"
    };

    addDocumentNonBlocking(feedbackColRef, feedbackData);

    toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We appreciate you taking the time to help us improve.",
    });
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
        <BackButton />
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                Submit & View Feedback
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                We value your opinion. Let us know how we can improve and see what others are saying.
            </p>
        </div>

        <Card className="mb-12">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6"/>
                    Your Feedback
                </CardTitle>
                <CardDescription>
                    Please provide as much detail as possible.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {user ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="feedbackType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Feedback Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="General Feedback">General Feedback</SelectItem>
                                            <SelectItem value="Bug Report">Bug Report</SelectItem>
                                            <SelectItem value="Feature Request">Feature Request</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Overall Rating</FormLabel>
                                    <FormControl>
                                        <div 
                                            className="flex items-center gap-1"
                                            onMouseLeave={() => setHoverRating(0)}
                                        >
                                            {[1,2,3,4,5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={cn(
                                                        "h-8 w-8 cursor-pointer transition-colors",
                                                        (hoverRating >= star || rating >= star) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                                    )}
                                                    onClick={() => field.onChange(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell us more about your experience..." {...field} className="min-h-[150px]"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            <Send className="mr-2 h-4 w-4"/>
                            {isSubmitting ? "Submitting..." : "Submit Feedback"}
                        </Button>
                    </form>
                </Form>
                 ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">You must be logged in to submit feedback.</p>
                        <AuthDialog trigger={<Button>Login to Continue</Button>} />
                    </div>
                )}
            </CardContent>
        </Card>

         <div className="space-y-12">
            {isLoadingFeedback ? <FeedbackSkeleton /> : feedback && feedback.length > 0 ? (
                <>
                    <FeedbackCategory title="General Feedback" icon={MessageSquare} feedbackList={categorizedFeedback.general} />
                    <FeedbackCategory title="Bug Reports" icon={Bug} feedbackList={categorizedFeedback.bugs} />
                    <FeedbackCategory title="Feature Requests" icon={Lightbulb} feedbackList={categorizedFeedback.features} />
                </>
            ) : (
                <Card className="text-center p-8">
                    <CardTitle>No Feedback Yet</CardTitle>
                    <CardDescription>Be the first to share your thoughts!</CardDescription>
                </Card>
            )}
        </div>
    </div>
  )
}
