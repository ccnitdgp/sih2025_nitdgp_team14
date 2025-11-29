'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

export const PostRepliesDialog = ({ postId, replyCount, trigger }) => {
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();

  const repliesQuery = useMemoFirebase(() => {
    if (!firestore || !open) return null; // Only fetch when dialog is open
    return query(collection(firestore, 'forumPosts', postId, 'replies'), orderBy('createdAt', 'asc'));
  }, [firestore, postId, open]);

  const { data: replies, isLoading } = useCollection(repliesQuery);

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent className="w-96" side="top" align="start">
        <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
                <h4 className="font-medium leading-none">Replies</h4>
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : replies && replies.length > 0 ? (
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
                <p className="text-muted-foreground text-center py-4">Be the first to reply!</p>
                )}
            </div>
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
};
