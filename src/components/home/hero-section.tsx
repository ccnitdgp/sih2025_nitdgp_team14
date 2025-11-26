'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (query.includes('camp')) {
      router.push('/camps');
    } else if (query.includes('vaccine') || query.includes('vaccination')) {
      router.push('/vaccination');
    } else if (query) {
      router.push('/appointments');
    }
  };

  return (
    <section className="bg-muted/40 py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
              Your Health, Our Priority.
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground">
              Access vaccination drives, health camps, and your medical records with ease.
            </p>
            <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2" key="search-form">
              <Input 
                type="text" 
                placeholder="Search for camps, vaccines..." 
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="default">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </form>
          </div>
          <div className="flex items-center justify-center">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                width={600}
                height={500}
                className="rounded-lg shadow-2xl"
                priority
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
