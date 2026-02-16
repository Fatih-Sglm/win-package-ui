<template>
  <router-view />
  <Toast />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Toast } from '@/components/ui/toast'
import { useTheme } from '@/lib/theme'

const { activeThemeId } = useTheme()

// Initialize theme
onMounted(() => {
  // Theme is automatically applied by the watcher in useTheme, 
  // but we ensure the manager is initialized here
  console.log('App initialized with theme:', activeThemeId.value)
})
</script>
