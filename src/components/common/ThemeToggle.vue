<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm">
        <Sun v-if="!appStore.darkMode" class="w-4 h-4 mr-2" />
        <Moon v-else class="w-4 h-4 mr-2" />
        {{ currentThemeLabel }}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="appStore.setTheme('light')">
        <Sun class="w-4 h-4 mr-2" />
        {{ t('app.theme.light') }}
      </DropdownMenuItem>
      <DropdownMenuItem @click="appStore.setTheme('dark')">
        <Moon class="w-4 h-4 mr-2" />
        {{ t('app.theme.dark') }}
      </DropdownMenuItem>
      <DropdownMenuItem @click="appStore.setTheme('system')">
        <Monitor class="w-4 h-4 mr-2" />
        {{ t('app.theme.system') }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useAppStore } from '@/stores'

const { t } = useI18n()
const appStore = useAppStore()

const currentThemeLabel = computed(() => {
  if (appStore.theme === 'light') return t('app.theme.light')
  if (appStore.theme === 'dark') return t('app.theme.dark')
  return t('app.theme.system')
})
</script>
