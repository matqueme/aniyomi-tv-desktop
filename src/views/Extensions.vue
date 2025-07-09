<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="min-h-screen w-full bg-transparent pt-16">
    <NavigationBar />

    <main class="px-6 pb-12 pt-12">
      <div class="mx-auto max-w-4xl">
        <!-- En-tête des extensions -->
        <div class="mb-8 flex items-center justify-between">
          <h2 class="text-3xl font-bold text-slate-200">
            Gestionnaire d'Extensions
          </h2>
          <div class="flex gap-3">
            <div
              class="rounded-lg border border-slate-600/40 bg-slate-800/60 px-4 py-2 backdrop-blur-md"
            >
              <span class="text-sm font-medium text-slate-300">
                Total: {{ extensionsStore.extensionCount }}
              </span>
            </div>
            <div
              class="rounded-lg border border-indigo-500/40 bg-indigo-500/20 px-4 py-2 backdrop-blur-md"
            >
              <span class="text-sm font-medium text-indigo-200">
                Activées: {{ extensionsStore.enabledExtensions.length }}
              </span>
            </div>
          </div>
        </div>

        <!-- État de chargement -->
        <div
          v-if="extensionsStore.isLoading"
          class="flex min-h-96 items-center justify-center"
        >
          <div class="text-center">
            <LoadingSpinner />
            <p class="mt-4 text-slate-300">Initialisation des extensions...</p>
          </div>
        </div>

        <!-- Erreur -->
        <div
          v-if="extensionsStore.error"
          class="flex min-h-96 items-center justify-center"
        >
          <div
            class="mx-6 max-w-md rounded-lg border border-red-600/40 bg-red-900/50 p-6 text-center backdrop-blur-md"
          >
            <h3 class="mb-3 text-xl font-bold text-red-200">
              Erreur d'initialisation
            </h3>
            <p class="mb-4 text-red-300">{{ extensionsStore.error }}</p>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-white transition-all duration-300 hover:scale-105 hover:bg-red-700"
              @click="retryInitialization"
            >
              Réessayer
            </button>
          </div>
        </div>

        <!-- Liste des extensions -->
        <div
          v-if="!extensionsStore.isLoading && !extensionsStore.error"
          class="space-y-4"
        >
          <div
            v-for="extension in extensionsStore.availableExtensions"
            :key="extension.key"
            class="group rounded-xl border border-slate-600/40 bg-slate-800/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-indigo-500/10"
            :class="{ 'opacity-60': !extension.isEnabled }"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="mb-2 flex items-center gap-3">
                  <h3 class="text-xl font-semibold text-slate-200">
                    {{ extension.name }}
                  </h3>
                  <span
                    class="rounded-md bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-200"
                  >
                    v{{ extension.version }}
                  </span>
                </div>
                <p class="text-sm text-slate-400">{{ extension.baseUrl }}</p>
              </div>

              <!-- Toggle Switch -->
              <div class="ml-6">
                <label class="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    :checked="extension.isEnabled"
                    class="peer sr-only"
                    @change="
                      toggleExtension(
                        extension.key,
                        ($event.target as HTMLInputElement)?.checked ?? false
                      )
                    "
                  />
                  <div
                    class="peer h-6 w-11 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300/20"
                  ></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Message si aucune extension -->
          <div
            v-if="extensionsStore.extensionCount === 0"
            class="flex min-h-96 items-center justify-center"
          >
            <div class="text-center">
              <div class="mb-4 text-6xl">🧩</div>
              <h3 class="mb-2 text-xl font-semibold text-slate-300">
                Aucune extension disponible
              </h3>
              <p class="mb-6 text-slate-400">
                Initialisez les extensions pour commencer
              </p>
              <button
                class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25"
                @click="initializeExtensions"
              >
                Initialiser les extensions
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useExtensionsStore } from '@/stores/extensions';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import NavigationBar from '@/components/ui/NavigationBar.vue';

const extensionsStore = useExtensionsStore();

const toggleExtension = (extensionKey: string, enabled: boolean) => {
  const success = extensionsStore.toggleExtension(extensionKey, enabled);
  if (!success) {
    console.error(
      `Impossible de modifier l'état de l'extension ${extensionKey}`
    );
  }
};

const initializeExtensions = async () => {
  await extensionsStore.initializeExtensions();
};

const retryInitialization = async () => {
  extensionsStore.setError(null);
  await initializeExtensions();
};

onMounted(async () => {
  if (!extensionsStore.initialized) {
    await initializeExtensions();
  }
});
</script>
