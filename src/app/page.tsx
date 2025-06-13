
import FilterSortControls from '@/components/filter-sort-controls';
import VideoGridDisplay from '@/components/video-grid-display';
import type { PaginatedVideos } from '@/types';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ThemeToggleButton from '@/components/theme-toggle-button'; // Added theme toggle button

async function getInitialUniqueChannels(): Promise<string[]> { // Renamed function
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/videos?limit=1&page=1`);
    if (!response.ok) {
      console.error("Failed to fetch initial channels from API, using fallback.");
      return ["Channel A1", "Channel B1", "Channel C1"]; // Fallback channels
    }
    const data: PaginatedVideos = await response.json();
    return data.uniqueChannels && data.uniqueChannels.length > 0 ? data.uniqueChannels : ["Channel A1", "Channel B1", "Channel C1"];
  } catch (error) {
    console.error("Error fetching initial channels:", error);
    return ["Channel A1", "Channel B1", "Channel C1"]; // Fallback channels
  }
}

const FilterSortControlsSkeleton = () => (
  <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md mb-6 sticky top-0 z-10 border-b">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"> {/* Adjusted to 4 columns */}
      <div>
        <Skeleton className="h-5 w-20 mb-1" /> {/* Label Channel */}
        <Skeleton className="h-10 w-full" /> {/* Select Channel */}
      </div>
      <div>
        <Skeleton className="h-5 w-24 mb-1" /> {/* Label Search */}
        <Skeleton className="h-10 w-full" /> {/* Input Search */}
      </div>
      <div>
        <Skeleton className="h-5 w-24 mb-1" /> {/* Label Sort */}
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-grow" /> {/* Select Sort */}
          <Skeleton className="h-10 w-20" /> {/* Button Sort Order */}
        </div>
      </div>
      <div>
        <Skeleton className="h-10 w-full" /> {/* Button Reset */}
      </div>
    </div>
  </div>
);

export default async function Home() {
  const uniqueChannels = await getInitialUniqueChannels(); // Using new function

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="p-4 sm:p-6 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto max-w-screen-2xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline">TubeInsights Dashboard</h1>
            <p className="text-sm opacity-90">Explore video trends and statistics.</p>
          </div>
          <ThemeToggleButton />
        </div>
      </header>
      
      <div className="container mx-auto max-w-screen-2xl flex-1 flex flex-col p-0 sm:p-4">
        <Suspense fallback={<FilterSortControlsSkeleton />}>
          <FilterSortControls uniqueChannels={uniqueChannels} /> {/* Passing uniqueChannels */}
        </Suspense>
        
        <Suspense fallback={
          <div className="grid grid-cols-[repeat(auto-fill,minmax(384px,1fr))] gap-4 p-4"> {/* Adjusted minmax */}
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="w-96 bg-card rounded-lg shadow-lg overflow-hidden flex flex-col h-full"> {/* Adjusted width */}
                <Skeleton className="aspect-video w-full" />
                <div className="p-3"> {/* Adjusted padding */}
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6 mb-1" />
                </div>
                <div className="p-3 border-t mt-auto"> {/* Adjusted padding */}
                  {/* Skeleton for footer content, if any, can go here. Or remove if footer is empty. */}
                   <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}
          </div>
        }>
          <VideoGridDisplay initialUniqueChannels={uniqueChannels} /> {/* Passing uniqueChannels */}
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
