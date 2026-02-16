<template>
  <div class="min-h-screen bg-background flex text-foreground">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-border bg-card/50 flex flex-col fixed h-full z-50">
      <!-- App Header -->
      <div class="h-16 flex items-center px-6 border-b border-border">
        <Package class="w-6 h-6 text-primary mr-3" />
        <div>
          <h1 class="font-bold text-sm tracking-wide">Paket Yöneticisi</h1>
          <p class="text-[10px] text-muted-foreground">Windows Package Manager</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <router-link 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors"
          :class="[
            $route.path === item.path 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          ]"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.name }}
        </router-link>
      </nav>

      <!-- Bottom Actions -->
      <div class="p-4 border-t border-border">
        <div class="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
          <Info class="w-4 h-4" />
          <span>v0.1.0-alpha</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-64 min-h-screen flex flex-col">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  Package, 
  LayoutGrid, 
  Library, 
  Search, 
  Download, 
  Settings, 
  Info 
} from 'lucide-vue-next'

const { t } = useI18n()

const navItems = computed(() => [
  { name: t('app.nav.discover'), path: '/', icon: LayoutGrid },
  { name: t('app.nav.library'), path: '/library', icon: Library },
  { name: t('app.nav.downloads'), path: '/downloads', icon: Download },
  { name: t('app.nav.settings'), path: '/settings', icon: Settings },
])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
