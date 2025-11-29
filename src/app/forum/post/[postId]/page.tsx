
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy, serverTimestamp, increment, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Heart, Eye, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AuthDialog } from '@/components/auth/auth-dialog';

const replySchema = z.object({
  content: z.string().min(1, 'Reply cannot be empty.'),
});

export default function PostPage() {
  const params = useParams();
  const postId = params.postId as string;
  const router = useRouter();

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);

  const postRef = useMemoFirebase(() => {
    if (!firestore || !postId) return null;
    return doc(firestore, 'forumPosts', postId);
  }, [firestore, postId]);
  const { data: post, isLoading: isLoadingPost } = useDoc(postRef);

  const repliesQuery = useMemoFirebase(() => {
    if (!postRef) return null;
    return query(collection(postRef, 'replies'), orderBy('createdAt', 'asc'));
  }, [postRef]);
  const { data: replies, isLoading: isLoadingReplies } = useCollection(repliesQuery);

  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { content: '' },
  });

  useEffect(() => {
    if (postRef) {
        updateDocumentNonBlocking(postRef, {
            viewCount: increment(1)
        });
    }
  }, [postRef]);

  const onSubmit = async (values: z.infer<typeof replySchema>) => {
    if (!user || !userProfile || !postRef || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in to reply.' });
      return;
    }
    setIsSubmitting(true);
    
    const repliesColRef = collection(firestore, 'forumPosts', postId, 'replies');

    try {
        const newReplyData = {
            postId: postId,
            content: values.content,
            authorId: user.uid,
            authorName: `${userProfile.firstName} ${userProfile.lastName}`,
            createdAt: serverTimestamp(),
        };

        const newReplyDocRef = await addDoc(repliesColRef, newReplyData);
        
        await updateDoc(newReplyDocRef, { id: newReplyDocRef.id });

        await updateDoc(postRef, { replyCount: increment(1) });
        
        toast({ title: 'Reply Posted' });
        form.reset();
    } catch (error) {
        console.error("Error posting reply:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not post your reply.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    if (!user || !postRef) {
        toast({ variant: "destructive", title: "Please log in to like posts."});
        return;
    };
    updateDocumentNonBlocking(postRef, {
        likeCount: increment(1),
        likedBy: arrayUnion(user.uid)
    });
  };

  const PostSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      </CardContent>
    </Card>
  );
  
  const hasLiked = user && post?.likedBy?.includes(user.uid);

  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forum
        </Button>

        {isLoadingPost ? <PostSkeleton /> : post ? (
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                 <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://picsum.photos/seed/${post.authorId}/40`} />
                        <AvatarFallback>{post.authorName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>Posted by <span className="font-medium text-foreground">{post.authorName}</span></span>
                </div>
                <span>·</span>
                <span>{post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : '...'}</span>
              </CardDescription>
              <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
               <div className="mt-6 flex items-center gap-x-6 gap-y-2 pt-4 border-t flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={hasLiked || !user}
                    onClick={handleLike}
                  >
                    <Heart className={cn("mr-2 h-4 w-4", hasLiked && "fill-destructive text-destructive")} />
                    Like ({post.likeCount || 0})
                  </Button>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4"/>
                    <span className="text-sm font-medium">{post.replyCount || 0} Replies</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4"/>
                    <span className="text-sm font-medium">{post.viewCount || 0} Views</span>
                  </div>
                </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center p-8">
            <CardTitle>Post Not Found</CardTitle>
          </Card>
        )}

        <div>
          <h3 className="text-2xl font-bold mb-6">{post?.replyCount || 0} Replies</h3>
          <div className="space-y-6">
            {isLoadingReplies ? <p>Loading replies...</p> : replies && replies.length > 0 ? (
              replies.map(reply => (
                <div key={reply.id} className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 mt-1">
                        <AvatarImage src={`https://picsum.photos/seed/${reply.authorId}/40`} />
                        <AvatarFallback>{reply.authorName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="font-semibold text-foreground">{reply.authorName}</span>
                        <span>·</span>
                        <span>{reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : '...'}</span>
                        </div>
                        <p>{reply.content}</p>
                    </div>
                </div>
              ))
            ) : (
              !isLoadingPost && <p className="text-muted-foreground text-center py-4">No replies yet. Be the first to respond!</p>
            )}
          </div>
        </div>

        
          <Card>
            <CardHeader>
              <CardTitle>Post a Reply</CardTitle>
            </CardHeader>
            <CardContent>
             {user ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Your Reply</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Write your reply here..." {...field} className="min-h-[120px]"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                  </Button>
                </form>
              </Form>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
                  <p className="text-muted-foreground">You must be logged in to post a reply.</p>
                  <AuthDialog trigger={<Button>Login to Reply</Button>} />
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
