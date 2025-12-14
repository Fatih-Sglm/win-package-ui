<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
    <Button
      variant="outline"
      size="sm"
      :disabled="uiStore.currentPage === 1"
      @click="goToPreviousPage"
    >
      <ChevronLeft class="w-4 h-4 mr-1" />
      {{ t('app.pagination.previous') }}
    </Button>
    
    <div class="flex gap-1">
      <Button
        v-for="page in visiblePages"
        :key="page"
        :variant="page === uiStore.currentPage ? 'default' : 'outline'"
        size="sm"
        :disabled="typeof page !== 'number'"
        @click="goToPage(page)"
        class="min-w-[40px]"
      >
        {{ page }}
      </Button>
    </div>
    
    <Button
      variant="outline"
      size="sm"
      :disabled="uiStore.currentPage === totalPages"
      @click="goToNextPage"
    >
      {{ t('app.pagination.next') }}
      <ChevronRight class="w-4 h-4 ml-1" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useUIStore, usePackagesStore } from '@/stores'

const { t } = useI18n()
const uiStore = useUIStore()
const packagesStore = usePackagesStore()

// Computed
const totalPages = computed(() => 
  Math.ceil(packagesStore.filteredPackages.length / uiStore.itemsPerPage)
)

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = uiStore.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// Actions
const goToPreviousPage = () => {
  if (uiStore.currentPage > 1) {
    uiStore.setPage(uiStore.currentPage - 1)
  }
}

const goToNextPage = () => {
  if (uiStore.currentPage < totalPages.value) {
    uiStore.setPage(uiStore.currentPage + 1)
  }
}

const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    uiStore.setPage(page)
  }
}
</script>
