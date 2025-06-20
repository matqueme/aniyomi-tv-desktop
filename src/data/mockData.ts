import type { Anime } from '../types/anime';

export const mockAnimes: Anime[] = [
  {
    id: '1',
    title: 'Attack on Titan',
    originalTitle: 'Shingeki no Kyojin',
    description:
      "L'humanité vit retranchée derrière d'immenses murailles pour se protéger des Titans, des créatures gigantesques dévoreuses d'hommes. Lorsque les murs sont brisés, Eren Yeager jure de détruire tous les Titans.",
    posterUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop',
    year: 2023,
    status: 'completed',
    genres: ['Action', 'Drame', 'Fantasy'],
    rating: 9.2,
    episodeCount: 87,
    duration: '24 min',
    studio: 'WIT Studio / MAPPA',
  },
  {
    id: '2',
    title: 'Demon Slayer',
    originalTitle: 'Kimetsu no Yaiba',
    description:
      'Tanjiro devient un pourfendeur de démons pour sauver sa sœur transformée en démon et venger sa famille massacrée.',
    posterUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1IOvRfuM-mALNOC_dD0_6yQ7IXqHXiKxBCA&s',
    bannerUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1IOvRfuM-mALNOC_dD0_6yQ7IXqHXiKxBCA&s',
    year: 2023,
    status: 'ongoing',
    genres: ['Action', 'Surnaturel', 'Historique'],
    rating: 8.9,
    episodeCount: 44,
    duration: '23 min',
    studio: 'Ufotable',
  },
  {
    id: '3',
    title: 'One Piece',
    description:
      'Monkey D. Luffy et son équipage de pirates partent à la recherche du trésor légendaire "One Piece" pour devenir le roi des pirates.',
    posterUrl:
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=600&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=1920&h=1080&fit=crop',
    year: 1999,
    status: 'ongoing',
    genres: ['Action', 'Aventure', 'Comédie'],
    rating: 9.0,
    episodeCount: 1000,
    duration: '24 min',
    studio: 'Toei Animation',
  },
  {
    id: '4',
    title: 'My Hero Academia',
    originalTitle: 'Boku no Hero Academia',
    description:
      'Dans un monde où 80% de la population possède des super-pouvoirs, Izuku Midoriya rêve de devenir un héros malgré son absence de pouvoir.',
    posterUrl:
      'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&h=1080&fit=crop',
    year: 2023,
    status: 'ongoing',
    genres: ['Action', 'Super-héros', 'École'],
    rating: 8.7,
    episodeCount: 154,
    duration: '24 min',
    studio: 'Bones',
  },
  {
    id: '5',
    title: 'Jujutsu Kaisen',
    description:
      'Yuji Itadori rejoint une organisation secrète de sorciers pour combattre les fléaux, des créatures nées des émotions négatives humaines.',
    posterUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=600&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1920&h=1080&fit=crop',
    year: 2023,
    status: 'ongoing',
    genres: ['Action', 'Surnaturel', 'École'],
    rating: 8.8,
    episodeCount: 24,
    duration: '23 min',
    studio: 'MAPPA',
  },
  {
    id: '6',
    title: 'Spirited Away',
    originalTitle: 'Sen to Chihiro no Kamikakushi',
    description:
      "Une jeune fille doit travailler dans un monde magique peuplé d'esprits pour sauver ses parents transformés en cochons.",
    posterUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop',
    year: 2001,
    status: 'completed',
    genres: ['Fantasy', 'Aventure', 'Famille'],
    rating: 9.3,
    episodeCount: 1,
    duration: '125 min',
    studio: 'Studio Ghibli',
  },
];
