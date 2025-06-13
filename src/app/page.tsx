import FilterSortControls from '@/components/filter-sort-controls';
import VideoGridDisplay from '@/components/video-grid-display';
import type { PaginatedVideos } from '@/types';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// This function simulates fetching initial unique tags. 
// In a real app, this might come from a dedicated API endpoint or be derived differently.
async function getInitialUniqueTags(): Promise<string[]> {
  try {
    // Fetch a sample of video data to extract tags
    // For demonstration, we fetch the first page from our mock API
    // In a real scenario, you might have a specific endpoint /api/tags or precompute this
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/videos?limit=1&page=1`);
    if (!response.ok) {
      console.error("Failed to fetch initial tags from API, using fallback.");
      return ["Gaming", "Tutorial", "Music", "Vlog", "Science"]; // Fallback tags
    }
    const data: PaginatedVideos = await response.json();
    return data.uniqueTags && data.uniqueTags.length > 0 ? data.uniqueTags : ["Gaming", "Tutorial", "Music", "Vlog", "Science"];
  } catch (error) {
    console.error("Error fetching initial tags:", error);
    return ["Gaming", "Tutorial", "Music", "Vlog", "Science"]; // Fallback tags
  }
}


// Skeleton for FilterSortControls
const FilterSortControlsSkeleton = () => (
  <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md mb-6 sticky top-0 z-10 border-b">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
      <div>
        <Skeleton className="h-5 w-20 mb-1" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Select */}
      </div>
      <div>
        <Skeleton className="h-5 w-24 mb-1" /> {/* Label */}
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-grow" /> {/* Select */}
          <Skeleton className="h-10 w-20" /> {/* Button */}
        </div>
      </div>
      <div className="sm:col-start-2 lg:col-start-3">
        <Skeleton className="h-10 w-full" /> {/* Button */}
      </div>
    </div>
  </div>
);

export default async function Home() {
  const uniqueTags = await getInitialUniqueTags();

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="p-4 sm:p-6 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto max-w-screen-2xl">
          <h1 className="text-3xl font-bold font-headline">TubeInsights Dashboard</h1>
          <p className="text-sm opacity-90">Explore video trends and statistics.</p>
        </div>
      </header>
      
      <div className="container mx-auto max-w-screen-2xl flex-1 flex flex-col p-0 sm:p-4">
        <Suspense fallback={<FilterSortControlsSkeleton />}>
          <FilterSortControls uniqueTags={uniqueTags} />
        </Suspense>
        
        <Suspense fallback={
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 p-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="w-80 bg-card rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6 mb-1" />
                </div>
                <div className="p-4 border-t mt-auto">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        }>
          <VideoGridDisplay initialUniqueTags={uniqueTags} />
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
