<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">{{ t('downloads.title') }}</h1>
      <Button
        v-if="hasCompleted"
        variant="outline"
        size="sm"
        @click="packagesStore.clearCompletedOperations()"
      >
        {{ t('downloads.clearCompleted') }}
      </Button>
    </div>

    <!-- Active Operations -->
    <div v-if="packagesStore.operations.length > 0" class="space-y-3">
      <div
        v-for="op in packagesStore.operations"
        :key="op.id"
        class="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card"
      >
        <!-- Icon -->
        <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          :class="{
            'bg-primary/10 text-primary': op.status === 'running',
            'bg-green-500/10 text-green-500': op.status === 'success',
            'bg-destructive/10 text-destructive': op.status === 'error'
          }"
        >
          <Loader2 v-if="op.status === 'running'" class="w-5 h-5 animate-spin" />
          <CheckCircle2 v-else-if="op.status === 'success'" class="w-5 h-5" />
          <XCircle v-else class="w-5 h-5" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="font-medium truncate">{{ op.packageName }}</p>
              <p class="text-xs text-muted-foreground">{{ op.packageId }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <Badge variant="outline" class="text-xs">{{ op.source }}</Badge>
              <Badge
                :class="{
                  'bg-primary/10 text-primary border-primary/20': op.status === 'running',
                  'bg-green-500/10 text-green-500 border-green-500/20': op.status === 'success',
                  'bg-destructive/10 text-destructive border-destructive/20': op.status === 'error'
                }"
                class="text-xs"
              >
                {{ operationLabel(op) }}
              </Badge>
            </div>
          </div>

          <!-- Progress bar for running operations -->
          <Progress v-if="op.status === 'running'" :model-value="op.progress" class="h-1.5" />

          <!-- Error message -->
          <p v-if="op.status === 'error' && op.error" class="text-xs text-destructive truncate">
            {{ op.error }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
      <Download class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p class="text-muted-foreground font-medium">{{ t('downloads.empty') }}</p>
      <p class="text-sm text-muted-foreground mt-1">{{ t('downloads.emptyDesc') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, Loader2, CheckCircle2, XCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { usePackagesStore } from '@/stores'
import type { Operation } from '@/stores/packages'

const { t } = useI18n()
const packagesStore = usePackagesStore()

const hasCompleted = computed(() =>
  packagesStore.operations.some(o => o.status !== 'running')
)

function operationLabel(op: Operation): string {
  if (op.status === 'success') return t('downloads.completed')
  if (op.status === 'error') return t('downloads.failed')
  switch (op.type) {
    case 'install': return t('downloads.installing')
    case 'update': return t('downloads.updating')
    case 'uninstall': return t('downloads.uninstalling')
  }
}
</script>
