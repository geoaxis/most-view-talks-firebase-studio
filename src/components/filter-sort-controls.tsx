
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

const ALL_TOPICS_VALUE = "_all_"; // Define a constant for the special value

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'uploadDate', label: 'Upload Date' },
  { value: 'viewCount', label: 'View Count' },
  { value: 'starRating', label: 'Star Rating' },
];

export default function FilterSortControls({ uniqueTags }: FilterSortControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTopic = searchParams.get('topic') || ''; // This will be empty string if no topic is set
  const currentSortBy = (searchParams.get('sortBy') as SortOption) || 'uploadDate';
  const currentSortOrder = searchParams.get('sortOrder') || 'desc';

  const handleTopicChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL_TOPICS_VALUE) {
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

  // Determine the value for the Select component. If currentTopic is empty, 
  // it means "All Topics" should be selected conceptually, which corresponds to ALL_TOPICS_VALUE for the SelectItem.
  // However, the Select component's value should be an empty string to show the placeholder correctly if no topic is in the URL.
  // If a topic is selected, currentTopic will be that topic's value.
  // If "All Topics" is explicitly selected by the user, handleTopicChange will clear the URL param,
  // making currentTopic '', and the Select value for rendering will be ALL_TOPICS_VALUE to select the item.
  // The Select's `value` prop should reflect what's in the URL. If `currentTopic` is `''`, it means no specific topic is filtered.
  // The "All Topics" `SelectItem` has the value `ALL_TOPICS_VALUE`.
  // So, if `currentTopic` is `''`, we want the Select to show "All Topics" as selected.
  const selectTopicValue = currentTopic === '' ? ALL_TOPICS_VALUE : currentTopic;


  return (
    <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md mb-6 sticky top-0 z-10 border-b">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="topic-filter" className="text-sm font-medium text-foreground flex items-center mb-1">
            <Filter className="h-4 w-4 mr-2" /> Topic
          </Label>
          <Select value={selectTopicValue} onValueChange={handleTopicChange}>
            <SelectTrigger id="topic-filter" className="w-full bg-background">
              {/* SelectValue will display the selected item's children. Placeholder is used if Select's value doesn't match any item.
                  If currentTopic is '', selectTopicValue is ALL_TOPICS_VALUE.
                  The item with value ALL_TOPICS_VALUE is "All Topics". So this will be displayed.
                  If currentTopic is 'Gaming', selectTopicValue is 'Gaming'. "Gaming" will be displayed.
              */}
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TOPICS_VALUE}>All Topics</SelectItem>
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
