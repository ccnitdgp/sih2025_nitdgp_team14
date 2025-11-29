'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
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

  const handleOpenChange = (isOpen: boolean) => {
    // Prevent click on trigger from navigating
    if (isOpen) {
        const event = new Event('click', { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'preventDefault', { value: () => {} });
        document.dispatchEvent(event);
    }
    setOpen(isOpen);
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Replies</DialogTitle>
          <DialogDescription>
            {replyCount > 0 ? `Showing ${replyCount} replies for this post.` : 'No replies yet.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
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
      </DialogContent>
    </Dialog>
  );
};
