
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import hi from '@/lib/locales/hi.json';
import bn from '@/lib/locales/bn.json';
import ta from '@/lib/locales/ta.json';
import te from '@/lib/locales/te.json';
import mr from '@/lib/locales/mr.json';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"


const languageFiles = { hi, bn, ta, te, mr };

export function HeroSection() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [translations, setTranslations] = useState({});
  const heroImages = PlaceHolderImages.filter(p => p.id.startsWith('hero-image'));

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);
  
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  useEffect(() => {
    setIsClient(true);
    if (userProfile?.preferredLanguage && languageFiles[userProfile.preferredLanguage]) {
      setTranslations(languageFiles[userProfile.preferredLanguage]);
    } else {
      setTranslations({});
    }
  }, [userProfile]);

  const t = (key: string, fallback: string) => translations[key] || fallback;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    const encodedQuery = encodeURIComponent(query);
    
    const campKeywords = ['camp', 'camps', 'check-up', 'checkup', 'health camp', 'medical camp'];
    const vaccinationKeywords = ['vaccine', 'vaccination', 'drive', 'polio', 'mmr', 'covid', 'booster', 'immunization', 'td', 'tetanus', 'hepatitis', 'shot'];

    const isCampSearch = campKeywords.some(keyword => query.includes(keyword));
    const isVaccinationSearch = vaccinationKeywords.some(keyword => query.includes(keyword));

    if (isCampSearch) {
      router.push(`/camps?search=${encodedQuery}`);
    } else if (isVaccinationSearch) {
      router.push(`/vaccination?search=${encodedQuery}`);
    } else {
      // Fallback to a general announcements search if no specific keywords are met
      router.push(`/announcements?search=${encodedQuery}`);
    }
  };

  return (
    <section className="bg-muted/40 py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
              {t('hero_title', 'Your Health, Our Priority.')}
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground">
              {t('hero_subtitle', 'Access vaccination drives, health camps, and your medical records with ease.')}
            </p>
            {isClient && (
              <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
                <Input 
                  type="text" 
                  placeholder={t('search_placeholder', 'Search for camps, vaccines...')}
                  className="flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" variant="default">
                  <Search className="mr-2 h-4 w-4" /> 
                  {t('search_button', 'Search')}
                </Button>
              </form>
            )}
          </div>
          <div className="flex items-center justify-center">
            <Carousel 
              className="w-full max-w-md"
              plugins={[plugin.current]}
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {heroImages.map((image) => (
                  <CarouselItem key={image.id}>
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-0">
                         <Image
                            src={image.imageUrl}
                            alt={image.description}
                            data-ai-hint={image.imageHint}
                            width={600}
                            height={500}
                            className="rounded-lg shadow-2xl object-cover w-full h-full"
                            priority
                          />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
