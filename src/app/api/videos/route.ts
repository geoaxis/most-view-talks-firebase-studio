
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

  const descriptions = [
    "A deep dive into the latest strategies for winning your favorite game. Includes pro tips and tricks!",
    "Learn how to cook a delicious three-course meal in under an hour with this easy-to-follow tutorial.",
    "Exploring the beautiful landscapes of the Swiss Alps. A breathtaking journey you won't want to miss.",
    "Unboxing the newest smartphone on the market. Is it worth the hype? Let's find out.",
    "An educational video explaining the basics of quantum physics in a simple and understandable way.",
    "Hilarious compilation of the funniest animal moments caught on camera this month.",
    "A comprehensive review of the top 5 programming languages for web development in the current year.",
    "Join me on my daily vlog as I explore hidden gems in my city and share my experiences.",
    "The official music video for the latest hit single from a rising pop star. Catchy tunes and stunning visuals.",
    "Discover the secrets of ancient civilizations in this fascinating documentary.",
    "A step-by-step guide to building your own DIY bookshelf from scratch. Perfect for beginners!",
    "Fitness expert shares a 20-minute high-intensity interval training (HIIT) workout for maximum results.",
    "Travel guide to Tokyo: best food, attractions, and cultural experiences.",
    "Learn to play the guitar with this beginner-friendly lesson covering basic chords and strumming patterns.",
    "The future of artificial intelligence: A discussion with leading experts in the field."
  ];

  return {
    id: `video-${i + 1}`,
    title: `Awesome Video Title That Might Be A Bit Long Sometimes ${i + 1}`,
    thumbnailUrl: `https://placehold.co/600x338.png`,
    likeCount: Math.floor(Math.random() * 10000) + 50,
    viewCount: Math.floor(Math.random() * 1000000) + 100,
    uploadDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString(),
    tags: Array.from(videoTags),
    channelName: `Channel ${String.fromCharCode(65 + (i % 15))}${Math.floor(i / 15) + 1}`,
    channelAvatarUrl: `https://placehold.co/40x40.png`,
    duration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    description: descriptions[i % descriptions.length] + ` This is additional detail for video ${i+1} to make sure the description is long enough to test clamping and hover effects. We explore various aspects and provide in-depth analysis.`,
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
        video.title.toLowerCase().includes(searchQuery) ||
        video.description.toLowerCase().includes(searchQuery)
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

    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ message: "Error fetching videos" }, { status: 500 });
  }
}
