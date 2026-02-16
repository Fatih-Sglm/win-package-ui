<template>
  <div class="container mx-auto p-6 space-y-8 pb-32">
    <!-- Breadcrumbs / Back -->
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <Button variant="ghost" size="sm" @click="router.back()" class="gap-2">
        <ArrowLeft class="w-4 h-4" />
        {{ t('app.nav.back') }}
      </Button>
    </div>

    <div v-if="!pkg" class="flex items-center justify-center py-20">
      <Loader2 class="w-10 h-10 animate-spin text-primary" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <!-- Left: Info & Actions -->
        <div class="lg:col-span-2 space-y-8">
          <div class="flex flex-col md:flex-row gap-8 items-start">
            <div class="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] bg-card border border-border/50 shadow-2xl flex items-center justify-center text-7xl select-none shrink-0">
               {{ icon }}
            </div>
            <div class="space-y-4 pt-2">
              <div class="space-y-1">
                <h1 class="text-4xl font-bold tracking-tight">{{ pkg.name }}</h1>
                <p class="text-xl text-muted-foreground">{{ pkg.publisher || pkg.id }}</p>
              </div>
              
              <div class="flex flex-wrap gap-2">
                 <Badge variant="outline" class="px-3 py-1">{{ pkg.source }}</Badge>
                 <Badge v-if="pkg.category" variant="secondary" class="px-3 py-1">{{ pkg.category }}</Badge>
                 <Badge v-if="isInstalled && !pkg.hasUpdate" class="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                    <Check class="w-3 h-3 mr-1" /> {{ t('package.upToDate') }}
                 </Badge>
                 <Badge v-else-if="isInstalled && pkg.hasUpdate" class="bg-orange-500/10 text-orange-500 border-orange-500/20 px-3 py-1">
                    <ArrowUpCircle class="w-3 h-3 mr-1" /> {{ t('package.detail.updateAvailable') }}
                 </Badge>
              </div>

              <div class="flex flex-wrap gap-4 pt-4">
                 <Button v-if="!isInstalled" size="lg" class="px-10 rounded-full text-lg h-14" @click="handleInstall">
                    {{ t('package.install') }}
                 </Button>
                 <template v-else>
                    <Button v-if="pkg.hasUpdate" size="lg" class="px-10 rounded-full text-lg h-14" @click="handleUpdate">
                       {{ t('package.update') }}
                    </Button>
                    <Button size="lg" variant="outline" class="px-10 rounded-full text-lg h-14 text-destructive border-destructive/20 hover:bg-destructive/10" @click="handleUninstall">
                       {{ t('package.uninstall') }}
                    </Button>
                 </template>
                 <Button @click="handleShare" variant="ghost" size="icon" class="h-14 w-14 rounded-full border border-border/50">
                    <Share2 class="w-6 h-6" />
                 </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div class="space-y-4">
            <h2 class="text-2xl font-bold">{{ t('package.description') }}</h2>
            <p class="text-muted-foreground text-lg leading-relaxed">
               {{ pkg.description || 'No description available for this package.' }}
            </p>
          </div>

        </div>

        <!-- Right: Metadata & Versions -->
        <div class="space-y-8">
           <Card class="border-border/50 shadow-lg p-6 space-y-6">
              <h3 class="font-bold text-lg">{{ t('package.detail.details') }}</h3>
              
              <div class="space-y-4">
                 <div class="flex justify-between items-center text-sm">
                    <span class="text-muted-foreground">{{ t('package.version') }}</span>
                    <span class="font-mono">{{ pkg.currentVersion || pkg.availableVersion || t('package.unknownVersion') }}</span>
                 </div>
                 <div v-if="pkg.id" class="flex justify-between items-center text-sm">
                    <span class="text-muted-foreground">{{ t('package.detail.packageId') }}</span>
                    <span class="font-mono text-[10px]">{{ pkg.id }}</span>
                 </div>
                 <div v-if="pkg.source" class="flex justify-between items-center text-sm">
                    <span class="text-muted-foreground">Source</span>
                    <span class="capitalize">{{ pkg.source }}</span>
                 </div>
              </div>

              <Separator />

              <div v-if="availableVersions.length > 0" class="space-y-3">
                 <Label class="text-muted-foreground text-xs uppercase tracking-widest font-bold">{{ t('package.detail.selectVersion') }}</Label>
                 <Select v-model="selectedVersion">
                    <SelectTrigger class="w-full rounded-xl">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem v-for="(ver, i) in availableVersions" :key="ver" :value="ver">
                          {{ ver }}{{ i === 0 ? ` (${t('package.detail.versionLatest')})` : '' }}{{ ver === installedVersion && isInstalled ? ` (${t('package.detail.versionInstalled')})` : '' }}
                       </SelectItem>
                    </SelectContent>
                 </Select>
                 <Button
                    v-if="showVersionAction"
                    class="w-full rounded-xl"
                    :disabled="isInstallingVersion"
                    @click="handleInstallVersion"
                 >
                    <Loader2 v-if="isInstallingVersion" class="w-4 h-4 mr-2 animate-spin" />
                    {{ isInstallingVersion
                       ? t('package.detail.installingVersion')
                       : isInstalled
                         ? t('package.detail.switchVersion')
                         : t('package.detail.installVersion')
                    }}
                 </Button>
              </div>
              <div v-else-if="isLoadingVersions" class="space-y-2">
                 <Label class="text-muted-foreground text-xs uppercase tracking-widest font-bold">{{ t('package.detail.selectVersion') }}</Label>
                 <div class="h-10 bg-muted rounded-xl animate-pulse"></div>
              </div>
           </Card>

           <Card class="bg-primary/5 border-primary/10 p-6 space-y-4">
              <div class="flex items-center gap-3 text-primary">
                 <Info class="w-5 h-5" />
                 <h3 class="font-bold">{{ t('package.detail.sysImpact') }}</h3>
              </div>
              <p class="text-xs text-muted-foreground">
                 {{ t('package.detail.sysImpactDesc') }}
              </p>
           </Card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Loader2,
  Info,
  Check,
  Share2,
  ArrowUpCircle
} from 'lucide-vue-next'
import { usePackagesStore } from '@/stores'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const { t } = useI18n()
const packagesStore = usePackagesStore()

const pkg = ref<any>(null)
const selectedVersion = ref('')
const availableVersions = ref<string[]>([])
const isLoadingVersions = ref(false)
const isInstallingVersion = ref(false)

const isInstalled = computed(() => {
  if (!pkg.value || !packagesStore.packages) return false
  return packagesStore.packages.some((p: any) => p.id === pkg.value.id)
})

const installedVersion = computed(() => {
  if (!pkg.value) return ''
  return pkg.value.currentVersion || pkg.value.availableVersion || ''
})

const showVersionAction = computed(() => {
  if (!selectedVersion.value || availableVersions.value.length === 0) return false
  // Show button if selected version differs from installed version, or if not installed at all
  if (!isInstalled.value) return true
  return selectedVersion.value !== installedVersion.value
})

const icon = computed(() => '📦')

onMounted(async () => {
    // If store is empty, it might be a fresh load on detail page
    if (packagesStore.packages.length === 0) {
        await packagesStore.fetchPackages()
    }

    // Try to find in installed packages first
    const found = (packagesStore.packages || []).find((p: any) => p.id === props.id)

    // Always fetch detailed info from winget show (description, publisher etc.)
    const details = await packagesStore.fetchPackageDetails(props.id)

    if (found) {
        // Merge installed data with detailed info
        pkg.value = {
            ...found,
            description: found.description || details?.description,
            publisher: found.publisher || details?.publisher,
        }
        selectedVersion.value = found.currentVersion || found.availableVersion || ''
    } else if (details) {
        pkg.value = details
        selectedVersion.value = details.currentVersion || details.availableVersion || ''
    } else {
        // No results at all - show minimal info
        pkg.value = {
            id: props.id,
            name: props.id.split('.').pop() || props.id,
            source: 'winget' as any,
            currentVersion: '',
            availableVersion: '',
            hasUpdate: false,
            category: 'other'
        }
        selectedVersion.value = ''
    }

    // Fetch available versions
    isLoadingVersions.value = true
    try {
        const versions = await packagesStore.fetchVersions(props.id, pkg.value?.source)
        const currentVer = pkg.value?.currentVersion || pkg.value?.availableVersion || ''

        // Add installed version to the list if it's not already there
        if (currentVer && !versions.includes(currentVer)) {
            versions.push(currentVer)
        }

        availableVersions.value = versions

        if (versions.length > 0) {
            // Pre-select the installed version
            selectedVersion.value = currentVer && versions.includes(currentVer) ? currentVer : versions[0]

            // Detect update: if installed version differs from latest
            if (isInstalled.value && currentVer && versions[0] !== currentVer) {
                pkg.value.hasUpdate = true
                pkg.value.availableVersion = versions[0]
            }
        }
    } finally {
        isLoadingVersions.value = false
    }
})

const handleInstall = async () => {
    if (pkg.value) {
        packagesStore.installPackage(pkg.value.id, pkg.value.source)
    }
}

const handleInstallVersion = async () => {
    if (!pkg.value || !selectedVersion.value) return
    isInstallingVersion.value = true
    try {
        const result = await packagesStore.installPackage(pkg.value.id, pkg.value.source, selectedVersion.value)
        if (result.success) {
            pkg.value.currentVersion = selectedVersion.value
        }
    } finally {
        isInstallingVersion.value = false
    }
}

const handleUpdate = () => {
    if (pkg.value) packagesStore.updatePackage(pkg.value)
}

const handleUninstall = () => {
    if (pkg.value) packagesStore.uninstallPackage(pkg.value)
}

const handleShare = () => {
    if (navigator.share) {
        navigator.share({
            title: pkg.value?.name,
            text: pkg.value?.description,
            url: window.location.href
        })
    }
}
</script>
