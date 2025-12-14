<template>
  <Toast />
  <div class="min-h-screen bg-background flex">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div class="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <!-- Left: Title & Badges -->
          <div class="flex flex-col">
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold text-primary tracking-tight">
                📦 {{ t('app.title') }}
              </h1>
              <Badge v-if="appStore.isAdmin" variant="outline" class="text-yellow-600 border-yellow-600 h-5 px-1.5 text-[10px]">
                🛡️ {{ t('app.admin') }}
              </Badge>
              <Badge v-else variant="outline" class="text-destructive border-destructive h-5 px-1.5 text-[10px]">
                ⚠️ {{ t('app.notAdmin') }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground hidden sm:block">
              {{ t('app.updatesAvailable', { count: packagesStore.totalUpdates }) }}
            </p>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-1 sm:gap-2">
            <!-- Interactive Mode Toggle -->
             <div class="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50 mr-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="interactiveMode" class="sr-only peer">
                  <div class="w-9 h-5 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:bg-primary transition-colors border-2 border-transparent"></div>
                  <div class="absolute top-0.5 left-0.5 bg-background h-4 w-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm ring-0"></div>
                </label>
                <Label for="interactive" class="text-xs font-medium cursor-pointer hidden sm:block" @click="interactiveMode = !interactiveMode">{{ t('app.interactiveMode') }}</Label>
              </div>

            <TooltipProvider>
              <!-- Install New -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="ghost" size="icon" @click="uiStore.openInstallModal()">
                    <Plus class="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{{ t('app.installNew') }}</p>
                </TooltipContent>
              </Tooltip>

              <!-- Refresh -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="ghost" size="icon" @click="packagesStore.fetchPackages()" :disabled="packagesStore.isLoading">
                    <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': packagesStore.isLoading }" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{{ packagesStore.isLoading ? t('app.refreshing') : t('app.refresh') }}</p>
                </TooltipContent>
              </Tooltip>

              <!-- Update All -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="ghost" size="icon" @click="handleUpdateAll" :disabled="packagesStore.isLoading || !packagesStore.hasUpdates">
                    <ArrowUp class="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{{ t('app.updateAll') }}</p>
                </TooltipContent>
              </Tooltip>

              <!-- Console -->
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="ghost" size="icon" @click="uiStore.toggleConsole()" :class="{ 'bg-accent': uiStore.consoleOpen }">
                    <Terminal class="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{{ uiStore.consoleOpen ? t('app.closeConsole') : t('app.console') }}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <!-- Divider -->
            <div class="w-px h-6 bg-border mx-1"></div>

            <!-- Settings Menu -->
            <SettingsMenu />
          </div>
        </div>
      </header>

      <!-- Source Tabs -->
      <div class="border-b bg-muted/50">
        <div class="container mx-auto px-4 sm:px-6 py-3">
          <div class="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <AppTab :active="packagesStore.activeSource === 'all'" @click="packagesStore.setFilter('source', 'all')">
              🌐 {{ t('package.source.all') }} ({{ packagesStore.getSourceCount('all') }})
            </AppTab>
            <AppTab :active="packagesStore.activeSource === PackageSource.Winget" @click="packagesStore.setFilter('source', PackageSource.Winget)">
              📦 {{ t('package.source.winget') }} ({{ packagesStore.getSourceCount(PackageSource.Winget) }})
            </AppTab>
            <AppTab :active="packagesStore.activeSource === PackageSource.Chocolatey" @click="packagesStore.setFilter('source', PackageSource.Chocolatey)">
              🍫 {{ t('package.source.chocolatey') }} ({{ packagesStore.getSourceCount(PackageSource.Chocolatey) }})
            </AppTab>
            <AppTab :active="packagesStore.activeSource === PackageSource.MsStore" @click="packagesStore.setFilter('source', PackageSource.MsStore)">
              🏬 {{ t('package.source.msstore') }} ({{ packagesStore.getSourceCount(PackageSource.MsStore) }})
            </AppTab>
          </div>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="border-b bg-card">
        <div class="container mx-auto px-4 sm:px-6 py-3">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="packagesStore.showOnlyUpdates" class="sr-only peer">
                <div class="w-9 h-5 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:bg-primary transition-colors border-2 border-transparent"></div>
                <div class="absolute top-0.5 left-0.5 bg-background h-4 w-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm ring-0"></div>
              </label>
              <Label class="cursor-pointer" @click="packagesStore.showOnlyUpdates = !packagesStore.showOnlyUpdates">{{ t('package.filter.updatesOnly') }}</Label>
            </div>
          </div>
          <div class="flex gap-2 flex-wrap overflow-x-auto pb-2 sm:pb-0">
            <AppTab :active="packagesStore.activeCategory === 'all'" @click="packagesStore.setFilter('category', 'all')">
              📋 {{ t('package.category.all') }} ({{ totalCategoryCount }})
            </AppTab>
            <AppTab 
              v-for="cat in packagesStore.availableCategories"
              :key="cat"
              :active="packagesStore.activeCategory === cat"
              @click="packagesStore.setFilter('category', cat)"
            >
              {{ getCategoryIcon(cat) }} {{ cat }} ({{ packagesStore.getCategoryCount(cat) }})
            </AppTab>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="container mx-auto px-4 sm:px-6 py-6 flex-1">
        <!-- Search Bar -->
        <div class="mb-6 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            :model-value="packagesStore.searchQuery"
            @update:model-value="packagesStore.setFilter('search', $event)"
            :placeholder="t('package.filter.searchPlaceholder')"
            class="pl-10 pr-10"
          />
          <button
            v-if="packagesStore.searchQuery"
            @click="packagesStore.setFilter('search', '')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <LoadingSpinner v-if="packagesStore.isLoading" :message="t('app.refreshing')" />
        
        <div v-else>
          <EmptyState v-if="!packagesStore.hasPackages" />

          <div v-else-if="packagesStore.filteredPackages.length === 0" class="text-center py-16">
            <Card class="max-w-md mx-auto">
              <CardContent class="pt-6">
                <Search class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 class="text-xl font-semibold mb-2">{{ t('package.filter.noResults') }}</h3>
                <p class="text-muted-foreground mb-4">{{ t('package.filter.noResultsDesc', { query: packagesStore.searchQuery }) }}</p>
                <Button @click="packagesStore.setFilter('search', '')">{{ t('package.filter.clearSearch') }}</Button>
              </CardContent>
            </Card>
          </div>

          <div v-else>
            <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p class="text-sm text-muted-foreground">{{ t('package.filter.foundCount', { count: packagesStore.filteredPackages.length }) }}</p>
              <div class="flex gap-2 items-center">
                <Label>{{ t('package.filter.itemsPerPage') }}:</Label>
                <Select :model-value="String(uiStore.itemsPerPage)" @update:model-value="uiStore.setItemsPerPage(Number($event))">
                  <SelectTrigger class="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="grid gap-4 mb-8">
              <PackageCard 
                v-for="pkg in paginatedPackages"
                :key="pkg.id"
                :pkg="pkg"
              />
            </div>

            <AppPagination />
          </div>
        </div>
      </main>

      <BulkUpdateProgress />
      <InstallModal />
      <ErrorModal />
    </div>

    <!-- Console Panel -->
    <transition name="slide-left">
      <div v-if="uiStore.consoleOpen" class="w-96 bg-zinc-900 text-zinc-100 border-l flex flex-col">
        <div class="bg-zinc-800 px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Terminal class="w-4 h-4" />
            <span class="text-sm font-medium">{{ t('app.console') }}</span>
            <Badge variant="secondary" class="text-xs">{{ uiStore.consoleLogs.length }}</Badge>
          </div>
          <div class="flex gap-2">
            <Button variant="ghost" size="icon" class="h-6 w-6" @click="uiStore.clearConsole()">
              <Trash2 class="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" class="h-6 w-6" @click="uiStore.toggleConsole()">
              <X class="w-3 h-3" />
            </Button>
          </div>
        </div>

        <ScrollArea class="flex-1 p-4">
          <div class="space-y-1 font-mono text-xs">
            <div
              v-for="(log, index) in uiStore.consoleLogs"
              :key="index"
              class="py-1 px-2 rounded"
              :class="{
                'text-red-400': log.type === 'error',
                'text-yellow-400': log.type === 'warn',
                'text-blue-400': log.type === 'info',
                'text-zinc-300': log.type === 'log'
              }"
            >
              <span class="text-zinc-500">[{{ log.timestamp }}]</span>
              <span class="ml-2">{{ log.message }}</span>
            </div>
            <div v-if="uiStore.consoleLogs.length === 0" class="text-center text-zinc-500 py-8">
              {{ t('app.consoleEmpty') }}
            </div>
          </div>
        </ScrollArea>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useTitle } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Plus, RefreshCw, ArrowUp, Terminal, Search, X, Trash2 } from 'lucide-vue-next'

// Common components
import { AppTab, LoadingSpinner, EmptyState, SettingsMenu } from '@/components/common'

// Package components
import { PackageCard, AppPagination, BulkUpdateProgress } from '@/components/package'

// Modal components
import { InstallModal, ErrorModal } from '@/components/modals'

// Toast notification
import { Toast } from '@/components/ui/toast'

// Stores
import { usePackagesStore, useAppStore, useUIStore } from '@/stores'

// Models
import { PackageSource, CategoryType, getCategoryIcon as getCatIcon } from '@/models'

const { t, locale } = useI18n()
const packagesStore = usePackagesStore()
const appStore = useAppStore()
const uiStore = useUIStore()

const { interactiveMode } = storeToRefs(packagesStore)

// Sync locale with store
watch(() => appStore.locale, (newLocale) => {
  locale.value = newLocale
})

// Set initial locale
locale.value = appStore.locale

// Dynamic Window Title
useTitle(computed(() => t('app.title')))

// Computed
const totalCategoryCount = computed(() => {
  let filtered = packagesStore.showOnlyUpdates
    ? packagesStore.packages.filter(p => p.hasUpdate)
    : packagesStore.packages

  if (packagesStore.searchQuery.trim()) {
    const query = packagesStore.searchQuery.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query)
    )
  }

  if (packagesStore.activeSource !== 'all') {
    filtered = filtered.filter(p => p.source === packagesStore.activeSource)
  }

  return filtered.length
})

const paginatedPackages = computed(() => {
  const start = (uiStore.currentPage - 1) * uiStore.itemsPerPage
  return packagesStore.filteredPackages.slice(start, start + uiStore.itemsPerPage)
})

// Watchers - reset page on filter changes
watch(() => packagesStore.activeSource, () => uiStore.resetPage())
watch(() => packagesStore.activeCategory, () => uiStore.resetPage())
watch(() => packagesStore.showOnlyUpdates, () => uiStore.resetPage())
watch(() => packagesStore.searchQuery, () => uiStore.resetPage())

// Helpers
function getCategoryIcon(category: CategoryType): string {
  return getCatIcon(category)
}

// Handlers
async function handleUpdateAll() {
  const count = packagesStore.filteredPackages.filter(p => p.hasUpdate).length
  if (!confirm(t('modal.confirm.updateAll', { count }))) return
  
  await packagesStore.updateAllPackages()
}

// Lifecycle
onMounted(async () => {
  uiStore.setupConsoleInterceptors()
  uiStore.addConsoleLog('info', '🚀 ' + t('app.consoleStart'))
  
  await appStore.checkAdminStatus()
  appStore.initSystemThemeListener()
  
  packagesStore.fetchPackages()
  
  // Force UI sync for interactive mode
  packagesStore.interactiveMode = false
  await nextTick()
  packagesStore.interactiveMode = true
})
</script>

<style>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
