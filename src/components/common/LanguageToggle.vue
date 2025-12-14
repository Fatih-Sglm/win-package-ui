<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="sm" class="font-bold w-9 h-9 p-0">
        {{ currentLocale.toUpperCase() }}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="appStore.setLocale('tr')">
        🇹🇷 Türkçe
      </DropdownMenuItem>
      <DropdownMenuItem @click="appStore.setLocale('en')">
        🇺🇸 English
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores'

const appStore = useAppStore()
const currentLocale = computed(() => appStore.locale)
</script>
