
export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  likeCount: number;
  viewCount: number;
  uploadDate: string; // ISO date string
  tags: string[];
  channelName: string;
  // channelAvatarUrl: string; // Removed as it's complex to fetch for each video
  duration: string; // e.g., "12:34"
  description: string;
}

export type SortOption = "uploadDate" | "viewCount" | "likeCount";
export type SortOrder = "asc" | "desc";

export interface FetchVideosParams {
  channel?: string;
  searchQuery?: string;
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
  uniqueChannels: string[];
}
