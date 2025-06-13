
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Video, PaginatedVideos, SortOption, SortOrder } from '@/types';
import { google, type youtube_v3 } from 'googleapis';
import { getMainDescription, parseISO8601Duration } from '@/lib/youtube-utils';

let allVideosCache: Video[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY,
});

const parseNumericStat = (stat: string | null | undefined): number => {
  if (stat === null || typeof stat === 'undefined' || stat.trim() === '') {
    return 0;
  }
  const cleanedStat = stat.replace(/,/g, '');
  const num = parseInt(cleanedStat, 10);
  return isNaN(num) ? 0 : num;
};

async function fetchAllVideosFromYouTube(): Promise<Video[]> {
  if (allVideosCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    console.log("Returning videos from cache.");
    return allVideosCache;
  }
  console.log("Fetching videos from YouTube API.");

  const playlistIdEnv = process.env.PLAYLIST_IDS;
  if (!playlistIdEnv) {
    console.error("PLAYLIST_IDS environment variable is not set.");
    throw new Error("Server configuration error: PLAYLIST_IDS missing.");
  }
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY environment variable is not set.");
    throw new Error("Server configuration error: GOOGLE_API_KEY missing.");
  }

  const playlistIds = playlistIdEnv.split(',').map(id => id.trim()).filter(id => id);
  if (playlistIds.length === 0) {
    console.warn("No valid playlist IDs found in PLAYLIST_IDS environment variable. Returning empty video list.");
    allVideosCache = [];
    cacheTimestamp = Date.now();
    return [];
  }

  const videoDataMap = new Map<string, youtube_v3.Schema$Video>();

  for (const playlistId of playlistIds) {
    let nextPageToken: string | undefined | null = undefined;
    do {
      try {
        const playlistItemsResponseData = (await youtube.playlistItems.list({
          part: ['snippet', 'contentDetails'],
          playlistId: playlistId,
          maxResults: 50,
          pageToken: nextPageToken ?? undefined,
        })).data;
        
        const videoIds = playlistItemsResponseData.items
          ?.map(item => item.contentDetails?.videoId)
          .filter((id): id is string => !!id) || [];

        if (videoIds.length > 0) {
          const videoDetailsResponseData = (await youtube.videos.list({
            part: ['snippet', 'contentDetails', 'statistics', 'id'],
            id: videoIds,
            maxResults: 50,
          })).data;
          
          videoDetailsResponseData.items?.forEach(video => {
            if (video.id) {
              videoDataMap.set(video.id, video);
            }
          });
        }
        nextPageToken = playlistItemsResponseData.nextPageToken;
      } catch (apiError) {
        console.error(`Error fetching from YouTube API for playlist ${playlistId} (pageToken: ${nextPageToken}):`, apiError);
        // Optionally, decide if one playlist error should stop all or just skip this playlist
        nextPageToken = null; // Stop processing this playlist on error
      }
    } while (nextPageToken);
  }

  const fetchedVideos: Video[] = Array.from(videoDataMap.values()).map((video): Video | null => {
    if (!video.id || !video.snippet || !video.contentDetails || !video.statistics) return null;
    
    const thumbnails = video.snippet.thumbnails;
    let thumbnailUrl = thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || 'https://placehold.co/480x360.png';

    return {
      id: video.id,
      title: video.snippet.title || 'Untitled Video',
      thumbnailUrl,
      likeCount: parseNumericStat(video.statistics.likeCount),
      viewCount: parseNumericStat(video.statistics.viewCount),
      uploadDate: video.snippet.publishedAt || new Date().toISOString(),
      tags: video.snippet.tags || [],
      channelName: video.snippet.channelTitle || 'Unknown Channel',
      duration: parseISO8601Duration(video.contentDetails?.duration),
      description: getMainDescription(video.snippet.description),
    };
  }).filter((v): v is Video => v !== null);

  console.log(`Fetched ${fetchedVideos.length} unique videos from YouTube.`);
  allVideosCache = fetchedVideos;
  cacheTimestamp = Date.now();
  return fetchedVideos;
}


export async function GET(request: NextRequest) {
  console.log(`/api/videos route hit. Request URL: ${request.url}`);
  // These logs are more for local dev or specific debugging,
  // as missing env vars are checked and thrown in fetchAllVideosFromYouTube
  // if (!process.env.PLAYLIST_IDS) console.warn("PLAYLIST_IDS env var is missing in API route (checked in GET).");
  // if (!process.env.GOOGLE_API_KEY) console.warn("GOOGLE_API_KEY env var is missing in API route (checked in GET).");

  try {
    const allVideos = await fetchAllVideosFromYouTube();
    const allUniqueChannels = Array.from(new Set(allVideos.map(video => video.channelName))).sort();

    const searchParams = request.nextUrl.searchParams;
    const channel = searchParams.get('channel');
    const searchQuery = searchParams.get('searchQuery')?.toLowerCase();
    const sortBy = searchParams.get('sortBy') as SortOption | null;
    const sortOrder = searchParams.get('sortOrder') as SortOrder | null || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let filteredVideos = [...allVideos];

    if (channel) {
      filteredVideos = filteredVideos.filter(video => video.channelName === channel);
    }

    if (searchQuery) {
      filteredVideos = filteredVideos.filter(video => 
        video.title.toLowerCase().includes(searchQuery) ||
        (video.description && video.description.toLowerCase().includes(searchQuery))
      );
    }

    if (sortBy) {
      filteredVideos.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'uploadDate') {
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        } else if (sortBy === 'viewCount') {
          comparison = a.viewCount - b.viewCount;
        } else if (sortBy === 'likeCount') {
          comparison = a.likeCount - b.likeCount;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    const totalVideos = filteredVideos.length;
    const totalPages = Math.ceil(totalVideos / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

    const responseData: PaginatedVideos = {
      videos: paginatedVideos,
      totalPages,
      currentPage: page,
      totalVideos,
      uniqueChannels: allUniqueChannels
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in GET /api/videos:", error);
    const message = error instanceof Error ? error.message : "Error fetching videos";
    return NextResponse.json({ message, error: String(error) }, { status: 500 });
  }
}

