<template>
  <div
    v-focus-section:[listId]="sectionConfig"
    class="max-w-screen mb-8 box-border"
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
          :is-focused="index === focusedIndex && swiperHasFocus"
          class="anime-card-focusable"
          @select="(anime: AnimeCardInfo) => emit('select', anime)"
          @focus="() => handleFocus(index)"
          @blur="() => handleUnfocus(index)"
        />
      </swiper-slide>
    </swiper-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { AnimeCardInfo } from '@/types/anime';
import AnimeCard from '@/components/anime/AnimeCard.vue';
import { normalizeKeyboardEvent } from '@/utils/keyboardUtils';

interface Props {
  animes: AnimeCardInfo[];
  title: string;
  itemsPerRow?: number;
  listId?: string;
  leaveUpTo?: string; // Section vers laquelle naviguer vers le haut
  leaveDownTo?: string; // Section vers laquelle naviguer vers le bas
}

interface Emits {
  (e: 'select', anime: AnimeCardInfo): void;
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

// Throttle pour limiter la fréquence des navigations
const lastNavigationTime = ref(0);
const navigationDelay = 150; // 150ms entre chaque navigation

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
  // Gérer la navigation uniquement si le swiper a le focus
  if (!swiperHasFocus.value) return;

  // Throttle pour éviter une navigation trop rapide
  const now = Date.now();
  if (now - lastNavigationTime.value < navigationDelay) {
    return;
  }

  // Normaliser l'événement clavier pour la compatibilité TV
  const keyData = normalizeKeyboardEvent(event);

  // Gérer la navigation
  if (keyData.code === 'ArrowLeft' || keyData.keyCode === 37) {
    event.preventDefault();
    lastNavigationTime.value = now;
    navigateToPreviousSlide();
  } else if (keyData.code === 'ArrowRight' || keyData.keyCode === 39) {
    event.preventDefault();
    lastNavigationTime.value = now;
    navigateToNextSlide();
  } else if (keyData.isEnterKey || keyData.isSpaceKey) {
    event.preventDefault();
    if (currentSlideIndex.value < props.animes.length) {
      emit('select', props.animes[currentSlideIndex.value]);
    }
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

  // Utiliser l'API native de Swiper pour naviguer vers le slide
  swiperRef.value.swiper.slideTo(index, 300);
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
  // Quand le swiper perd le focus, réinitialiser l'état de focus
  swiperHasFocus.value = false;
  focusedIndex.value = -1;
};

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
      leaveFor, // Configuration pour permettre la navigation vers d'autres sections
      restrict: 'self-first',
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
