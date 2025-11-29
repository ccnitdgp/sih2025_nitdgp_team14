
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc, addDoc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '@/hooks/use-toast';
import { AuthDialog } from '../auth/auth-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';

const replySchema = z.object({
  content: z.string().min(1, 'Reply cannot be empty.'),
});

type Reply = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
  parentReplyId?: string | null;
  replies?: Reply[];
};

const buildReplyTree = (replies: Reply[]): Reply[] => {
  const replyMap = new Map(replies.map(reply => [reply.id, { ...reply, replies: [] }]));
  const tree: Reply[] = [];

  for (const reply of replyMap.values()) {
    if (reply.parentReplyId && replyMap.has(reply.parentReplyId)) {
      replyMap.get(reply.parentReplyId)?.replies?.push(reply);
    } else {
      tree.push(reply);
    }
  }
  return tree;
};


const ReplyForm = ({ postId, parentReplyId, onReply, isSubmitting }) => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc(userDocRef);

    const form = useForm<z.infer<typeof replySchema>>({
        resolver: zodResolver(replySchema),
        defaultValues: { content: '' },
    });

    const onSubmit = async (values: z.infer<typeof replySchema>) => {
        if (!user || !userProfile || !firestore) {
            toast({ variant: 'destructive', title: 'You must be logged in to reply.' });
            return;
        }
        
        const repliesColRef = collection(firestore, 'forumPosts', postId, 'replies');
        
        try {
            const newReplyData = {
                postId: postId,
                content: values.content,
                authorId: user.uid,
                authorName: `${userProfile.firstName} ${userProfile.lastName}`,
                createdAt: serverTimestamp(),
                parentReplyId: parentReplyId || null,
                replyCount: 0,
            };

            const newReplyDocRef = await addDoc(repliesColRef, newReplyData);
            await updateDoc(newReplyDocRef, { id: newReplyDocRef.id });

            // Increment post's reply count
            const postRef = doc(firestore, 'forumPosts', postId);
            await updateDoc(postRef, { replyCount: increment(1) });
            
            // If it's a nested reply, increment parent reply's count
            if (parentReplyId) {
                const parentReplyRef = doc(repliesColRef, parentReplyId);
                await updateDoc(parentReplyRef, { replyCount: increment(1) });
            }
            
            toast({ title: 'Reply Posted' });
            form.reset();
            onReply();

        } catch (error) {
            console.error("Error posting reply:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not post your reply.' });
        }
    };
    
    if (!user) {
        return (
            <div className="flex items-center gap-4 py-2">
                <p className="text-sm text-muted-foreground">Log in to post a comment.</p>
                <AuthDialog trigger={<Button size="sm">Login</Button>}/>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2 pt-2">
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Textarea placeholder="Add a comment..." {...field} rows={1} className="min-h-[40px]" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
            </form>
        </Form>
    );
};

const ReplyComponent = ({ reply, postId }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    
    const hasReplies = reply.replies && reply.replies.length > 0;
    
    return (
        <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 mt-1">
                <AvatarImage src={`https://picsum.photos/seed/${reply.authorId}/40`} />
                <AvatarFallback>{reply.authorName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">{reply.authorName}</span>
                    <span>·</span>
                    <span>{reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : '...'}</span>
                </div>
                <p>{reply.content}</p>
                <div className="mt-1">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setShowReplyForm(!showReplyForm)}>Reply</Button>
                    {showReplyForm && (
                        <div className="mt-2">
                            <ReplyForm postId={postId} parentReplyId={reply.id} onReply={() => setShowReplyForm(false)} isSubmitting={false}/>
                        </div>
                    )}
                     {hasReplies && (
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                                    <ChevronsUpDown className="mr-2 h-3 w-3" />
                                    View {reply.replies.length} {reply.replies.length > 1 ? 'replies' : 'reply'}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="mt-4 pl-6 border-l space-y-4">
                                    {reply.replies.map(childReply => (
                                        <ReplyComponent key={childReply.id} reply={childReply} postId={postId} />
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </div>
            </div>
        </div>
    )
}

export const PostReplies = ({ postId }: { postId: string }) => {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const repliesQuery = useMemoFirebase(() => {
    if (!firestore || !postId) return null;
    return query(collection(firestore, 'forumPosts', postId, 'replies'), orderBy('createdAt', 'asc'));
  }, [firestore, postId]);

  const { data: replies, isLoading } = useCollection(repliesQuery);
  
  const replyTree = useMemo(() => {
      if (!replies) return [];
      return buildReplyTree(replies as Reply[]);
  }, [replies]);

  return (
    <div className="space-y-4 border-t pt-4">
        <h4 className="font-semibold">Comments</h4>
         <ReplyForm postId={postId} parentReplyId={null} onReply={() => {}} isSubmitting={isSubmitting} />
        
        {isLoading ? (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        ) : replyTree && replyTree.length > 0 ? (
            <div className="space-y-6 pt-4">
                {replyTree.map(reply => (
                    <ReplyComponent key={reply.id} reply={reply} postId={postId}/>
                ))}
            </div>
        ) : (
            <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
        )}
    </div>
  );
};
