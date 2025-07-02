<template>
  <div
    v-focus-section:[listId]="sectionConfig"
    class="max-w-screen mb-8 box-border"
    :data-sn-section="listId"
    :data-section-id="listId"
  >
    <h2 class="mb-6 ml-1 text-3xl font-bold text-white">{{ title }}</h2>
    <swiper-container
      ref="swiperRef"
      v-focus
      :slides-per-view="'auto'"
      :space-between="24"
      :free-mode="true"
      :grab-cursor="false"
      :mouse-wheel="false"
      :keyboard="false"
      class="anime-swiper-element"
      tabindex="0"
      @keydown="handleSwiperKeydown"
      @focus="handleSwiperFocus"
      @blur="handleSwiperBlur"
    >
      <swiper-slide
        v-for="(anime, index) in animes"
        :key="anime.id"
        :class="[
          'anime-slide-element',
          { focused: index === currentSlideIndex && swiperHasFocus },
        ]"
      >
        <AnimeCard
          :anime="anime"
          :is-focused="index === focusedIndex"
          class="anime-card-focusable"
          @select="(anime: Anime) => emit('select', anime)"
          @focus="() => handleFocus(index)"
          @blur="() => handleUnfocus(index)"
        />
      </swiper-slide>
    </swiper-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Anime } from '@/types/anime';
import AnimeCard from '@/components/anime/AnimeCard.vue';

interface Props {
  animes: Anime[];
  title: string;
  itemsPerRow?: number;
  listId?: string;
  leaveUpTo?: string; // Section vers laquelle naviguer vers le haut
  leaveDownTo?: string; // Section vers laquelle naviguer vers le bas
}

interface Emits {
  (e: 'select', anime: Anime): void;
}

// Define Swiper Element interface
interface SwiperElement extends HTMLElement {
  swiper?: {
    realIndex: number;
    setTranslate: (translate: number) => void;
    slideTo: (index: number, speed?: number) => void;
    getTranslate: () => number;
  };
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();

const focusedIndex = ref(-1);
const swiperRef = ref<SwiperElement | null>(null);
const currentSlideIndex = ref(0);
const swiperHasFocus = ref(false);

// Configuration de la section spatiale
const sectionConfig = ref<Record<string, unknown>>({});

const handleFocus = (index: number) => {
  focusedIndex.value = index;
};

const handleUnfocus = (index: number) => {
  if (focusedIndex.value === index) {
    focusedIndex.value = -1;
  }
};

const handleSwiperKeydown = (event: KeyboardEvent) => {
  // Gérer la navigation uniquement pour ce swiper s'il a le focus
  if (document.activeElement !== swiperRef.value) return;

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      navigateToPreviousSlide();
      break;
    case 'ArrowRight':
      event.preventDefault();
      navigateToNextSlide();
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (currentSlideIndex.value < props.animes.length) {
        emit('select', props.animes[currentSlideIndex.value]);
      }
      break;
  }
};

const navigateToPreviousSlide = () => {
  if (currentSlideIndex.value > 0) {
    currentSlideIndex.value--;
    scrollToSlide(currentSlideIndex.value);
    focusedIndex.value = currentSlideIndex.value;
  }
};

const navigateToNextSlide = () => {
  if (currentSlideIndex.value < props.animes.length - 1) {
    currentSlideIndex.value++;
    scrollToSlide(currentSlideIndex.value);
    focusedIndex.value = currentSlideIndex.value;
  }
};

const scrollToSlide = (index: number) => {
  if (!swiperRef.value?.swiper) return;

  const slideWidth = 320 + 30; // Card width + spacing
  const containerWidth = window.innerWidth;
  const containerPadding = 48; // 24px de chaque côté
  const cardWidth = 320;

  // Pour les premières cartes, essayer de centrer
  // Pour les dernières cartes, s'assurer qu'elles sont complètement visibles
  let targetPosition: number;

  const totalContentWidth = props.animes.length * slideWidth;
  const availableWidth = containerWidth - containerPadding;

  if (totalContentWidth <= availableWidth) {
    // Si tout le contenu tient dans le container, pas de scroll nécessaire
    targetPosition = 0;
  } else {
    const centerOffset = containerWidth / 2 - cardWidth / 2;
    const centeredPosition = index * slideWidth - centerOffset;

    // Position pour que la dernière carte soit complètement visible
    const maxScrollForLastCard = totalContentWidth - availableWidth;

    if (index >= props.animes.length - 2) {
      // Pour les 2 dernières cartes, s'assurer qu'elles sont visibles
      targetPosition = maxScrollForLastCard;
    } else {
      targetPosition = centeredPosition;
    }
  }

  // Ensure we don't scroll past the beginning or end
  const maxTranslate = 0;
  const minTranslate = -(totalContentWidth - availableWidth);
  const clampedPosition = Math.max(
    minTranslate,
    Math.min(maxTranslate, -targetPosition)
  );

  swiperRef.value.swiper.setTranslate(clampedPosition);
};

const handleSwiperFocus = () => {
  // Quand le swiper reçoit le focus, s'assurer qu'un slide est sélectionné
  swiperHasFocus.value = true;
  if (focusedIndex.value === -1 && props.animes.length > 0) {
    currentSlideIndex.value = 0;
    focusedIndex.value = 0;
    scrollToSlide(0);
  }
};

const handleSwiperBlur = () => {
  // Quand le swiper perd le focus, désélectionner tous les slides
  swiperHasFocus.value = false;
  focusedIndex.value = -1;
  currentSlideIndex.value = 0;
};

// Watch for focused index changes to handle smooth scrolling
// Swiper gère maintenant automatiquement le scroll avec keyboard: true

onMounted(() => {
  if (props.listId) {
    // Configure spatial navigation section avec la navigation directionnelle
    const leaveFor: Record<string, string> = {};

    if (props.leaveUpTo) {
      leaveFor.up = props.leaveUpTo;
    }

    if (props.leaveDownTo) {
      leaveFor.down = props.leaveDownTo;
    }

    // Mettre à jour la configuration de la section
    sectionConfig.value = {
      straightOnly: true,
      straightOverlapThreshold: 0.8,
      leaveFor, // Configuration pour permettre la navigation vers d'autres sections
      restrict: 'self-first',
      tabIndexIgnoreList:
        'a, input, select, textarea, button, iframe, [tabindex]',
    };
  }
});

defineExpose({
  focusedIndex,
  swiperRef,
  currentSlideIndex,
  navigateToPreviousSlide,
  navigateToNextSlide,
});
</script>

<style scoped>
.anime-swiper-element {
  overflow: visible;
  outline: none;
}

.anime-slide-element {
  width: auto;
  flex-shrink: 0;
  padding: 2px; /* Ajustement pour l'espacement */
}
</style>
