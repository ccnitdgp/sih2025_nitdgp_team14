
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, PlusCircle, Trash2, CalendarDays, MapPin, Info, TriangleAlert, ShieldCheck, Syringe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BackButton } from '@/components/layout/back-button';
import { cn } from '@/lib/utils';


const announcementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  details: z.string().min(10, 'Details must be at least 10 characters.'),
  category: z.enum(['WEATHER ADVISORY', 'DISEASE PREVENTION', 'PUBLIC HEALTH', 'VACCINATION']),
});

const categoryStyles = {
    'WEATHER ADVISORY': {
        Icon: TriangleAlert,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-500",
    },
    'DISEASE PREVENTION': {
        Icon: ShieldCheck,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        borderColor: "border-blue-500",
    },
    'PUBLIC HEALTH': {
        Icon: Info,
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-500",
    },
    'VACCINATION': {
        Icon: Syringe,
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-500",
    }
};

export default function ManageAnnouncementsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const announcementsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'announcements');
  }, [firestore]);
  const { data: announcements, isLoading } = useCollection(announcementsRef);

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      details: '',
      category: 'PUBLIC HEALTH',
    },
  });

  const onSubmit = async (values: z.infer<typeof announcementSchema>) => {
    setIsSubmitting(true);
    try {
        const newDocRef = doc(announcementsRef);
        
        await addDocumentNonBlocking(announcementsRef, {
            id: newDocRef.id,
            title: values.title,
            details: values.details,
            category: values.category,
            date: new Date().toISOString(),
        });
        toast({ title: "Announcement Published", description: "The new announcement is now live." });
        form.reset();
    } catch (error) {
        // Errors are handled globally by the non-blocking function
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = (announcementId: string) => {
    const docRef = doc(announcementsRef, announcementId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Announcement Deleted', variant: 'destructive' });
  };
  
  const AnnouncementSkeleton = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
            </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
        <BackButton />
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Megaphone className="h-6 w-6"/>
                    Manage Announcements
                </CardTitle>
                <CardDescription>
                    Create, view, and remove public health announcements.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Heatwave Alert" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="WEATHER ADVISORY">Weather Advisory</SelectItem>
                                        <SelectItem value="DISEASE PREVENTION">Disease Prevention</SelectItem>
                                        <SelectItem value="PUBLIC HEALTH">Public Health</SelectItem>
                                        <SelectItem value="VACCINATION">Vaccination</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="details" render={({ field }) => (<FormItem><FormLabel>Details</FormLabel><FormControl><Textarea placeholder="Provide full details of the announcement..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" disabled={isSubmitting}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                        </Button>
                    </form>
                </Form>
                
                <div className="border-t pt-8">
                    <h3 className="text-lg font-semibold mb-4">Existing Announcements</h3>
                    <div className="space-y-4">
                        {isLoading ? <AnnouncementSkeleton /> : announcements && announcements.length > 0 ? (
                            announcements.map(announcement => {
                                const styles = categoryStyles[announcement.category] || categoryStyles['PUBLIC HEALTH'];
                                return (
                                <Card key={announcement.id} className={cn("p-4", styles.borderColor)}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{announcement.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{announcement.category}</p>
                                            <p className="text-sm mt-2">{announcement.details}</p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this announcement. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(announcement.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </Card>
                            )})
                        ) : (
                            <p className="text-center text-muted-foreground">No announcements found.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
