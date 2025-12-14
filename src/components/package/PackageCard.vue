<template>
  <Card class="transition-all hover:shadow-lg">
    <CardContent class="pt-6">
      <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
        <!-- Package Info -->
        <div class="flex-1 w-full sm:w-auto">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h3 class="text-lg font-semibold">{{ pkg.name }}</h3>
            <div class="flex gap-2 flex-wrap">
              <Badge variant="secondary">{{ pkg.category }}</Badge>
              <Badge :class="sourceClass">{{ pkg.source }}</Badge>
            </div>
          </div>
          
          <p class="text-sm text-muted-foreground font-mono mb-3 break-all">
            {{ pkg.id }}
          </p>
          
          <div v-if="pkg.hasUpdate" class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mb-3">
            <span class="text-muted-foreground">
              <strong>{{ t('package.currentVersion') }}:</strong> {{ pkg.currentVersion }}
            </span>
            <ArrowRight class="hidden sm:inline w-4 h-4 text-muted-foreground" />
            <span class="text-primary font-medium">
              <strong>{{ t('package.newVersion') }}:</strong> {{ pkg.availableVersion }}
            </span>
          </div>
          
          <div v-else class="flex items-center gap-2 text-sm mb-3">
            <span class="text-muted-foreground">
              <strong>{{ t('package.version') }}:</strong> {{ pkg.currentVersion }}
            </span>
            <Badge variant="outline" class="text-green-600 border-green-600">
              <Check class="w-3 h-3 mr-1" /> {{ t('package.upToDate') }}
            </Badge>
          </div>

          <ProgressBar v-if="pkg.updating" :progress="pkg.progress || 0" class="mb-3" />

          <Alert v-if="pkg.updateResult" :variant="pkg.updateResult.success ? 'default' : 'destructive'">
            <AlertDescription>
              {{ pkg.updateResult.success ? '✅ ' + t('modal.install.success') : '❌ ' + t('modal.install.error') }}
            </AlertDescription>
          </Alert>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 w-full sm:w-auto sm:shrink-0">
          <Button
            v-if="pkg.hasUpdate"
            size="sm"
            :disabled="pkg.updating"
            @click="handleUpdate"
            class="flex-1 sm:flex-none"
          >
            <Loader2 v-if="pkg.updating" class="w-4 h-4 animate-spin mr-1" />
            {{ pkg.updating ? t('package.updating') : t('package.update') }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="pkg.updating"
            @click="handleUninstall"
            class="flex-1 sm:flex-none"
          >
            {{ t('package.uninstall') }}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, Check, Loader2 } from 'lucide-vue-next'
import { ProgressBar } from '@/components/common'
import type { Package } from '@/models'
import { usePackagesStore, useUIStore } from '@/stores'

interface Props {
  pkg: Package
}

const props = defineProps<Props>()

const { t } = useI18n()
const packagesStore = usePackagesStore()
const uiStore = useUIStore()

const sourceClass = computed(() => {
  const classes: Record<string, string> = {
    winget: 'bg-blue-500 text-white hover:bg-blue-600',
    chocolatey: 'bg-amber-600 text-white hover:bg-amber-700',
    msstore: 'bg-orange-500 text-white hover:bg-orange-600'
  }
  return classes[props.pkg.source] || ''
})

async function handleUpdate() {
  const result = await packagesStore.updatePackage(props.pkg)
  
  if (!result.success) {
    uiStore.openErrorModal({
      title: t('modal.error.title'),
      packageName: props.pkg.name,
      error: result.error || t('modal.error.error'),
      output: result.output || ''
    })
  }
}

async function handleUninstall() {
  if (!confirm(t('modal.confirm.uninstall', { name: props.pkg.name }))) return

  const result = await packagesStore.uninstallPackage(props.pkg)
  
  if (!result.success) {
    uiStore.openErrorModal({
      title: t('modal.error.title'),
      packageName: props.pkg.name,
      error: result.error || t('modal.error.error'),
      output: result.output || ''
    })
  }
}
</script>
