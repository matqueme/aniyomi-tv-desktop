export interface AnimeSamaAnime {
  title: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  genre?: string;
  status?: 'ongoing' | 'completed' | 'unknown' | undefined;
  initialized: boolean;
  year?: number;
  studio?: string;
  type?: string;
  totalEpisodes?: number;
}

export interface AnimeSamaEpisode {
  name: string;
  episodeNumber: number;
  playerUrls: string[][];
  scanlator?: string;
}

export interface AnimeSamaVideo {
  quality: string;
  url: string;
  headers?: Record<string, string>;
}

export interface AnimeSamaSearchParams {
  query?: string;
  types?: string[];
  languages?: string[];
  genres?: string[];
  page?: number;
}

export interface AnimeSamaPage<T> {
  data: T[];
  hasNextPage: boolean;
}
