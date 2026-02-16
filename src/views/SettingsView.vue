<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8">{{ t('app.settings') }}</h1>

    <div class="grid gap-8">
      <!-- Appearance Section -->
      <Card>
        <CardHeader>
          <CardTitle>{{ t('app.appearance') }}</CardTitle>
          <CardDescription>
             Customize the look and feel of the application.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
           <div class="space-y-4">
              <Label class="text-base font-medium">{{ t('app.theme.title') }}</Label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  v-for="theme in availableThemes"
                  :key="theme.id"
                  @click="setTheme(theme.id)"
                  class="relative group rounded-lg overflow-hidden border-2 transition-all p-1"
                  :class="activeThemeId === theme.id ? 'border-primary' : 'border-transparent hover:border-muted-foreground/25'"
                >
                  <div class="space-y-2 rounded-md bg-background p-2 border shadow-sm aspect-video flex flex-col">
                    <div class="space-y-1">
                      <div class="h-2 w-[80%] rounded-lg bg-current opacity-50" :style="{ color: `hsl(${theme.colors.foreground})` }" />
                      <div class="h-2 w-[60%] rounded-lg bg-current opacity-30" :style="{ color: `hsl(${theme.colors.foreground})` }" />
                    </div>
                    <div class="flex items-center gap-1 mt-auto">
                        <div class="h-4 w-4 rounded-full" :style="{ backgroundColor: `hsl(${theme.colors.primary})` }" />
                        <div class="h-4 w-4 rounded-full" :style="{ backgroundColor: `hsl(${theme.colors.secondary})` }" />
                    </div>
                  </div>
                  <span class="block text-center text-sm font-medium mt-2">{{ theme.name }}</span>
                </button>
              </div>
           </div>
        </CardContent>
      </Card>

      <!-- Language Section -->
      <Card>
        <CardHeader>
          <CardTitle>{{ t('app.language') }}</CardTitle>
          <CardDescription>
            Select your preferred language.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center space-x-4">
            <Globe class="w-5 h-5 text-muted-foreground" />
            <Select :model-value="locale as string" @update:model-value="(val) => setLocale(val)">
              <SelectTrigger class="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="tr">Türkçe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <!-- App Version Info -->
      <div class="flex justify-center text-xs text-muted-foreground mt-8">
        v0.1.0-alpha
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/lib/theme'
import { useAppStore } from '@/stores'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-vue-next'

const { t, locale } = useI18n()
const appStore = useAppStore()
const { availableThemes, activeThemeId, setTheme } = useTheme()

function setLocale(val: any) {
  const newLocale = String(val)
  if (newLocale === 'en' || newLocale === 'tr') {
     appStore.setLocale(newLocale as 'en' | 'tr')
     locale.value = newLocale as 'en' | 'tr'
  }
}
</script>
