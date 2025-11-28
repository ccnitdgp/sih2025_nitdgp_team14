
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function OutbreakHeatmap() {
    const heatmapImage = PlaceHolderImages.find(p => p.id === 'heatmap-image');

    if (!heatmapImage) return null;

    return (
        <div className="w-full aspect-video relative rounded-lg overflow-hidden border">
            <Image
                src={heatmapImage.imageUrl}
                alt={heatmapImage.description}
                data-ai-hint={heatmapImage.imageHint}
                fill
                style={{ objectFit: 'cover' }}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
             <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-bold text-lg">Flu Cases - August 2024</h4>
                <p className="text-sm">High concentration in Sector 15 & 22</p>
             </div>
        </div>
    )
}
