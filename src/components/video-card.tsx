"use client";

import Image from 'next/image';
import type { Video } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import StarRating from '@/components/star-rating';
import { Eye, MessageCircle, CalendarDays, Tag, Clock } from 'lucide-react';
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
    // Render nothing or a placeholder on the server to avoid hydration mismatch for dates
    return (
        <Card className="w-80 bg-card rounded-lg shadow-lg overflow-hidden flex flex-col h-full animate-pulse">
            <div className="aspect-video bg-muted"></div>
            <CardHeader className="p-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-1"></div>
            </CardHeader>
            <CardContent className="p-4 space-y-2 flex-grow">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
            </CardContent>
            <CardFooter className="p-4 flex flex-wrap gap-2 border-t border-border">
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
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
          priority={false} // Set to true for above-the-fold images if applicable
        />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>

      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 font-headline" title={video.title}>
          {video.title}
        </CardTitle>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Image src={video.channelAvatarUrl} alt={`${video.channelName} avatar`} width={20} height={20} className="rounded-full mr-2" data-ai-hint="channel avatar" />
          <span>{video.channelName}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground" aria-label={`Rating: ${video.starRating} out of 5 stars`}>
          <StarRating rating={video.starRating} />
          <span className="ml-2">({video.starRating.toFixed(1)})</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Eye className="h-4 w-4 mr-2 shrink-0" />
          <span>{video.viewCount.toLocaleString()} views</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        {video.tags.length > 0 && (
          <div className="flex items-start text-sm text-muted-foreground">
            <Tag className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">{tag}</span>
              ))}
              {video.tags.length > 3 && <span className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">+{video.tags.length - 3} more</span>}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-border">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <MessageCircle className="h-4 w-4 mr-2" /> View Comments ({video.comments.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-96 p-0" side="top" align="center">
            <ScrollArea className="h-[300px] p-4">
              {video.comments.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-center mb-2">Comments</h4>
                  {video.comments.map(comment => (
                    <div key={comment.id} className="text-sm p-2 bg-muted/50 rounded-md">
                      <p className="font-semibold text-xs">{comment.author}</p>
                      <p className="text-muted-foreground text-xs mb-1">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</p>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
}
