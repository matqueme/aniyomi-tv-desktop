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
  title?: string;
  episodeCount?: number;
  airDate?: Date;
  status?: 'ongoing' | 'completed' | 'upcoming' | undefined;
  posterUrl?: string;
  description?: string;
  voices?: string[]; // exemple: ['vostfr', 'vf']
  episodes?: Episode[]; // épisodes de la saison
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  airDate?: Date;
  voices?: string[]; // exemple: ['vostfr', 'vf']
  playersByVoice?: EpisodePlayersByVoice;
}

export interface EpisodePlayersByVoice {
  [voice: string]: Player[]; // ex: { 'vostfr': [Player, ...], 'vf': [Player, ...] }
}

export interface Player {
  url: string;
  type?: string; // ex: 'sibnet', 'vk', etc.
  voice?: string; // 'vostfr', 'vf'
}
