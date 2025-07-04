// Mock data pour les vidéos

export interface VideoSource {
  id: string;
  animeId: string;
  episode: number;
  title: string;
  videoUrl: string;
  videoType: string;
  poster?: string;
  subtitles?: Array<{
    language: string;
    url: string;
    default?: boolean;
  }>;
  duration?: number;
  description?: string;
}

// Sources vidéo d'exemple - remplacez par vos vraies sources
export const mockVideoSources: VideoSource[] = [
  {
    id: 'demo-1-1',
    animeId: '1',
    episode: 1,
    title: "Épisode 1 - Le début de l'aventure",
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoType: 'video/mp4',
    poster:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop',
    duration: 1440, // 24 minutes en secondes
    description: 'Premier épisode de la série.',
    subtitles: [
      {
        language: 'fr',
        url: '/subtitles/episode1-fr.vtt',
        default: true,
      },
      {
        language: 'en',
        url: '/subtitles/episode1-en.vtt',
      },
    ],
  },
  {
    id: 'demo-1-2',
    animeId: '1',
    episode: 2,
    title: 'Épisode 2 - La quête continue',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    videoType: 'video/mp4',
    poster:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop',
    duration: 1380, // 23 minutes
    description: 'Deuxième épisode de la série.',
  },
  {
    id: 'demo-2-1',
    animeId: '2',
    episode: 1,
    title: "Épisode 1 - Dans l'ombre",
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoType: 'video/mp4',
    poster:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=450&fit=crop',
    duration: 1500, // 25 minutes
    description: 'Premier épisode mystérieux.',
  },
  // Ajoutez plus d'épisodes selon vos besoins
];

// Exemple avec HLS (pour les streams en direct ou adaptatifs)
export const mockHLSSource: VideoSource = {
  id: 'hls-demo',
  animeId: '3',
  episode: 1,
  title: 'Épisode 1 - Streaming HLS',
  videoUrl:
    'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  videoType: 'application/x-mpegURL',
  poster:
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop',
  duration: 3600, // 1 heure
  description: 'Exemple de streaming HLS adaptatif.',
};

// Fonction pour récupérer une source vidéo
export const getVideoSource = (
  animeId: string,
  episode: number
): VideoSource | null => {
  return (
    mockVideoSources.find(
      (source) => source.animeId === animeId && source.episode === episode
    ) || null
  );
};

// Fonction pour récupérer tous les épisodes d'un anime
export const getAnimeEpisodes = (animeId: string): VideoSource[] => {
  return mockVideoSources.filter((source) => source.animeId === animeId);
};

// Exemple de configuration pour différents types de sources
export const videoTypeConfig = {
  'video/mp4': {
    name: 'MP4',
    description: 'Vidéo MP4 standard',
    icon: '🎬',
  },
  'application/x-mpegURL': {
    name: 'HLS',
    description: 'HTTP Live Streaming',
    icon: '📡',
  },
  'application/dash+xml': {
    name: 'DASH',
    description: 'Dynamic Adaptive Streaming',
    icon: '⚡',
  },
};
