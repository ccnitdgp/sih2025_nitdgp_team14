
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function OutbreakHeatmap() {
    const heatmapImage = PlaceHolderImages.find(p => p.id === 'heatmap-image');
    
    return (
        <div className="h-full w-full">
            {heatmapImage ? (
                <Image
                    src={heatmapImage.imageUrl}
                    alt={heatmapImage.description}
                    data-ai-hint={heatmapImage.imageHint}
                    fill
                    className="object-cover rounded-lg"
                />
            ) : (
                <div className="h-full w-full bg-muted animate-pulse rounded-lg" />
            )}
        </div>
    );
};
