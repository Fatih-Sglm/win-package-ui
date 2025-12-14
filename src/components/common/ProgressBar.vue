<template>
  <div class="flex items-center gap-3">
    <Progress :model-value="progress" class="flex-1" />
    <span 
      v-if="showLabel"
      class="text-sm font-medium text-muted-foreground min-w-[45px] text-right"
    >
      {{ Math.floor(progress) }}%
    </span>
  </div>
</template>

<script setup lang="ts">
import { Progress } from '@/components/ui/progress'

interface Props {
  progress: number
  showLabel?: boolean
}

withDefaults(defineProps<Props>(), {
  showLabel: true
})
</script>
