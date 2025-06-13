export interface VideoComment {
  id: string;
  text: string;
  author: string;
  timestamp: string; // ISO date string
}

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  starRating: number; // 1-5
  comments: VideoComment[];
  viewCount: number;
  uploadDate: string; // ISO date string
  tags: string[];
  channelName: string;
  channelAvatarUrl: string;
  duration: string; // e.g., "12:34"
}

export type SortOption = "uploadDate" | "viewCount" | "starRating";
export type SortOrder = "asc" | "desc";

export interface FetchVideosParams {
  topic?: string;
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
  uniqueTags: string[];
}
