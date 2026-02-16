<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">{{ t('app.nav.downloads') }}</h1>
    
    <div class="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
      <Download class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p class="text-muted-foreground">
        {{ t('package.filter.noResults') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'

const { t } = useI18n()
</script>
