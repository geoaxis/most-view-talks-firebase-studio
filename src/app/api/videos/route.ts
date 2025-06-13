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

  const commentsCount = Math.floor(Math.random() * 20);
  const comments: Video['comments'] = Array.from({ length: commentsCount }, (__, k) => ({
    id: `comment-${i}-${k}`,
    author: `User ${Math.floor(Math.random() * 1000)}`,
    text: `This is comment number ${k + 1}. Some insightful thoughts here, or maybe just a reaction. ${'Lorem ipsum dolor sit amet. '.repeat(Math.random() * 5 + 1)}`,
    timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
  }));

  const minutes = Math.floor(Math.random() * 30) + 1;
  const seconds = Math.floor(Math.random() * 60);


  return {
    id: `video-${i + 1}`,
    title: `Awesome Video Title That Might Be A Bit Long Sometimes ${i + 1}`,
    thumbnailUrl: `https://placehold.co/400x225.png`, // Standard 16:9 aspect ratio
    starRating: Math.floor(Math.random() * 5) + 1,
    comments,
    viewCount: Math.floor(Math.random() * 1000000) + 100,
    uploadDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString(), // Random date in the last year
    tags: Array.from(videoTags),
    channelName: `Channel ${String.fromCharCode(65 + (i % 26))}`, // A, B, C...
    channelAvatarUrl: `https://placehold.co/40x40.png`,
    duration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
  };
});

const allUniqueTags = Array.from(new Set(allVideos.flatMap(video => video.tags))).sort();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get('topic');
    const sortBy = searchParams.get('sortBy') as SortOption | null;
    const sortOrder = searchParams.get('sortOrder') as SortOrder | null || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let filteredVideos = [...allVideos];

    if (topic) {
      filteredVideos = filteredVideos.filter(video => video.tags.includes(topic));
    }

    if (sortBy) {
      filteredVideos.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'uploadDate') {
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        } else if (sortBy === 'viewCount') {
          comparison = a.viewCount - b.viewCount;
        } else if (sortBy === 'starRating') {
          comparison = a.starRating - b.starRating;
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
      uniqueTags: allUniqueTags
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ message: "Error fetching videos" }, { status: 500 });
  }
}
