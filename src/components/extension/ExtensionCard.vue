<template>
  <div class="extension-card">
    <div class="extension-header">
      <img
        v-if="extension.icon"
        :src="extension.icon"
        :alt="extension.name"
        class="extension-icon"
      />
      <div v-else class="extension-icon-placeholder">
        {{ extension.name.charAt(0).toUpperCase() }}
      </div>
      <div class="extension-info">
        <h3>{{ extension.name }}</h3>
        <p class="extension-version">v{{ extension.version }}</p>
        <p class="extension-language">{{ extension.language }}</p>
      </div>
      <div class="extension-status">
        <span class="status-badge" :class="extension.status">
          {{
            extension.status === 'active'
              ? 'Actif'
              : extension.status === 'installed'
                ? 'Installé'
                : 'Disponible'
          }}
        </span>
      </div>
    </div>

    <div class="extension-description">
      <p>{{ extension.description }}</p>
    </div>

    <div class="extension-actions">
      <button
        v-if="extension.status === 'available'"
        class="action-btn install"
        @click="$emit('install', extension)"
      >
        Installer
      </button>
      <button
        v-if="extension.status === 'installed'"
        class="action-btn activate"
        @click="$emit('activate', extension)"
      >
        Activer
      </button>
      <button
        v-if="extension.status === 'active'"
        class="action-btn test"
        @click="$emit('test', extension)"
      >
        Tester
      </button>
      <button
        v-if="extension.status !== 'available'"
        class="action-btn remove"
        @click="$emit('remove', extension)"
      >
        Supprimer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Extension {
  id: string;
  name: string;
  version: string;
  language: string;
  description: string;
  icon?: string;
  status: 'available' | 'installed' | 'active';
}

interface Props {
  extension: Extension;
}

interface Emits {
  (e: 'install', extension: Extension): void;
  (e: 'activate', extension: Extension): void;
  (e: 'test', extension: Extension): void;
  (e: 'remove', extension: Extension): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
.extension-card {
  background: rgba(31, 41, 55, 0.8);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.5);
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.extension-card:hover,
.extension-card:focus-within {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  border-color: rgba(99, 102, 241, 0.6);
  background: rgba(31, 41, 55, 0.9);
}

.extension-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.extension-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.extension-icon-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.extension-info {
  flex: 1;
}

.extension-info h3 {
  margin: 0 0 0.25rem 0;
  color: #f9fafb;
  font-size: 1.1rem;
  font-weight: 600;
}

.extension-version {
  margin: 0;
  color: #d1d5db;
  font-size: 0.9rem;
}

.extension-language {
  margin: 0.25rem 0 0 0;
  color: #a78bfa;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.extension-status {
  align-self: flex-start;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.available {
  background: rgba(55, 65, 81, 0.8);
  color: #d1d5db;
  border: 1px solid rgba(75, 85, 99, 0.5);
}

.status-badge.installed {
  background: rgba(217, 119, 6, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(217, 119, 6, 0.3);
}

.status-badge.active {
  background: rgba(5, 150, 105, 0.2);
  color: #34d399;
  border: 1px solid rgba(5, 150, 105, 0.3);
}

.extension-description {
  margin-bottom: 1rem;
}

.extension-description p {
  margin: 0;
  color: #d1d5db;
  font-size: 0.9rem;
  line-height: 1.4;
}

.extension-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.action-btn:focus {
  outline: 2px solid #a78bfa;
  outline-offset: 2px;
}

.action-btn.install {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

.action-btn.install:hover {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
}

.action-btn.activate {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.action-btn.activate:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
}

.action-btn.test {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

.action-btn.test:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
}

.action-btn.remove {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.action-btn.remove:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
}
</style>
