
"use client";

import Image from 'next/image';
import type { Video } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, CalendarDays, Tag, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setFormattedDate(formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true }));
  }, [video.uploadDate]);

  if (!isMounted) {
    return (
        <Card className="w-80 bg-card rounded-lg shadow-lg overflow-hidden flex flex-col h-full animate-pulse">
            <div className="aspect-video bg-muted"></div>
            <CardHeader className="p-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-1"></div>
            </CardHeader>
            <CardContent className="p-3 space-y-2 flex-grow">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
            </CardContent>
            <CardFooter className="p-3 border-t border-border">
                 <div className="w-full h-6 bg-muted rounded"></div>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-80 bg-card rounded-lg shadow-lg overflow-hidden flex flex-col h-full group transition-all duration-300 ease-in-out hover:shadow-2xl">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={video.thumbnailUrl}
          alt={`Thumbnail for ${video.title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="video thumbnail"
          priority={false}
        />
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>

      <CardHeader className="p-3">
        <CardTitle className="text-base font-semibold leading-snug line-clamp-2 font-headline" title={video.title}>
          {video.title}
        </CardTitle>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Image src={video.channelAvatarUrl} alt={`${video.channelName} avatar`} width={16} height={16} className="rounded-full mr-1.5" data-ai-hint="channel avatar" />
          <span>{video.channelName}</span>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-1.5 flex-grow">
        <div className="flex items-center text-xs text-muted-foreground">
          <ThumbsUp className="h-3.5 w-3.5 mr-1.5 shrink-0 text-sky-500" />
          <span>{video.likeCount.toLocaleString()} likes</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          <span>{video.viewCount.toLocaleString()} views</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        {video.tags.length > 0 && (
          <div className="flex items-start text-xs text-muted-foreground">
            <Tag className="h-3.5 w-3.5 mr-1.5 mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">{tag}</span>
              ))}
              {video.tags.length > 2 && <span className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">+{video.tags.length - 2}</span>}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 border-t border-border">
        <div className="w-full h-6"></div>
      </CardFooter>
    </Card>
  );
}
