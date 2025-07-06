export interface Anime {
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
  episodeCount: number;
  duration: string;
  studio: string;
  trailer?: string;
  // Nouvelles propriétés pour l'extension et la saison
  extension?: string;
  season?: string;
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
