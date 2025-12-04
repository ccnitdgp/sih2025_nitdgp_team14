
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc, addDoc, arrayUnion, increment, arrayRemove } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, PlusCircle, Heart, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { BackButton } from '@/components/layout/back-button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PostReplies } from '@/components/forum/post-replies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const newPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  content: z.string().min(10, 'Post content must be at least 10 characters long.'),
});

const PostStat = ({ icon: Icon, count, children, onClick }: { icon: any, count: number, children?: React.ReactNode, onClick?: (e: React.MouseEvent) => void }) => {
    return (
        <div 
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
            onClick={onClick}
        >
            {children || (
                <>
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{count || 0}</span>
                </>
            )}
        </div>
    );
};


export default function ForumPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  const [isEditPostDialogOpen, setIsEditPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);

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

  const myPosts = useMemo(() => {
    if (!posts || !user) return [];
    return posts.filter(post => post.authorId === user.uid);
  }, [posts, user]);

  const newPostForm = useForm<z.infer<typeof newPostSchema>>({
    resolver: zodResolver(newPostSchema),
    defaultValues: { title: '', content: '' },
  });
  
  const editPostForm = useForm<z.infer<typeof newPostSchema>>({
    resolver: zodResolver(newPostSchema),
    defaultValues: { title: '', content: '' },
  });
  
  const handleEditClick = (post: any) => {
    setEditingPost(post);
    editPostForm.reset({
      title: post.title,
      content: post.content,
    });
    setIsEditPostDialogOpen(true);
  };

  const handleUpdatePost = async (values: z.infer<typeof newPostSchema>) => {
    if (!editingPost || !firestore) return;
    setIsSubmitting(true);
    const postRef = doc(firestore, 'forumPosts', editingPost.id);
    try {
      await updateDocumentNonBlocking(postRef, {
        title: values.title,
        content: values.content,
      });
      toast({ title: 'Post Updated' });
      setIsEditPostDialogOpen(false);
      setEditingPost(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update your post.' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleDeletePost = (postId: string) => {
    if (!firestore) return;
    const postRef = doc(firestore, 'forumPosts', postId);
    deleteDocumentNonBlocking(postRef);
    toast({ variant: 'destructive', title: 'Post Deleted' });
  }

  const handleNewPost = async (values: z.infer<typeof newPostSchema>) => {
    if (!user || !userProfile || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in to post.' });
      return;
    }

    setIsSubmitting(true);
    
    const docRef = collection(firestore, 'forumPosts');
    const newPostData = {
        title: values.title,
        content: values.content,
        authorId: user.uid,
        authorName: `${userProfile.firstName} ${userProfile.lastName}`,
        createdAt: serverTimestamp(),
        replyCount: 0,
        likeCount: 0,
        viewCount: 0,
        likedBy: [],
    };
    
    try {
        const newPostDocRef = await addDocumentNonBlocking(docRef, newPostData);
        // After getting the ref, update it with its own ID.
        if (newPostDocRef) {
             updateDocumentNonBlocking(newPostDocRef, { id: newPostDocRef.id });
        }

        toast({ title: 'Post Created', description: 'Your post has been added to the forum.' });
        newPostForm.reset();
        setIsNewPostDialogOpen(false);
    } catch (error) {
        console.error("Error creating post: ", error);
        toast({ variant: 'destructive', title: 'Error', description: "Could not create your post."});
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleToggleLike = (e: React.MouseEvent, post: any) => {
    e.stopPropagation();
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Please log in to like posts."});
        return;
    };
    const postRef = doc(firestore, 'forumPosts', post.id);
    const hasLiked = post.likedBy?.includes(user.uid);

    if (hasLiked) {
        updateDocumentNonBlocking(postRef, {
            likeCount: increment(-1),
            likedBy: arrayRemove(user.uid)
        });
    } else {
        updateDocumentNonBlocking(postRef, {
            likeCount: increment(1),
            likedBy: arrayUnion(user.uid)
        });
    }
  };

  const PostsSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
          </div>
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
        <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
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
            <Form {...newPostForm}>
              <form onSubmit={newPostForm.handleSubmit(handleNewPost)} className="space-y-4">
                <FormField
                  control={newPostForm.control}
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
                  control={newPostForm.control}
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

       <Tabs defaultValue="all-posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all-posts">All Posts</TabsTrigger>
                <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="all-posts" className="mt-8">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {isLoading ? (
                    <PostsSkeleton />
                    ) : posts && posts.length > 0 ? (
                    posts.map((post) => {
                        const hasLiked = user && post.likedBy?.includes(user.uid);
                        return (
                        <AccordionItem value={post.id} key={post.id} className="border-b-0">
                             <Card className="hover:bg-muted/50 transition-colors">
                                <CardHeader>
                                    <AccordionTrigger className="w-full text-left p-0 hover:no-underline">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={`https://picsum.photos/seed/${post.authorId}/40`} />
                                                    <AvatarFallback>{post.authorName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>Posted by <span className="font-medium text-foreground">{post.authorName}</span></span>
                                                <span>•</span>
                                                <span>{post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : '...'}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-primary">{post.title}</h3>
                                        </div>
                                    </AccordionTrigger>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap my-2">{post.content}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <PostStat icon={Eye} count={post.viewCount} />
                                        <PostStat icon={Heart} count={post.likeCount} onClick={(e) => handleToggleLike(e, post)}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex items-center gap-1.5 text-muted-foreground p-1 h-auto -ml-1 hover:text-primary"
                                                disabled={!user}
                                            >
                                                <Heart className={cn("h-4 w-4", hasLiked && "text-destructive fill-destructive")} />
                                                <span className="text-sm font-medium">{post.likeCount || 0}</span>
                                            </Button>
                                        </PostStat>
                                    </div>
                                    <AccordionTrigger className="flex items-center gap-1.5 p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors hover:text-primary" hideChevron>
                                        <MessageSquare className="h-4 w-4" />
                                        <span className="text-sm font-medium">{post.replyCount || 0} Replies</span>
                                    </AccordionTrigger>
                                </CardFooter>
                                <AccordionContent>
                                    <div className="p-4 border-t">
                                        <PostReplies postId={post.id} />
                                    </div>
                                </AccordionContent>
                             </Card>
                        </AccordionItem>
                    )})
                    ) : (
                    <Card className="text-center p-8">
                        <CardTitle>No Posts Yet</CardTitle>
                        <CardDescription>Be the first to start a conversation in the community forum!</CardDescription>
                    </Card>
                    )}
                </Accordion>
            </TabsContent>
            <TabsContent value="my-posts" className="mt-8">
                 {isLoading ? (
                    <PostsSkeleton />
                ) : myPosts.length > 0 ? (
                    <div className="space-y-4">
                    {myPosts.map(post => (
                         <Card key={post.id}>
                            <CardHeader>
                                <CardTitle>{post.title}</CardTitle>
                                <CardDescription>
                                    Posted {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : '...'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground line-clamp-3">{post.content}</p>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditClick(post)}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    Edit
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your post.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                    </div>
                ) : (
                    <Card className="text-center p-8">
                        <CardTitle>You haven't posted anything yet.</CardTitle>
                        <CardDescription>Click 'New Post' to share your thoughts with the community.</CardDescription>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
      
        <Dialog open={isEditPostDialogOpen} onOpenChange={setIsEditPostDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Your Post</DialogTitle>
            </DialogHeader>
            <Form {...editPostForm}>
              <form onSubmit={editPostForm.handleSubmit(handleUpdatePost)} className="space-y-4">
                <FormField
                  control={editPostForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editPostForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[120px]"/>
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
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
    </div>
  );
}

    