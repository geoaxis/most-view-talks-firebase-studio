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
import type { SortOption } from '@/types';
import { Filter, ListFilter, RotateCcw } from 'lucide-react';
import React from 'react';

interface FilterSortControlsProps {
  uniqueTags: string[];
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'uploadDate', label: 'Upload Date' },
  { value: 'viewCount', label: 'View Count' },
  { value: 'starRating', label: 'Star Rating' },
];

export default function FilterSortControls({ uniqueTags }: FilterSortControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTopic = searchParams.get('topic') || '';
  const currentSortBy = (searchParams.get('sortBy') as SortOption) || 'uploadDate';
  const currentSortOrder = searchParams.get('sortOrder') || 'desc';

  const handleTopicChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('topic', value);
    } else {
      params.delete('topic');
    }
    params.set('page', '1'); // Reset to first page on filter change
    router.push(`?${params.toString()}`, { scroll: false });
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
    router.push('?', { scroll: false });
  };

  return (
    <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md mb-6 sticky top-0 z-10 border-b">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="topic-filter" className="text-sm font-medium text-foreground flex items-center mb-1">
            <Filter className="h-4 w-4 mr-2" /> Topic
          </Label>
          <Select value={currentTopic} onValueChange={handleTopicChange}>
            <SelectTrigger id="topic-filter" className="w-full bg-background">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Topics</SelectItem>
              {uniqueTags.map(tag => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        
        <div className="sm:col-start-2 lg:col-start-3">
            <Button onClick={handleResetFilters} variant="outline" className="w-full bg-background">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Filters
            </Button>
        </div>
      </div>
    </div>
  );
}
