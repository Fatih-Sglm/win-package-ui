<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" :title="t('app.settings')">
        <Settings class="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel>{{ t('app.settings') }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      <!-- Language Submenu -->
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Globe class="w-4 h-4 mr-2" />
          {{ t('app.language') }}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem @click="appStore.setLocale('tr')">
            <span class="mr-2">🇹🇷</span> Türkçe
            <Check v-if="appStore.locale === 'tr'" class="ml-auto w-4 h-4" />
          </DropdownMenuItem>
          <DropdownMenuItem @click="appStore.setLocale('en')">
            <span class="mr-2">🇺🇸</span> English
            <Check v-if="appStore.locale === 'en'" class="ml-auto w-4 h-4" />
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <!-- Theme Submenu -->
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Palette class="w-4 h-4 mr-2" />
          {{ t('app.appearance') }}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem @click="appStore.setTheme('light')">
            <Sun class="w-4 h-4 mr-2" />
            {{ t('app.theme.light') }}
            <Check v-if="appStore.theme === 'light'" class="ml-auto w-4 h-4" />
          </DropdownMenuItem>
          <DropdownMenuItem @click="appStore.setTheme('dark')">
            <Moon class="w-4 h-4 mr-2" />
            {{ t('app.theme.dark') }}
            <Check v-if="appStore.theme === 'dark'" class="ml-auto w-4 h-4" />
          </DropdownMenuItem>
          <DropdownMenuItem @click="appStore.setTheme('system')">
            <Monitor class="w-4 h-4 mr-2" />
            {{ t('app.theme.system') }}
            <Check v-if="appStore.theme === 'system'" class="ml-auto w-4 h-4" />
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, Globe, Palette, Sun, Moon, Monitor, Check } from 'lucide-vue-next'
import { useAppStore } from '@/stores'

const { t } = useI18n()
const appStore = useAppStore()
</script>
