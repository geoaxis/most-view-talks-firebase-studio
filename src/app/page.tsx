
import FilterSortControls from '@/components/filter-sort-controls';
import VideoGridDisplay from '@/components/video-grid-display';
import type { PaginatedVideos } from '@/types';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ThemeToggleButton from '@/components/theme-toggle-button';

async function getInitialUniqueChannels(): Promise<string[]> {
  // Log the environment variables being used to construct the base URL
  // These are CRITICAL for deployed environments.
  // Firebase App Hosting should ideally provide APP_URL.
  console.log(`getInitialUniqueChannels: process.env.APP_URL = ${process.env.APP_URL}`);
  console.log(`getInitialUniqueChannels: process.env.NEXT_PUBLIC_APP_URL = ${process.env.NEXT_PUBLIC_APP_URL}`);

  // IMPORTANT: In a deployed environment (like Firebase App Hosting),
  // process.env.APP_URL (or a similar variable provided by the hosting platform
  // representing the public URL of the backend) MUST be set correctly.
  // If it's not, the fetch will default to localhost and fail.
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  const apiUrl = `${baseUrl}/api/videos?limit=1&page=1`; // Fetch minimal data just for channels
  
  console.log(`Attempting to fetch initial channels from: ${apiUrl}`);

  if (baseUrl.startsWith('http://localhost') && (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production' )) {
    console.warn(`WARNING: Fetching from localhost (${baseUrl}) in a production-like environment. This is likely to fail. Ensure APP_URL (or equivalent) is set correctly in your deployment environment's service configuration.`);
  }

  try {
    // Using 'no-store' to ensure this critical initial fetch isn't stale,
    // especially during debugging deployment issues.
    const response = await fetch(apiUrl, { cache: 'no-store' }); 

    if (!response.ok) {
      const errorBody = await response.text(); // Ensure you await the text() promise
      console.error(`Failed to fetch initial channels. Status: ${response.status}, URL: ${apiUrl}, Body: ${errorBody}. Using ERROR fallback channels (A).`);
      return ["Error: Fallback A", "Check Server Logs", "Details: Fetch Fail"];
    }

    const data: PaginatedVideos = await response.json();

    if (data && data.uniqueChannels && Array.isArray(data.uniqueChannels) && data.uniqueChannels.length > 0) {
      console.log("Successfully fetched unique channels:", data.uniqueChannels);
      return data.uniqueChannels;
    } else {
      console.warn(`API returned success but uniqueChannels is empty, undefined, or not a non-empty array. API URL: ${apiUrl}, Response data: ${JSON.stringify(data)}. Using ERROR fallback channels (B).`);
      return ["Error: Fallback B", "Check Server Logs", "Details: No/Invalid Channels"];
    }
  } catch (error) {
    console.error(`Caught error in getInitialUniqueChannels fetching from ${apiUrl}:`, error);
    // This fallback "C" is what you're seeing, indicating the fetch itself threw an exception.
    return ["Error: Fallback C", "Check Server Logs", "Details: Exception"];
  }
}


const FilterSortControlsSkeleton = () => (
  <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md mb-6 sticky top-0 z-10 border-b">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <div>
        <Skeleton className="h-5 w-20 mb-1" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-5 w-24 mb-1" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-5 w-24 mb-1" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

export default async function Home() {
  const uniqueChannels = await getInitialUniqueChannels();

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="p-4 sm:p-6 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto max-w-screen-2xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline">Most Popular tech videos</h1>
            <p className="text-sm opacity-90">Curated list of top tech videos from YouTube.</p>
          </div>
          <ThemeToggleButton />
        </div>
      </header>
      
      <div className="container mx-auto max-w-screen-2xl flex-1 flex flex-col p-0 sm:p-4">
        <Suspense fallback={<FilterSortControlsSkeleton />}>
          <FilterSortControls uniqueChannels={uniqueChannels} />
        </Suspense>
        
        <Suspense fallback={
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 p-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="w-80 bg-card rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <Skeleton className="aspect-video w-full" />
                <div className="p-3">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6 mb-1" />
                </div>
                <div className="p-3 border-t mt-auto">
                   <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}
          </div>
        }>
          <VideoGridDisplay initialUniqueChannels={uniqueChannels} />
        </Suspense>
      </div>

      <footer className="p-4 bg-card border-t text-center text-sm text-muted-foreground mt-8">
        <div className="container mx-auto max-w-screen-2xl">
          &copy; {new Date().getFullYear()} TubeInsights. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
