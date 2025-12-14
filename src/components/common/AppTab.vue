<template>
  <button
    :class="[
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      active 
        ? 'bg-primary text-primary-foreground shadow-sm' 
        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      variant === 'source' && 'text-xs'
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  active?: boolean
  variant?: 'default' | 'source'
}

withDefaults(defineProps<Props>(), {
  active: false,
  variant: 'default'
})

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>
