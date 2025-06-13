
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Added Input
import type { SortOption } from '@/types';
import { Filter, ListFilter, RotateCcw, Search as SearchIcon } from 'lucide-react'; // Added SearchIcon
import React, { useState, useEffect, useCallback } from 'react';

interface FilterSortControlsProps {
  uniqueChannels: string[]; // Changed from uniqueTags
}

const ALL_CHANNELS_VALUE = "_all_channels_"; // Renamed constant

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'uploadDate', label: 'Upload Date' },
  { value: 'viewCount', label: 'View Count' },
  { value: 'likeCount', label: 'Likes' }, // Changed from Star Rating
];

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}


export default function FilterSortControls({ uniqueChannels }: FilterSortControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentChannel = searchParams.get('channel') || '';
  const currentSortBy = (searchParams.get('sortBy') as SortOption) || 'uploadDate';
  const currentSortOrder = searchParams.get('sortOrder') || 'desc';
  const currentSearchQuery = searchParams.get('searchQuery') || '';

  const [searchInput, setSearchInput] = useState(currentSearchQuery);

  // Update searchInput when URL query changes (e.g. back button)
  useEffect(() => {
    setSearchInput(searchParams.get('searchQuery') || '');
  }, [searchParams]);
  
  const pushRouterState = useCallback((params: URLSearchParams) => {
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const debouncedPushRouterState = useCallback(debounce(pushRouterState, 500), [pushRouterState]);


  const handleChannelChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL_CHANNELS_VALUE) {
      params.set('channel', value);
    } else {
      params.delete('channel');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = event.target.value;
    setSearchInput(newSearchQuery);
    const params = new URLSearchParams(searchParams.toString());
    if (newSearchQuery) {
      params.set('searchQuery', newSearchQuery);
    } else {
      params.delete('searchQuery');
    }
    params.set('page', '1');
    debouncedPushRouterState(params);
  };

  const handleSortByChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    params.set('page', '1'); 
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSortOrderChange = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc');
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  const handleResetFilters = () => {
    setSearchInput(''); // Clear local search input state
    router.push('?', { scroll: false }); // Clears all query params
  };

  const selectChannelValue = currentChannel === '' ? ALL_CHANNELS_VALUE : currentChannel;

  return (
    <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md mb-6 sticky top-0 z-10 border-b">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"> {/* Changed to 4 columns for lg */}
        <div>
          <Label htmlFor="channel-filter" className="text-sm font-medium text-foreground flex items-center mb-1">
            <Filter className="h-4 w-4 mr-2" /> Channel
          </Label>
          <Select value={selectChannelValue} onValueChange={handleChannelChange}>
            <SelectTrigger id="channel-filter" className="w-full bg-background">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CHANNELS_VALUE}>All Channels</SelectItem>
              {uniqueChannels.map(channelName => (
                <SelectItem key={channelName} value={channelName}>
                  {channelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="search-filter" className="text-sm font-medium text-foreground flex items-center mb-1">
            <SearchIcon className="h-4 w-4 mr-2" /> Search Title
          </Label>
          <Input
            id="search-filter"
            type="text"
            placeholder="Enter keywords..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full bg-background"
          />
        </div>

        <div>
          <Label htmlFor="sort-by" className="text-sm font-medium text-foreground flex items-center mb-1">
            <ListFilter className="h-4 w-4 mr-2" /> Sort By
          </Label>
          <div className="flex gap-2">
            <Select value={currentSortBy} onValueChange={handleSortByChange}>
              <SelectTrigger id="sort-by" className="w-full bg-background">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSortOrderChange} className="px-3 bg-background" aria-label={`Sort order: ${currentSortOrder === 'asc' ? 'Ascending' : 'Descending'}`}>
              {currentSortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </Button>
          </div>
        </div>
        
        <div> {/* Reset button in its own column */}
            <Button onClick={handleResetFilters} variant="outline" className="w-full bg-background">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset All
            </Button>
        </div>
      </div>
    </div>
  );
}
