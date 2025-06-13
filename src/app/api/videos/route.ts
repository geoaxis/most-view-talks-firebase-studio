
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Video, PaginatedVideos, SortOption, SortOrder } from '@/types';

const allVideos: Video[] = Array.from({ length: 100 }, (_, i) => {
  const tagsPool = ["Gaming", "Tutorial", "Music", "Vlog", "Science", "Comedy", "Technology", "Education", "Travel", "Cooking"];
  const numTags = Math.floor(Math.random() * 3) + 1;
  const videoTags = new Set<string>();
  while (videoTags.size < numTags) {
    videoTags.add(tagsPool[Math.floor(Math.random() * tagsPool.length)]);
  }

  const minutes = Math.floor(Math.random() * 30) + 1;
  const seconds = Math.floor(Math.random() * 60);

  return {
    id: `video-${i + 1}`,
    title: `Awesome Video Title That Might Be A Bit Long Sometimes ${i + 1}`,
    thumbnailUrl: `https://placehold.co/600x338.png`, // Adjusted for a potentially larger display
    likeCount: Math.floor(Math.random() * 10000) + 50, // Changed from starRating, higher values for likes
    viewCount: Math.floor(Math.random() * 1000000) + 100,
    uploadDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString(),
    tags: Array.from(videoTags),
    channelName: `Channel ${String.fromCharCode(65 + (i % 15))}${Math.floor(i / 15) + 1}`, // More varied channel names
    channelAvatarUrl: `https://placehold.co/40x40.png`,
    duration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
  };
});

const allUniqueChannels = Array.from(new Set(allVideos.map(video => video.channelName))).sort();

export async function GET(request: NextRequest) {
  try {
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
        video.title.toLowerCase().includes(searchQuery)
        // Potential to add description search here if data included it
        // || video.description.toLowerCase().includes(searchQuery) 
      );
    }

    if (sortBy) {
      filteredVideos.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'uploadDate') {
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        } else if (sortBy === 'viewCount') {
          comparison = a.viewCount - b.viewCount;
        } else if (sortBy === 'likeCount') { // Changed from starRating
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
      uniqueChannels: allUniqueChannels // Changed from uniqueTags
    };

    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ message: "Error fetching videos" }, { status: 500 });
  }
}
