
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import VideoCard from './video-card';
import type { Video, PaginatedVideos, FetchVideosParams } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, SearchX } from 'lucide-react';

const VIDEOS_PER_PAGE = 12;

const VideoCardSkeleton = () => (
  <div className="w-96 bg-card rounded-lg shadow-lg overflow-hidden flex flex-col h-full"> {/* Adjusted width */}
    <Skeleton className="aspect-video w-full" />
    <div className="p-3"> {/* Adjusted padding */}
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-1" />
    </div>
    <div className="p-3 border-t mt-auto"> {/* Adjusted padding */}
      <Skeleton className="h-6 w-full" /> {/* Placeholder for footer actions if any */}
    </div>
  </div>
);


export default function VideoGridDisplay({ initialUniqueChannels }: { initialUniqueChannels: string[] }) { // Prop renamed
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchVideos = useCallback(async (currentPage: number, params: FetchVideosParams) => {
    if (currentPage === 1) setIsLoading(true); else setIsLoadingMore(true);
    setError(null);

    const query = new URLSearchParams();
    if (params.channel) query.set('channel', params.channel); // Changed from topic
    if (params.searchQuery) query.set('searchQuery', params.searchQuery); // Added searchQuery
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    query.set('page', currentPage.toString());
    query.set('limit', VIDEOS_PER_PAGE.toString());

    try {
      const response = await fetch(`/api/videos?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.statusText}`);
      }
      const data: PaginatedVideos = await response.json();
      
      setVideos(prevVideos => currentPage === 1 ? data.videos : [...prevVideos, ...data.videos]);
      setTotalPages(data.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error Fetching Videos',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      if (currentPage === 1) setIsLoading(false); else setIsLoadingMore(false);
    }
  }, [toast]);

  useEffect(() => {
    setPage(1); 
    const params: FetchVideosParams = {
      channel: searchParams.get('channel') || undefined, // Changed from topic
      searchQuery: searchParams.get('searchQuery') || undefined, // Added searchQuery
      sortBy: (searchParams.get('sortBy') as FetchVideosParams['sortBy']) || undefined,
      sortOrder: (searchParams.get('sortOrder') as FetchVideosParams['sortOrder']) || undefined,
    };
    fetchVideos(1, params);
  }, [searchParams, fetchVideos]);

  useEffect(() => {
    if (isLoadingMore || page >= totalPages || !loadMoreRef.current) return;

    const currentObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );
    observer.current = currentObserver; 

    if (loadMoreRef.current) {
      currentObserver.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current && currentObserver) { 
        currentObserver.unobserve(loadMoreRef.current);
      }
    };
  }, [isLoadingMore, page, totalPages]);


  useEffect(() => {
    if (page > 1 && page <= totalPages) {
      const params: FetchVideosParams = {
        channel: searchParams.get('channel') || undefined, // Changed from topic
        searchQuery: searchParams.get('searchQuery') || undefined, // Added searchQuery
        sortBy: (searchParams.get('sortBy') as FetchVideosParams['sortBy']) || undefined,
        sortOrder: (searchParams.get('sortOrder') as FetchVideosParams['sortOrder']) || undefined,
      };
      fetchVideos(page, params);
    }
  }, [page, totalPages, searchParams, fetchVideos]);


  if (isLoading && videos.length === 0) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(384px,1fr))] gap-4 p-4"> {/* Adjusted minmax */}
        {Array.from({ length: VIDEOS_PER_PAGE }).map((_, index) => (
          <VideoCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <SearchX size={48} className="mb-4" />
        <p className="text-xl font-semibold">Could not load videos.</p>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!isLoading && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <SearchX size={48} className="mb-4" />
        <p className="text-xl font-semibold">No videos found.</p>
        <p>Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(384px,1fr))] gap-4 p-4"> {/* Adjusted minmax */}
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
        {isLoadingMore && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        {!isLoadingMore && page >= totalPages && videos.length > 0 && (
          <p className="text-muted-foreground">You've reached the end!</p>
        )}
      </div>
    </div>
  );
}
