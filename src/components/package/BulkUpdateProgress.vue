<template>
  <div 
    v-if="packagesStore.bulkProgress.active" 
    class="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right"
  >
    <Card class="min-w-[350px] shadow-2xl">
      <CardHeader class="pb-2">
        <CardTitle class="text-lg flex items-center gap-2">
          <Package class="w-5 h-5" />
          {{ t('bulk.title') }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground mb-3 font-medium">
          {{ packagesStore.bulkProgress.current }} / {{ packagesStore.bulkProgress.total }}
        </p>
        <ProgressBar
          :progress="(packagesStore.bulkProgress.total > 0 ? (packagesStore.bulkProgress.current / packagesStore.bulkProgress.total) * 100 : 0)"
          :show-label="false"
          class="mb-3"
        />
        <div class="flex gap-4 text-sm">
          <span class="text-green-600 flex items-center gap-1">
            <CheckCircle class="w-4 h-4" /> {{ packagesStore.bulkProgress.successful }}
          </span>
          <span class="text-destructive flex items-center gap-1">
            <XCircle class="w-4 h-4" /> {{ packagesStore.bulkProgress.failed }}
          </span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, CheckCircle, XCircle } from 'lucide-vue-next'
import { ProgressBar } from '@/components/common'
import { usePackagesStore } from '@/stores'

const { t } = useI18n()
const packagesStore = usePackagesStore()
</script>
