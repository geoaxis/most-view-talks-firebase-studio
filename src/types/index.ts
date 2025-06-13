
export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  likeCount: number; // Changed from starRating
  // comments: VideoComment[]; // Removed comments
  viewCount: number;
  uploadDate: string; // ISO date string
  tags: string[]; // Kept for display purposes
  channelName: string;
  channelAvatarUrl: string;
  duration: string; // e.g., "12:34"
}

// Removed VideoComment interface as it's no longer used

export type SortOption = "uploadDate" | "viewCount" | "likeCount"; // Changed starRating to likeCount
export type SortOrder = "asc" | "desc";

export interface FetchVideosParams {
  channel?: string; // Changed from topic
  searchQuery?: string; // Added for free text search
  sortBy?: SortOption;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface PaginatedVideos {
  videos: Video[];
  totalPages: number;
  currentPage: number;
  totalVideos: number;
  uniqueChannels: string[]; // Changed from uniqueTags
}
