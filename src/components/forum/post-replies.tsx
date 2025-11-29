
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export const PostReplies = ({ postId }: { postId: string }) => {
  const firestore = useFirestore();

  const repliesQuery = useMemoFirebase(() => {
    if (!firestore || !postId) return null;
    return query(collection(firestore, 'forumPosts', postId, 'replies'), orderBy('createdAt', 'asc'));
  }, [firestore, postId]);

  const { data: replies, isLoading } = useCollection(repliesQuery);

  return (
    <div className="space-y-4 border-l-2 pl-4">
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
                <div className="flex-1 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span className="font-semibold text-foreground">{reply.authorName}</span>
                        <span>·</span>
                        <span>{reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : '...'}</span>
                    </div>
                    <p>{reply.content}</p>
                </div>
            </div>
        ))
        ) : (
        <p className="text-muted-foreground text-center py-4">No replies yet. Be the first to respond!</p>
        )}
    </div>
  );
};
