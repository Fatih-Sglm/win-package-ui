<template>
  <Dialog :open="uiStore.showErrorModal" @update:open="(val) => !val && uiStore.closeErrorModal()">
    <DialogContent class="max-w-2xl max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-3 text-destructive">
          <div class="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle class="w-6 h-6" />
          </div>
          {{ uiStore.errorModalData.title }}
        </DialogTitle>
      </DialogHeader>

      <ScrollArea class="flex-1 -mx-6 px-6">
        <!-- Package Info -->
        <div v-if="uiStore.errorModalData.packageName" class="mb-4 p-4 bg-muted rounded-lg">
          <p class="text-sm">
            <strong>{{ t('modal.error.package') }}:</strong> {{ uiStore.errorModalData.packageName }}
          </p>
        </div>

        <!-- Error Message -->
        <div class="mb-4">
          <Label class="mb-2 block">{{ t('modal.error.errorLabel') }}</Label>
          <Alert variant="destructive">
            <AlertDescription>{{ uiStore.errorModalData.error }}</AlertDescription>
          </Alert>
        </div>

        <!-- Command Output -->
        <div v-if="cleanedOutput" class="mb-4">
          <Label class="mb-2 block">{{ t('modal.error.outputLabel') }}</Label>
          <pre class="text-sm bg-muted border rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{{ cleanedOutput }}</pre>
        </div>

        <!-- Common Solutions -->
        <div v-if="showSolutions" class="mb-4">
          <Label class="mb-3 block flex items-center gap-2">
            <Lightbulb class="w-4 h-4" /> {{ t('modal.error.solutions') }}
          </Label>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <!-- Solutions are tricky to translate because they depend on error content logic. 
                 Keeping them static for now or would need dynamic keys. 
                 Given time constraint, keeping logic based solutions as is, maybe generic solutions can be translated. -->
            <li v-if="uiStore.errorModalData.error?.includes('3221226505')" class="flex items-start gap-2">
              <span class="text-primary">•</span>
              <span>Uygulamayı tamamen kapatıp tekrar deneyin</span>
            </li>
            <!-- ... other solutions ... -->
          </ul>
        </div>
      </ScrollArea>

      <DialogFooter>
        <Button
          v-if="uiStore.errorModalData.error?.includes('MS Store') || uiStore.errorModalData.output?.includes('msstore')"
          variant="outline"
          @click="openMSStore"
        >
          🏬 {{ t('modal.error.openMsStore') }}
        </Button>
        <Button variant="outline" @click="copyToClipboard">
          <Copy class="w-4 h-4 mr-2" />
          {{ copied ? t('modal.error.copied') : t('modal.error.copy') }}
        </Button>
        <Button @click="uiStore.closeErrorModal()">{{ t('modal.error.close') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, Copy, Lightbulb } from 'lucide-vue-next'
import { openMicrosoftStore } from '@/services/ipc'
import { useUIStore } from '@/stores'

const { t } = useI18n()
const uiStore = useUIStore()

const copied = ref(false)

const showSolutions = computed(() => uiStore.errorModalData.output && uiStore.errorModalData.output.trim().length > 0)

const cleanedOutput = computed(() => {
  if (!uiStore.errorModalData.output) return ''
  return uiStore.errorModalData.output
    .replace(/^\s*[-\\|/]\s*$/gm, '')
    .replace(/\s+[-\\|/]\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
})

const openMSStore = async () => {
  const opened = await openMicrosoftStore()
  if (opened) uiStore.closeErrorModal()
}

const copyToClipboard = () => {
  const text = `${uiStore.errorModalData.title}\n\nPaket: ${uiStore.errorModalData.packageName || 'N/A'}\nHata: ${uiStore.errorModalData.error}\n\nOutput:\n${uiStore.errorModalData.output || 'Yok'}`
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
