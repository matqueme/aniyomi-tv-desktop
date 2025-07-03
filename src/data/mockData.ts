import type { Anime, Episode } from '@/types/anime';

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

export const mockEpisodes: Episode[] = [
  // Attack on Titan episodes
  {
    id: 'ep1-1',
    animeId: '1',
    number: 1,
    title: 'À toi, dans 2000 ans',
    description:
      "L'humanité vit retranchée derrière d'immenses murailles pour se protéger des Titans. Eren Yeager assiste à la destruction du mur Maria.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    videoUrl: 'https://example.com/episodes/aot-ep1.mp4',
    duration: '24 min',
    airDate: new Date('2013-04-07'),
  },
  {
    id: 'ep1-2',
    animeId: '1',
    number: 2,
    title: 'Ce jour-là',
    description:
      "Eren rejoint l'armée pour venger sa mère et détruire tous les Titans.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    videoUrl: 'https://example.com/episodes/aot-ep2.mp4',
    duration: '24 min',
    airDate: new Date('2013-04-14'),
  },
  {
    id: 'ep1-3',
    animeId: '1',
    number: 3,
    title: "Une faible lueur d'espoir",
    description: "L'entraînement militaire commence pour Eren et ses amis.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    videoUrl: 'https://example.com/episodes/aot-ep3.mp4',
    duration: '24 min',
    airDate: new Date('2013-04-21'),
  },

  // Demon Slayer episodes
  {
    id: 'ep2-1',
    animeId: '2',
    number: 1,
    title: 'Cruauté',
    description:
      'Tanjiro découvre sa famille massacrée et sa sœur transformée en démon.',
    thumbnailUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1IOvRfuM-mALNOC_dD0_6yQ7IXqHXiKxBCA&s',
    videoUrl: 'https://example.com/episodes/ds-ep1.mp4',
    duration: '23 min',
    airDate: new Date('2019-04-06'),
  },
  {
    id: 'ep2-2',
    animeId: '2',
    number: 2,
    title: "L'Instructeur Sakonji Urokodaki",
    description:
      "Tanjiro rencontre l'ancien pilier de l'eau qui accepte de l'entraîner.",
    thumbnailUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1IOvRfuM-mALNOC_dD0_6yQ7IXqHXiKxBCA&s',
    videoUrl: 'https://example.com/episodes/ds-ep2.mp4',
    duration: '23 min',
    airDate: new Date('2019-04-13'),
  },

  // One Piece episodes
  {
    id: 'ep3-1',
    animeId: '3',
    number: 1,
    title: "Je suis Luffy ! L'homme qui deviendra le Roi des Pirates !",
    description:
      'Monkey D. Luffy commence son aventure pour devenir le Roi des Pirates.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=200&fit=crop',
    videoUrl: 'https://example.com/episodes/op-ep1.mp4',
    duration: '24 min',
    airDate: new Date('1999-10-20'),
  },
  {
    id: 'ep3-2',
    animeId: '3',
    number: 2,
    title: "L'homme au chapeau de paille",
    description: 'Luffy recrute Zoro comme premier membre de son équipage.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=200&fit=crop',
    videoUrl: 'https://example.com/episodes/op-ep2.mp4',
    duration: '24 min',
    airDate: new Date('1999-11-03'),
  },

  // My Hero Academia episodes
  {
    id: 'ep4-1',
    animeId: '4',
    number: 1,
    title: 'Izuku Midoriya : Origine',
    description:
      'Izuku Midoriya rêve de devenir un héros malgré son absence de Alter.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=200&fit=crop',
    videoUrl: 'https://example.com/episodes/mha-ep1.mp4',
    duration: '24 min',
    airDate: new Date('2016-04-03'),
  },
  {
    id: 'ep4-2',
    animeId: '4',
    number: 2,
    title: "Qu'est-ce qu'il faut pour être un héros",
    description: 'All Might choisit Izuku comme successeur de son pouvoir.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=200&fit=crop',
    videoUrl: 'https://example.com/episodes/mha-ep2.mp4',
    duration: '24 min',
    airDate: new Date('2016-04-10'),
  },

  // Jujutsu Kaisen episodes
  {
    id: 'ep5-1',
    animeId: '5',
    number: 1,
    title: 'Ryomen Sukuna',
    description:
      "Yuji Itadori avale un doigt maudit et devient l'hôte du Roi des Fléaux.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=200&fit=crop',
    videoUrl: 'https://example.com/episodes/jjk-ep1.mp4',
    duration: '23 min',
    airDate: new Date('2020-10-03'),
  },
  {
    id: 'ep5-2',
    animeId: '5',
    number: 2,
    title: 'Pour moi',
    description:
      "Yuji rejoint l'École d'Exorcisme de Tokyo et rencontre ses nouveaux camarades.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=200&fit=crop',
    videoUrl: 'https://example.com/episodes/jjk-ep2.mp4',
    duration: '23 min',
    airDate: new Date('2020-10-10'),
  },
];
