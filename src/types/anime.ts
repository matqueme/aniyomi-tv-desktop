export interface AnimeCardInfo {
  id: string;
  title: string;
  posterUrl: string;
  year?: number;
  totalEpisodes?: number;
  extension?: string;
}

export interface AnimeDetails extends AnimeCardInfo {
  originalTitle?: string;
  description?: string;
  bannerUrl?: string;
  status?: 'ongoing' | 'completed' | 'upcoming';
  genres?: string[];
  rating?: number;
  duration?: string;
  studio?: string;
  trailer?: string;
  extension: string;
  seasons?: Season[];
}

export interface Season {
  number: number;
  title: string;
  episodeCount: number;
  airDate?: Date;
  status?: 'ongoing' | 'completed' | 'upcoming' | undefined;
  posterUrl?: string;
  description?: string;
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  duration?: string;
  airDate?: Date;
}
