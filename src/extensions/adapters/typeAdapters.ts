/**
 * Adaptateurs pour convertir les anciens types vers les nouveaux
 */

import type { AnimeCardInfo, AnimeDetails, Episode } from '@/types/anime';
import type {
  AnimeSource,
  AnimeSourceDetails,
  AnimeEpisode,
} from '@/extensions/types/extension';

export function adaptAnimeSource(source: AnimeSource): AnimeCardInfo {
  return {
    id: source.id,
    title: source.title,
    posterUrl: source.posterUrl || '',
    year: source.year,
    totalEpisodes: source.episodeCount,
    extension: 'animesama', // Par défaut, à adapter selon le contexte
  };
}

export function adaptAnimeDetails(details: AnimeSourceDetails): AnimeDetails {
  return {
    id: details.id,
    title: details.title,
    posterUrl: details.posterUrl || '',
    year: details.year,
    totalEpisodes: details.episodes?.length,
    extension: 'animesama', // Par défaut, à adapter selon le contexte
    originalTitle: details.title,
    description: details.description,
    bannerUrl: details.bannerUrl,
    status: details.status,
    genres: details.genres,
    rating: details.rating,
    studio: details.studio,
    trailer: undefined, // Pas dans AnimeSourceDetails
    duration: undefined, // Pas dans AnimeSourceDetails
    seasons: undefined, // Pas dans AnimeSourceDetails
  };
}

export function adaptEpisode(episode: AnimeEpisode): Episode {
  return {
    id: episode.id,
    animeId: episode.id.split('-ep-')[0], // Extraction de l'ID anime
    number: episode.number,
    title: episode.title,
    description: undefined, // Pas dans AnimeEpisode
    thumbnailUrl: episode.thumbnailUrl,
    videoUrl: episode.url,
    duration: episode.duration,
    airDate: episode.releaseDate,
  };
}
