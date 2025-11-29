
'use client';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { testimonials } from "@/lib/data";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { useState, useEffect } from 'react';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { Skeleton } from "../ui/skeleton";

const languageFiles = { hi, bn, ta, te, mr };

export function TestimonialsSection() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState({});

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  const feedbackQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'feedback'),
      where('rating', '>=', 4),
      orderBy('rating', 'desc'),
      limit(3)
    );
  }, [firestore]);

  const { data: feedback, isLoading } = useCollection(feedbackQuery);


  useEffect(() => {
    if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
      setTranslations(languageFiles[userProfile.preferredLanguage]);
    } else {
      setTranslations({});
    }
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;
  
  const TestimonialSkeleton = () => (
     <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardContent className="pt-8">
                     <Skeleton className="h-4 w-3/4 mb-4" />
                     <Skeleton className="h-4 w-1/2 mb-6" />
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-3 w-16" />
                        </div>
                     </div>
                </CardContent>
            </Card>
        ))}
     </div>
  );

  return (
    <section className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
            {t('testimonials_title', 'What Our Users Say')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('testimonials_desc', 'Real stories from our community members.')}
          </p>
        </div>
        {isLoading ? <TestimonialSkeleton /> : feedback && feedback.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {feedback.map((testimonial) => (
              <Card key={testimonial.id} className="bg-card border-t-4 border-primary transition-shadow hover:shadow-xl">
                <CardContent className="pt-8">
                  <blockquote className="text-lg italic text-foreground relative">
                    <span className="absolute -top-4 -left-4 text-6xl text-primary/20 font-serif">“</span>
                    {testimonial.message}
                  </blockquote>
                  <div className="mt-6 flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src={`https://picsum.photos/seed/${testimonial.userId}/100`} />
                      <AvatarFallback>{testimonial.userName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.userName}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.feedbackType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Testimonials Yet</CardTitle>
              <CardDescription>Check back later to see what our users are saying.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </section>
  );
}
