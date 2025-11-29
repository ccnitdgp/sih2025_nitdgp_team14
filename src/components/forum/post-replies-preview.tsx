
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PostRepliesPreview({ postId }: { postId: string }) {
    const firestore = useFirestore();

    const repliesQuery = useMemoFirebase(() => {
        if (!firestore || !postId) return null;
        return query(
            collection(firestore, `forumPosts/${postId}/replies`),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
    }, [firestore, postId]);

    const { data: replies, isLoading } = useCollection(repliesQuery);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                     <div key={i} className="flex items-start gap-2.5">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-3 w-1/2" />
                             <Skeleton className="h-3 w-full" />
                             <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-center">Replies</h4>
            <ScrollArea className="h-72 w-full">
                 <div className="space-y-4 pr-4">
                    {replies && replies.length > 0 ? (
                        replies.map(reply => (
                            <div key={reply.id} className="flex items-start gap-2.5">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://picsum.photos/seed/${reply.authorId}/40`} />
                                    <AvatarFallback>{reply.authorName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold">{reply.authorName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : '...'}
                                        </p>
                                    </div>
                                    <p className="text-sm mt-1">{reply.content}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center pt-4">No replies yet.</p>
                    )}
                 </div>
            </ScrollArea>
        </div>
    )
}
