
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc, addDoc, arrayUnion, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, PlusCircle, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { BackButton } from '@/components/layout/back-button';
import { cn } from '@/lib/utils';

const newPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  content: z.string().min(10, 'Post content must be at least 10 characters long.'),
});

export default function ForumPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'forumPosts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection(postsQuery);

  const form = useForm<z.infer<typeof newPostSchema>>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof newPostSchema>) => {
    if (!user || !userProfile || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in to post.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
        const newPost = {
          title: values.title,
          content: values.content,
          authorId: user.uid,
          authorName: `${userProfile.firstName} ${userProfile.lastName}`,
          createdAt: serverTimestamp(),
          replyCount: 0,
          likeCount: 0,
          likedBy: [],
        };

        await addDoc(collection(firestore, 'forumPosts'), newPost);
        
        toast({ title: 'Post Created', description: 'Your post has been added to the forum.' });
        form.reset();
        setIsDialogOpen(false);
    } catch (error) {
        console.error("Error creating post: ", error);
        toast({ variant: 'destructive', title: 'Error', description: "Could not create your post."});
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Please log in to like posts."});
        return;
    };
    const postRef = doc(firestore, 'forumPosts', postId);
    updateDocumentNonBlocking(postRef, {
        likeCount: increment(1),
        likedBy: arrayUnion(user.uid)
    });
  };

  const PostsSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <BackButton />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Community Forum</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Ask questions, share experiences, and connect with other patients.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {user ? (
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> New Post
                </Button>
            ) : (
                <AuthDialog trigger={
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> New Post</Button>
                }/>
            )}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a title for your post" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share your thoughts or ask a question..." {...field} className="min-h-[120px]"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <PostsSkeleton />
        ) : posts && posts.length > 0 ? (
          posts.map((post) => {
            const hasLiked = user && post.likedBy?.includes(user.uid);
            return (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link href={`/forum/post/${post.id}`} className="block mb-2">
                  <h3 className="font-bold text-lg text-primary hover:underline">{post.title}</h3>
                </Link>
                <div className="text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
                    <span>By {post.authorName}</span>
                    <span>{post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : '...'}</span>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4"/>
                        <span>{post.replyCount || 0} replies</span>
                    </div>
                </div>
                 <div className="mt-4 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={hasLiked || !user}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={cn("mr-2 h-4 w-4", hasLiked && "fill-destructive text-destructive")} />
                        Like
                      </Button>
                      <span className="text-sm text-muted-foreground">{post.likeCount || 0} likes</span>
                 </div>
              </CardContent>
            </Card>
          )})
        ) : (
          <Card className="text-center p-8">
            <CardTitle>No Posts Yet</CardTitle>
            <CardDescription>Be the first to start a conversation in the community forum!</CardDescription>
          </Card>
        )}
      </div>
    </div>
  );
}
