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
            v-for="number in numbers"
            :key="number"
            ref="keyButtonRefs"
            v-focus
            v-focus-events="{
              'enter-up': () => onKeyPress(number),
              focused: () => setFocusedKey(number),
              unfocused: () => setFocusedKey(null),
            }"
            data-sn-up="@header"
            class="2xl h-8 w-8 flex-shrink-0 rounded-lg border text-xs font-semibold transition-all duration-200 focus:outline-none sm:h-10 sm:w-10 sm:text-base xl:text-lg 2xl:w-12"
            :class="getKeyClass(number)"
          >
            {{ number }}
          </button>
        </div>
      </div>

      <!-- Ligne 1: AZERTYUIOP -->
      <div class="flex justify-center">
        <div class="flex gap-1 lg:gap-2">
          <button
            v-for="letter in row1"
            :key="letter"
            ref="keyButtonRefs"
            v-focus
            v-focus-events="{
              'enter-up': () => onKeyPress(letter),
              focused: () => setFocusedKey(letter),
              unfocused: () => setFocusedKey(null),
            }"
            class="2xl h-8 w-8 flex-shrink-0 rounded-lg border text-xs font-semibold transition-all duration-200 focus:outline-none sm:h-10 sm:w-10 sm:text-base xl:text-lg 2xl:w-12"
            :class="getKeyClass(letter)"
          >
            {{ letter }}
          </button>
        </div>
      </div>

      <!-- Ligne 2: QSDFGHJKLM -->
      <div class="flex justify-center">
        <div class="flex gap-1 lg:gap-2">
          <button
            v-for="letter in row2"
            :key="letter"
            ref="keyButtonRefs"
            v-focus
            v-focus-events="{
              'enter-up': () => onKeyPress(letter),
              focused: () => setFocusedKey(letter),
              unfocused: () => setFocusedKey(null),
            }"
            class="2xl h-8 w-8 flex-shrink-0 rounded-lg border text-xs font-semibold transition-all duration-200 focus:outline-none sm:h-10 sm:w-10 sm:text-base xl:text-lg 2xl:w-12"
            :class="getKeyClass(letter)"
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
              v-for="letter in row3"
              :key="letter"
              ref="keyButtonRefs"
              v-focus
              v-focus-events="{
                'enter-up': () => onKeyPress(letter),
                focused: () => setFocusedKey(letter),
                unfocused: () => setFocusedKey(null),
              }"
              class="2xl h-8 w-8 flex-shrink-0 rounded-lg border text-xs font-semibold transition-all duration-200 focus:outline-none sm:h-10 sm:w-10 sm:text-base xl:text-lg 2xl:w-12"
              :class="getKeyClass(letter)"
            >
              {{ letter }}
            </button>
          </div>

          <!-- Backspace -->
          <button
            ref="backspaceButtonRef"
            v-focus
            v-focus-events="{
              'enter-up': () => onBackspace(),
              focused: () => setFocusedKey('BACKSPACE'),
              unfocused: () => setFocusedKey(null),
            }"
            class="2xl flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-200 focus:outline-none sm:h-10 sm:text-base lg:w-16 xl:w-20 xl:text-lg"
            :class="getKeyClass('BACKSPACE')"
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
            ref="clearButtonRef"
            v-focus
            v-focus-events="{
              'enter-up': () => onClear(),
              focused: () => setFocusedKey('CLEAR'),
              unfocused: () => setFocusedKey(null),
            }"
            class="2xl flex h-10 w-16 flex-shrink-0 items-center justify-center rounded-lg border text-base font-semibold transition-all duration-200 focus:outline-none xl:w-20 xl:text-lg"
            :class="getKeyClass('CLEAR')"
          >
            <PhTrash :size="18" class="xl:hidden" />
            <PhTrash :size="20" class="hidden xl:block" />
          </button>

          <!-- Espace -->
          <button
            ref="spaceButtonRef"
            v-focus
            v-focus-events="{
              'enter-up': () => onKeyPress(' '),
              focused: () => setFocusedKey('SPACE'),
              unfocused: () => setFocusedKey(null),
            }"
            class="2xl flex h-10 w-28 flex-shrink-0 items-center justify-center rounded-lg border text-base font-semibold transition-all duration-200 focus:outline-none xl:w-40 xl:text-lg"
            :class="getKeyClass('SPACE')"
          >
            ESPACE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
    up: 'header',
    right: 'results',
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
onMounted(() => {
  setTimeout(() => {
    const firstKey = keyButtonRefs.value[0];
    if (firstKey) {
      firstKey.focus();
    }
  }, 150);
});
</script>
