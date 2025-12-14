<template>
  <div class="text-center py-20">
    <Card class="max-w-md mx-auto">
      <CardContent class="pt-6">
        <div class="text-4xl mb-4">{{ icon }}</div>
        <h2 class="text-2xl font-bold text-primary mb-2">{{ title }}</h2>
        <p class="text-muted-foreground">{{ message }}</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  icon?: string
  title?: string
  message?: string
}

withDefaults(defineProps<Props>(), {
  icon: '✅',
  title: 'Tüm paketler güncel!',
  message: 'Güncellenecek paket bulunamadı.'
})
</script>
