<template>
  <div class="flex flex-col h-full">
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
</template>

<script setup lang="ts">
import { computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-vue-next'

// Common components
import { AppTab, LoadingSpinner, EmptyState } from '@/components/common'

// Package components
import { PackageCard, AppPagination, BulkUpdateProgress } from '@/components/package'

// Modal components
import { InstallModal, ErrorModal } from '@/components/modals'

// Stores
import { usePackagesStore, useAppStore, useUIStore } from '@/stores'

// Models
import { PackageSource, CategoryType, getCategoryIcon as getCatIcon } from '@/models'

const { t } = useI18n()
const packagesStore = usePackagesStore()
const appStore = useAppStore()
const uiStore = useUIStore()

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

// Lifecycle
onMounted(async () => {
  // If no packages, fetch them
  if (packagesStore.packages.length === 0) {
    packagesStore.fetchPackages()
  }
})
</script>
