<template>
  <div
    v-focus-section:keyboard.default="keyboardSectionConfig"
    class="mx-auto w-full max-w-5xl px-2"
  >
    <div class="space-y-1 lg:space-y-3">
      <!-- Ligne 0: Chiffres 1234567890 -->
      <div class="flex justify-center">
        <div class="flex gap-1 lg:gap-2">
          <button
            v-for="(number, index) in numbers"
            :id="`key-${number}`"
            :key="number"
            ref="keyButtonRefs"
            v-focus
            v-focus-events="{
              'enter-up': () => onKeyPress(number),
              focused: () => setFocusedKey(number),
              unfocused: () => setFocusedKey(null),
            }"
            :data-sn-down="getNavigationTarget('numbers', index, 'down')"
            class="2xl focus-none h-8 w-8 flex-shrink-0 rounded-lg border text-xs font-semibold transition-all duration-200 sm:h-10 sm:w-10 sm:text-base xl:text-lg 2xl:w-12"
            :class="getKeyClass(number)"
            @click="() => onKeyPress(number)"
          >
            {{ number }}
          </button>
        </div>
      </div>

      <!-- Ligne 1: AZERTYUIOP -->
      <div class="flex justify-center">
        <div class="flex gap-1 lg:gap-2">
          <button
            v-for="(letter, index) in row1"
            :id="`key-${letter}`"
            :key="letter"
            ref="keyButtonRefs"
            v-focus
            v-focus-events="{
              'enter-up': () => onKeyPress(letter),
              focused: () => setFocusedKey(letter),
              unfocused: () => setFocusedKey(null),
            }"
            :data-sn-down="getNavigationTarget('row1', index, 'down')"
            :data-sn-up="getNavigationTarget('row1', index, 'up')"
            class="2xl focus-none h-8 w-8 flex-shrink-0 rounded-lg border text-xs font-semibold transition-all duration-200 sm:h-10 sm:w-10 sm:text-base xl:text-lg 2xl:w-12"
            :class="getKeyClass(letter)"
            @click="() => onKeyPress(letter)"
          >
            {{ letter }}
          </button>
        </div>
      </div>

      <!-- Ligne 2: QSDFGHJKLM -->
      <div class="flex justify-center">
        <div class="flex gap-1 lg:gap-2">
          <button
            v-for="(letter, index) in row2"
            :id="`key-${letter}`"
            :key="letter"
            ref="keyButtonRefs"
            v-focus
            v-focus-events="{
              'enter-up': () => onKeyPress(letter),
              focused: () => setFocusedKey(letter),
              unfocused: () => setFocusedKey(null),
            }"
            :data-sn-down="getNavigationTarget('row2', index, 'down')"
            :data-sn-up="getNavigationTarget('row2', index, 'up')"
            class="2xl focus-none h-8 w-8 flex-shrink-0 rounded-lg border text-xs font-semibold transition-all duration-200 sm:h-10 sm:w-10 sm:text-base xl:text-lg 2xl:w-12"
            :class="getKeyClass(letter)"
            @click="() => onKeyPress(letter)"
          >
            {{ letter }}
          </button>
        </div>
      </div>

      <!-- Ligne 3: WXCVBN + Backspace -->
      <div class="flex justify-center">
        <div class="flex items-center gap-1 lg:gap-3">
          <!-- Groupe des lettres WXCVBN -->
          <div class="flex gap-1 lg:gap-2">
            <button
              v-for="(letter, index) in row3"
              :id="`key-${letter}`"
              :key="letter"
              ref="keyButtonRefs"
              v-focus
              v-focus-events="{
                'enter-up': () => onKeyPress(letter),
                focused: () => setFocusedKey(letter),
                unfocused: () => setFocusedKey(null),
              }"
              :data-sn-down="getNavigationTarget('row3', index, 'down')"
              :data-sn-up="getNavigationTarget('row3', index, 'up')"
              class="2xl focus-none h-8 w-8 flex-shrink-0 rounded-lg border text-xs font-semibold transition-all duration-200 sm:h-10 sm:w-10 sm:text-base xl:text-lg 2xl:w-12"
              :class="getKeyClass(letter)"
              @click="() => onKeyPress(letter)"
            >
              {{ letter }}
            </button>
          </div>

          <!-- Backspace -->
          <button
            id="key-BACKSPACE"
            ref="backspaceButtonRef"
            v-focus
            v-focus-events="{
              'enter-up': () => onBackspace(),
              focused: () => setFocusedKey('BACKSPACE'),
              unfocused: () => setFocusedKey(null),
            }"
            data-sn-down="#key-SPACE"
            data-sn-up="#key-K"
            class="2xl focus-none flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-200 sm:h-10 sm:text-base lg:w-16 xl:w-20 xl:text-lg"
            :class="getKeyClass('BACKSPACE')"
            @click="onBackspace"
          >
            <PhBackspace :size="12" class="lg:hidden" />
            <PhBackspace :size="18" class="hidden lg:block xl:hidden" />
            <PhBackspace :size="20" class="hidden xl:block" />
          </button>
        </div>
      </div>

      <!-- Ligne 4: Espace et Clear -->
      <div class="flex justify-center">
        <div class="flex items-center gap-2">
          <!-- Clear -->
          <button
            id="key-CLEAR"
            ref="clearButtonRef"
            v-focus
            v-focus-events="{
              'enter-up': () => onClear(),
              focused: () => setFocusedKey('CLEAR'),
              unfocused: () => setFocusedKey(null),
            }"
            data-sn-up="#key-X"
            class="2xl focus-none flex h-10 w-16 flex-shrink-0 items-center justify-center rounded-lg border text-base font-semibold transition-all duration-200 xl:w-20 xl:text-lg"
            :class="getKeyClass('CLEAR')"
            @click="onClear"
          >
            <PhTrash :size="18" class="xl:hidden" />
            <PhTrash :size="20" class="hidden xl:block" />
          </button>

          <!-- Espace -->
          <button
            id="key-SPACE"
            ref="spaceButtonRef"
            v-focus
            v-focus-events="{
              'enter-up': () => onKeyPress(' '),
              focused: () => setFocusedKey('SPACE'),
              unfocused: () => setFocusedKey(null),
            }"
            data-sn-up="#key-B"
            class="2xl focus-none flex h-10 w-28 flex-shrink-0 items-center justify-center rounded-lg border text-base font-semibold transition-all duration-200 xl:w-40 xl:text-lg"
            :class="getKeyClass('SPACE')"
            @click="() => onKeyPress(' ')"
          >
            ESPACE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { PhBackspace, PhTrash } from '@phosphor-icons/vue';

// Props
interface Props {
  modelValue: string;
}

const props = defineProps<Props>();

// Émissions
const emit = defineEmits<{
  'update:modelValue': [value: string];
  keyPress: [key: string];
  backspace: [];
  clear: [];
}>();

// Layout du clavier AZERTY avec chiffres
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const row1 = ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const row2 = ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];
const row3 = ['W', 'X', 'C', 'V', 'B', 'N'];

// Refs
const keyButtonRefs = ref<HTMLButtonElement[]>([]);
const spaceButtonRef = ref<HTMLButtonElement>();
const backspaceButtonRef = ref<HTMLButtonElement>();
const clearButtonRef = ref<HTMLButtonElement>();

// État
const focusedKey = ref<string | null>(null);

// Configuration de la section spatiale
const keyboardSectionConfig = ref({
  enterTo: 'default-element',
  leaveFor: {
    up: '@header',
    right: '@results',
  },
});

// Méthodes
const setFocusedKey = (key: string | null) => {
  focusedKey.value = key;
};

const getKeyClass = (key: string) => {
  const isFocused = focusedKey.value === key;
  return [
    isFocused
      ? 'scale-[1.05] border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/20'
      : 'border-slate-600/40 bg-slate-800/60 text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/10',
  ];
};

/**
 * Obtenir la cible de navigation pour les touches du clavier virtuel en bout de ligne.
 * @param row - La ligne du clavier (par exemple, 'row2' ou 'row3')
 * @param index - L'index de la touche dans la ligne
 * @param direction - La direction de navigation ('down' ou 'up')
 * @returns L'ID de la touche cible ou undefined si aucune cible n'est définie
 */
const getNavigationTarget = (row: string, index: number, direction: string) => {
  // Configuration pour la deuxième ligne (QSDFGHJKLM)
  if (row === 'row2') {
    if (direction === 'down') {
      if (index === 0) return `#key-${row3[0]}`; // "Q" vers "W"
      if (index === row2.length - 1) return '#key-BACKSPACE'; // "M" vers Backspace
    }
  }
  // Configuration pour la troisième ligne (WXCVBN)
  else if (row === 'row3') {
    if (direction === 'down') {
      if (index === 0) return '#key-CLEAR'; // "W" vers Clear
      if (index === 1) return '#key-CLEAR'; // "X" vers Clear
      if (index === 2) return '#key-CLEAR'; // "C" vers Clear
      if (index === row3.length - 1) return '#key-SPACE'; // "N" vers Espace
      if (index === row3.length - 3) return '#key-SPACE'; // "V" vers Espace
    }
  }
  return undefined;
};

const onKeyPress = (key: string) => {
  const newValue = props.modelValue + key;
  emit('update:modelValue', newValue);
  emit('keyPress', key);
};

const onBackspace = () => {
  if (props.modelValue.length > 0) {
    const newValue = props.modelValue.slice(0, -1);
    emit('update:modelValue', newValue);
    emit('backspace');
  }
};

const onClear = () => {
  emit('update:modelValue', '');
  emit('clear');
};

// Focus automatique sur A au montage
onMounted(async () => {
  await nextTick();
  const firstKey = keyButtonRefs.value[0];
  if (firstKey) firstKey.focus();
});
</script>
