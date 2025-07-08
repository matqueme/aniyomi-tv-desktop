export interface AnimeCardInfo {
  id: string;
  title: string;
  posterUrl: string;
  year?: number;
  numberOfEpisodes?: number;
  extension?: string; // Extension d'où provient l'anime
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  duration: string;
  airDate: Date;
}

export interface AnimeDetails {
  id: string;
  title: string;
  originalTitle?: string;
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  year: number;
  status: 'ongoing' | 'completed' | 'upcoming';
  genres: string[];
  rating: number;
  duration: string;
  studio: string;
  trailer?: string;
  extension: string;

  // Informations sur les saisons
  seasons: Season[];
  totalEpisodes: number;
}

export interface Season {
  number: number;
  title: string;
  episodeCount: number;
  airDate?: Date;
  status: 'ongoing' | 'completed' | 'upcoming';
  posterUrl?: string;
  description?: string;
}
