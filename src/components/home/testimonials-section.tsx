import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { testimonials } from "@/lib/data";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function TestimonialsSection() {
  return (
    <section className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
            What Our Users Say
          </h2>
          <p className="mt-4 text-muted-foreground">
            Real stories from our community members.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => {
            const avatarImage = PlaceHolderImages.find(p => p.id === testimonial.avatarId);
            return (
            <Card key={testimonial.id} className="bg-card border-t-4 border-primary transition-shadow hover:shadow-xl">
              <CardContent className="pt-8">
                <blockquote className="text-lg italic text-foreground relative">
                  <span className="absolute -top-4 -left-4 text-6xl text-primary/20 font-serif">“</span>
                  {testimonial.quote}
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={avatarImage?.imageUrl} alt={avatarImage?.description} data-ai-hint={avatarImage?.imageHint} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      </div>
    </section>
  );
}
