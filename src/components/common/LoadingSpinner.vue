<template>
  <div class="flex flex-col items-center justify-center py-20">
    <Loader2 :class="spinnerSize" class="animate-spin text-primary" />
    <p v-if="message" class="mt-4 text-muted-foreground font-medium">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  message: ''
})

const spinnerSize = computed(() => {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }
  return sizes[props.size]
})
</script>
