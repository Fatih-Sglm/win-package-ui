<template>
  <div class="container mx-auto p-6 space-y-12 pb-20">
    <!-- Hero / Search Section -->
    <section class="flex flex-col items-center py-12 text-center space-y-6">
      <div class="space-y-2">
        <h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {{ t('package.discover.title') }}
        </h1>
        <p class="text-xl text-muted-foreground max-w-[600px]">
          Find and install the best software for Windows effortlessly.
        </p>
      </div>

      <form @submit.prevent="handleSearch" class="relative w-full max-w-4xl group">
        <div class="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <div class="relative flex items-center gap-2 w-full">
          <div class="relative flex-1 group">
            <Search v-if="!isSearching" class="absolute left-5 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors top-1/2 -translate-y-1/2" />
            <Loader2 v-else class="absolute left-5 w-6 h-6 text-primary animate-spin top-1/2 -translate-y-1/2" />
            <Input 
              v-model="searchQuery"
              class="h-16 pl-14 pr-12 text-lg rounded-2xl border-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all bg-card/50 backdrop-blur-md shadow-xl w-full"
              :placeholder="t('package.filter.searchPlaceholder')"
            />
            <button v-if="searchQuery" type="button" @click="clearSearch" class="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors">
              <X class="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <Select v-model:model-value="selectedRemoteSource">
            <SelectTrigger class="w-[160px] h-16 rounded-2xl border-2 bg-card/50 backdrop-blur-md shadow-xl">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tümü (All)</SelectItem>
                <SelectItem :value="PackageSource.Winget">Winget</SelectItem>
                <SelectItem :value="PackageSource.Chocolatey">Chocolatey</SelectItem>
                <SelectItem :value="PackageSource.MsStore">MS Store</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button type="submit" size="lg" :disabled="isSearching" class="h-16 px-8 rounded-2xl shadow-xl shadow-primary/20 text-lg font-bold min-w-[120px]">
            {{ isSearching ? '...' : t('app.nav.search') }}
          </Button>
        </div>
      </form>
    </section>

    <!-- Search Results Section -->
    <section v-if="searchResults.length > 0" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div class="flex items-center justify-between mb-6">
          <div class="flex flex-col">
            <h2 class="text-2xl font-bold tracking-tight">Search Results</h2>
            <p class="text-sm text-muted-foreground">Showing top 5 results</p>
          </div>
          <Button variant="ghost" @click="clearSearch">Clear</Button>
       </div>
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            v-for="app in searchResults" 
            :key="app.id" 
            @click="navigateToDetail(app.id)"
            class="hover:border-primary transition-all cursor-pointer group overflow-hidden border-border/50"
          >
             <CardHeader class="flex flex-row items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-card border border-border/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                   📦
                </div>
                <div class="overflow-hidden">
                   <CardTitle class="text-base group-hover:text-primary transition-colors truncate">{{ app.name }}</CardTitle>
                   <CardDescription class="text-xs truncate">{{ app.publisher || 'Unknown Publisher' }}</CardDescription>
                </div>
             </CardHeader>
             <CardContent class="pb-6">
                <div class="flex justify-between items-center text-xs text-muted-foreground">
                   <Badge variant="outline" class="text-[10px] uppercase font-bold px-2">{{ app.source }}</Badge>
                   <span class="font-mono">{{ app.availableVersion || app.currentVersion }}</span>
                </div>
                <div class="mt-2 text-[10px] text-muted-foreground/60 truncate">ID: {{ app.id }}</div>
             </CardContent>
          </Card>
       </div>
    </section>

    <!-- Empty Search Results -->
    <section v-else-if="searchQuery && !isSearching && searchResults.length === 0" class="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
       <div class="space-y-3">
          <Search class="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
          <h3 class="text-xl font-semibold">No results for "{{ searchQuery }}"</h3>
          <p class="text-muted-foreground">Try searching for something else or check if Winget/Chocolatey is installed correctly.</p>
          <div class="flex justify-center gap-4 mt-6">
             <Button variant="outline" @click="clearSearch">Clear Search</Button>
             <Button variant="secondary" @click="handleSearch">Retry Search</Button>
          </div>
       </div>
    </section>

    <!-- Categories Grid -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold tracking-tight">{{ t('package.discover.categories') }}</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card v-for="cat in categories" :key="cat.id" 
              @click="toggleCategory(cat.id)"
              :class="[
                'group transition-all duration-300 cursor-pointer border-border/50',
                selectedCategory === cat.id ? 'bg-primary text-primary-foreground shadow-lg scale-105 border-primary' : 'hover:bg-muted/80'
              ]">
          <CardContent class="p-6 flex flex-col items-center gap-3 text-center">
            <div :class="[
              'p-3 rounded-full transition-colors',
              selectedCategory === cat.id ? 'bg-primary-foreground/20' : 'bg-muted group-hover:bg-primary-foreground/20'
            ]">
              <component :is="cat.icon" class="w-8 h-8" />
            </div>
            <span class="font-semibold">{{ t(`package.discover.cat_${cat.id}`) }}</span>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Filter Status Area -->
    <section v-if="selectedCategory" class="flex items-center justify-between bg-muted/50 p-4 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2">
       <div class="flex items-center gap-3">
          <Badge class="px-3 py-1 text-sm bg-primary">{{ t(`package.discover.cat_${selectedCategory}`) }}</Badge>
          <span class="text-muted-foreground text-sm">Showing apps in this category</span>
       </div>
       <Button variant="ghost" size="sm" @click="selectedCategory = null" class="text-destructive hover:bg-destructive/10">
          Clear Filter
       </Button>
    </section>

    <!-- Featured Apps -->
    <section>
      <div class="flex items-center gap-2 mb-6">
        <Star class="w-6 h-6 text-yellow-500 fill-yellow-500" />
        <h2 class="text-2xl font-bold tracking-tight">{{ t('package.discover.featured') }}</h2>
      </div>
      <div v-if="isFeaturedLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="i in 3" :key="i" class="border-border/50 overflow-hidden animate-pulse">
          <div class="h-32 bg-muted"></div>
          <CardHeader><div class="h-5 bg-muted rounded w-3/4"></div></CardHeader>
          <CardContent><div class="h-4 bg-muted rounded w-1/2"></div></CardContent>
        </Card>
      </div>
      <div v-else-if="featuredApps.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="app in featuredApps"
          :key="app.id"
          @click="navigateToDetail(app.id)"
          class="group overflow-hidden border-border/50 hover:border-primary transition-all shadow-sm hover:shadow-lg cursor-pointer"
        >
          <div class="h-32 bg-gradient-to-br from-primary/10 to-transparent group-hover:from-primary/20 transition-all p-6 flex justify-end">
            <div class="w-20 h-20 bg-card rounded-2xl shadow-md border border-border/50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              📦
            </div>
          </div>
          <CardHeader>
            <div class="flex justify-between items-start">
              <div class="overflow-hidden">
                <CardTitle class="text-xl group-hover:text-primary transition-colors truncate">{{ app.name }}</CardTitle>
                <CardDescription class="truncate">{{ app.publisher || app.id }}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{{ app.description || t('package.unknownVersion') }}</p>
            <div class="mt-4 flex items-center justify-between">
              <Badge variant="secondary" class="bg-muted text-muted-foreground font-mono text-xs">{{ app.currentVersion }}</Badge>
              <Button size="sm" class="rounded-full px-4">{{ t('package.install') }}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Popular Apps -->
    <section>
      <div class="flex items-center gap-2 mb-6">
        <TrendingUp class="w-6 h-6 text-blue-500" />
        <h2 class="text-2xl font-bold tracking-tight">{{ t('package.discover.popular') }}</h2>
      </div>
      <div v-if="isPopularLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card v-for="i in 8" :key="i" class="border-border/30 animate-pulse">
          <CardContent class="p-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-muted"></div>
            <div class="flex-1 space-y-2"><div class="h-4 bg-muted rounded w-3/4"></div><div class="h-3 bg-muted rounded w-1/2"></div></div>
          </CardContent>
        </Card>
      </div>
      <div v-else-if="popularApps.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card
          v-for="app in popularApps"
          :key="app.id"
          @click="navigateToDetail(app.id)"
          class="hover:bg-muted/50 transition-all cursor-pointer border-border/30 group"
        >
          <CardContent class="p-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-card border border-border/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📦
            </div>
            <div class="flex-1 overflow-hidden">
              <div class="font-bold truncate text-sm group-hover:text-primary transition-colors">{{ app.name }}</div>
              <div class="text-[10px] text-muted-foreground font-mono">{{ app.currentVersion }}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePackagesStore, useNotificationStore } from '@/stores'
import { PackageSource, CategoryType } from '@/models'
import {
  Search,
  Star,
  TrendingUp,
  Code,
  Video,
  Zap,
  Gamepad2,
  Wrench,
  Loader2,
  X
} from 'lucide-vue-next'
import type { Package } from '@/models'

const { t } = useI18n()
const router = useRouter()
const packagesStore = usePackagesStore()
const notificationStore = useNotificationStore()

const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<Package[]>([])
const selectedCategory = ref<string | null>(null)
const selectedRemoteSource = ref<PackageSource | 'all'>('all')

// Re-search when source changes
watch(selectedRemoteSource, () => {
  if (searchQuery.value.trim()) {
    handleSearch()
  }
})

const handleSearch = async () => {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      return
    }
    
    isSearching.value = true
    try {
      const results = await packagesStore.searchRemote(searchQuery.value, selectedRemoteSource.value)
      // Extra safety: Limit to top 5 as requested
      searchResults.value = results.slice(0, 5)
    } finally {
      isSearching.value = false
    }
}

const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
}

const toggleCategory = (catId: string) => {
  if (selectedCategory.value === catId) {
    selectedCategory.value = null
  } else {
    selectedCategory.value = catId
  }
}

const navigateToDetail = (appId: string) => {
    router.push({ name: 'package-detail', params: { id: appId } })
}

const categories = [
  { id: 'dev', icon: Code },
  { id: 'multimedia', icon: Video },
  { id: 'productivity', icon: Zap },
  { id: 'games', icon: Gamepad2 },
  { id: 'utilities', icon: Wrench },
]

// Curated app IDs - real metadata fetched from winget at runtime
const FEATURED_IDS = [
  'Mozilla.Firefox',
  'Discord.Discord',
  'Spotify.Spotify',
]

const POPULAR_IDS = [
  'VideoLAN.VLC',
  '7zip.7zip',
  'Google.Chrome',
  'OBSProject.OBSStudio',
  'Valve.Steam',
  'Git.Git',
  'OpenJS.NodeJS.LTS',
  'Docker.DockerDesktop',
]

// Map discover category IDs to CategoryType enum values
const categoryTypeMap: Record<string, CategoryType[]> = {
  dev: [CategoryType.Developer],
  multimedia: [CategoryType.Media, CategoryType.Communication],
  productivity: [CategoryType.Productivity, CategoryType.Browser],
  games: [CategoryType.Gaming],
  utilities: [CategoryType.Tools, CategoryType.Other],
}

const featuredAppsRaw = ref<Package[]>([])
const popularAppsRaw = ref<Package[]>([])
const isFeaturedLoading = ref(true)
const isPopularLoading = ref(true)

const featuredApps = computed(() => {
  if (!selectedCategory.value) return featuredAppsRaw.value
  const types = categoryTypeMap[selectedCategory.value]
  if (!types) return featuredAppsRaw.value
  return featuredAppsRaw.value.filter(app => types.includes(app.category))
})

const popularApps = computed(() => {
  if (!selectedCategory.value) return popularAppsRaw.value
  const types = categoryTypeMap[selectedCategory.value]
  if (!types) return popularAppsRaw.value
  return popularAppsRaw.value.filter(app => types.includes(app.category))
})

onMounted(async () => {
  const fetchFeatured = packagesStore.fetchMultiplePackageDetails(FEATURED_IDS)
    .then(results => { featuredAppsRaw.value = results })
    .catch(() => {})
    .finally(() => { isFeaturedLoading.value = false })

  const fetchPopular = packagesStore.fetchMultiplePackageDetails(POPULAR_IDS)
    .then(results => { popularAppsRaw.value = results })
    .catch(() => {})
    .finally(() => { isPopularLoading.value = false })

  await Promise.all([fetchFeatured, fetchPopular])
})

</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
