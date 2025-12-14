<template>
  <Dialog :open="uiStore.showInstallModal" @update:open="(val) => !val && close()">
    <DialogContent class="max-w-4xl max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Package class="w-5 h-5" />
          {{ t('modal.install.title') }}
        </DialogTitle>
      </DialogHeader>

      <!-- Source Selection -->
      <div class="space-y-2">
        <Label>{{ t('modal.install.selectSource') }}</Label>
        <Select v-model="selectedSource">
          <SelectTrigger>
            <SelectValue :placeholder="t('modal.install.selectSource')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🌐 {{ t('package.source.all') }} (WinGet + Chocolatey)</SelectItem>
            <SelectItem value="winget">📦 {{ t('package.source.winget') }}</SelectItem>
            <SelectItem value="chocolatey">🍫 {{ t('package.source.chocolatey') }}</SelectItem>
            <SelectItem value="msstore">🏬 {{ t('package.source.msstore') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          @input="onSearchInput"
          :placeholder="t('modal.install.search')"
          class="pl-10"
        />
      </div>

      <!-- Results -->
      <ScrollArea class="flex-1 -mx-6 px-6">
        <LoadingSpinner v-if="isSearching" :message="t('modal.install.searching')" size="sm" />
        
        <div v-else-if="searchResults.length === 0 && searchQuery" class="text-center py-12">
          <p class="text-muted-foreground">{{ t('package.filter.noResults') }}</p>
        </div>

        <div v-else-if="searchResults.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">{{ t('modal.install.placeholder') }}</p>
        </div>

        <div v-else class="space-y-3">
          <Card v-for="pkg in searchResults" :key="pkg.id + pkg.source" class="hover:border-primary transition-colors">
            <CardContent class="pt-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-semibold">{{ pkg.name }}</h3>
                    <Badge :class="getSourceClass(pkg.source)">{{ pkg.source }}</Badge>
                  </div>
                  <p class="text-sm text-muted-foreground font-mono mb-2">{{ pkg.id }}</p>
                  
                  <div v-if="pkg.loadingVersions" class="mt-2">
                    <p class="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 class="w-3 h-3 animate-spin" /> {{ t('modal.install.versionsLoading') }}
                    </p>
                  </div>
                  <div v-else-if="pkg.versions && pkg.versions.length > 1" class="mt-2 space-y-1">
                    <Label class="text-xs">{{ t('modal.install.selectVersion') }}:</Label>
                    <Select v-model="pkg.selectedVersion">
                      <SelectTrigger class="w-48 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="ver in pkg.versions" :key="ver" :value="ver">
                          {{ ver }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div v-else class="mt-2 flex items-center gap-2">
                    <p class="text-sm text-muted-foreground">
                      <strong>{{ t('package.version') }}:</strong> {{ pkg.version || t('package.unknownVersion') }}
                    </p>
                    <Button
                      v-if="(pkg.source === 'winget' || pkg.source === 'msstore') && !pkg.versions"
                      variant="ghost"
                      size="sm"
                      @click="loadVersions(pkg)"
                      class="h-6 text-xs"
                    >
                      📋 {{ t('modal.install.versions') }}
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  :disabled="pkg.installing"
                  @click="installPackage(pkg)"
                >
                  <Loader2 v-if="pkg.installing" class="w-4 h-4 animate-spin mr-1" />
                  {{ pkg.installing ? t('package.installing') : t('package.install') }}
                </Button>
              </div>
              
              <ProgressBar v-if="pkg.installing" :progress="pkg.progress || 0" class="mt-3" />

              <Alert v-if="pkg.installResult" :variant="pkg.installResult.success ? 'default' : 'destructive'" class="mt-3">
                <AlertDescription>
                  {{ pkg.installResult.success ? '✅ ' + t('modal.install.success') : '❌ ' + t('modal.install.error') }}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Package, Search, Loader2 } from 'lucide-vue-next'
import { LoadingSpinner, ProgressBar } from '@/components/common'
import { useUIStore, usePackagesStore } from '@/stores'

interface SearchPackage {
  id: string
  name: string
  version?: string
  versions?: string[]
  selectedVersion?: string
  loadingVersions?: boolean
  source: 'winget' | 'chocolatey' | 'msstore'
  installing?: boolean
  progress?: number
  installResult?: { success: boolean; error?: string }
}

const { t } = useI18n()
const uiStore = useUIStore()
const packagesStore = usePackagesStore()

// ... rest of logic uses t() where appropriate for dynamic error messages if needed, otherwise logic is same
// For now, static errors in script are minimal, main work is template.

const searchQuery = ref('')
const searchResults = ref<SearchPackage[]>([])
const isSearching = ref(false)
const selectedSource = ref<string>('all')
// ...
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const close = () => {
  uiStore.closeInstallModal()
  searchQuery.value = ''
  searchResults.value = []
}

const getSourceClass = (source: string) => {
  const classes: Record<string, string> = {
    winget: 'bg-blue-500 text-white',
    chocolatey: 'bg-amber-600 text-white',
    msstore: 'bg-orange-500 text-white'
  }
  return classes[source] || ''
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searchTimeout = setTimeout(() => searchPackages(), 500)
}

const searchPackages = async () => {
  if (!searchQuery.value.trim()) return
  isSearching.value = true
  searchResults.value = []

  try {
    const query = searchQuery.value.trim()
    const searchPromises = []
    
    if (selectedSource.value === 'all' || selectedSource.value === 'winget' || selectedSource.value === 'msstore') {
      searchPromises.push(searchWinget(query))
    }
    if (selectedSource.value === 'all' || selectedSource.value === 'chocolatey') {
      searchPromises.push(searchChocolatey(query))
    }

    const results = await Promise.all(searchPromises)
    let allResults = results.flat()
    
    if (selectedSource.value === 'msstore') {
      allResults = allResults.filter(pkg => pkg.source === 'msstore')
    }
    
    searchResults.value = allResults
  } catch (error: any) {
    console.error('Arama hatası:', error)
  } finally {
    isSearching.value = false
  }
}

const searchWinget = async (query: string): Promise<SearchPackage[]> => {
  try {
    if (typeof window !== 'undefined' && window.electron) {
      const result = await window.electron.executeCommand(`winget search "${query}" --accept-source-agreements`)
      if (!result.success) return []

      const lines = result.stdout.split('\n')
      const packages: SearchPackage[] = []
      let dataStarted = false

      for (const line of lines) {
        if (line.includes('Name') && line.includes('Id')) continue
        if (line.includes('---')) { dataStarted = true; continue }
        if (dataStarted && line.trim() && line.length > 10) {
          try {
            let parts = line.split(/\s{2,}/)
            if (parts.length < 4) parts = line.trim().split(/\s+/)
            if (parts.length >= 4) {
              const [name, id, version, source] = parts.map(p => p.trim())
              if (name && id && version) {
                packages.push({ name, id, version, selectedVersion: version, source: source === 'msstore' ? 'msstore' : 'winget' })
              }
            }
          } catch { continue }
        }
      }
      return packages
    }
    return []
  } catch { return [] }
}

const searchChocolatey = async (query: string): Promise<SearchPackage[]> => {
  try {
    if (typeof window !== 'undefined' && window.electron) {
      const checkResult = await window.electron.checkCommand('choco')
      if (!checkResult) return []

      const result = await window.electron.executeCommand(`choco search ${query} -r --limit-output`)
      if (!result.success) return []

      const packages: SearchPackage[] = []
      for (const line of result.stdout.split('\n')) {
        if (line.trim() && line.includes('|')) {
          const [name, version] = line.split('|').map(p => p.trim())
          if (name && version) {
            packages.push({ name, id: name, version, selectedVersion: version, source: 'chocolatey' })
          }
        }
      }
      return packages
    }
    return []
  } catch { return [] }
}

const loadVersions = async (pkg: SearchPackage) => {
  if (pkg.loadingVersions) return
  pkg.loadingVersions = true
  
  try {
    if ((pkg.source === 'winget' || pkg.source === 'msstore') && window.electron) {
      const result = await window.electron.executeCommand(`winget show --id ${pkg.id} --versions`)
      if (result.success) {
        const versions: string[] = []
        let versionsStarted = false
        
        for (const line of result.stdout.split('\n')) {
          if (line.includes('Version') && !versionsStarted) { versionsStarted = true; continue }
          if (line.includes('---')) continue
          if (versionsStarted && line.trim()) {
            const version = line.trim()
            if (version && /[\d.]/.test(version) && version.length < 50) versions.push(version)
          }
        }
        
        if (versions.length > 0) {
          pkg.versions = versions
          pkg.selectedVersion = pkg.version || versions[0]
        }
      }
    }
  } catch (error) {
    console.error('Versiyon yükleme hatası:', error)
  } finally {
    pkg.loadingVersions = false
  }
}

const installPackage = async (pkg: SearchPackage) => {
  pkg.installing = true
  pkg.progress = 0
  pkg.installResult = undefined

  const progressInterval = setInterval(() => {
    if (pkg.progress! < 90) pkg.progress = Math.floor(Math.min(90, pkg.progress! + Math.random() * 10))
  }, 500)

  try {
    const version = pkg.selectedVersion || pkg.version
    let command: string

    if (pkg.source === 'winget' || pkg.source === 'msstore') {
      command = `winget install --id ${pkg.id}${version ? ` --version ${version}` : ''} --accept-source-agreements --accept-package-agreements`
    } else if (pkg.source === 'chocolatey') {
      command = `choco install ${pkg.id}${version ? ` --version ${version}` : ''} -y`
    } else {
      throw new Error('Bilinmeyen kaynak: ' + pkg.source)
    }

    if (window.electron) {
      const result = await window.electron.executeCommand(command)
      clearInterval(progressInterval)
      pkg.progress = 100
      pkg.installResult = result
      if (result.success) setTimeout(() => {
        close()
        packagesStore.fetchPackages()
      }, 2000)
    }
  } catch (error: any) {
    clearInterval(progressInterval)
    pkg.installResult = { success: false, error: error.message }
  } finally {
    pkg.installing = false
  }
}
</script>
