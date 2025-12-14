<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="pointer-events-auto max-w-sm w-80 rounded-lg shadow-lg border backdrop-blur-sm"
          :class="containerClasses(notification.type)"
        >
          <div class="p-4">
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <component :is="getIcon(notification.type)" class="w-5 h-5" :class="iconClasses(notification.type)" />
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold" :class="titleClasses(notification.type)">
                  {{ notification.title }}
                </p>
                <p class="mt-1 text-sm" :class="messageClasses(notification.type)">
                  {{ notification.message }}
                </p>
              </div>

              <!-- Close button -->
              <button
                @click="notificationStore.removeNotification(notification.id)"
                class="flex-shrink-0 p-1 rounded-md transition-colors"
                :class="closeButtonClasses(notification.type)"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore, type Notification } from '@/stores/notification'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const notificationStore = useNotificationStore()
const notifications = computed(() => notificationStore.notifications)

function getIcon(type: Notification['type']) {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }
  return icons[type]
}

function containerClasses(type: Notification['type']) {
  const classes = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
  }
  return classes[type]
}

function iconClasses(type: Notification['type']) {
  const classes = {
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400',
    warning: 'text-amber-500 dark:text-amber-400',
    info: 'text-blue-500 dark:text-blue-400'
  }
  return classes[type]
}

function titleClasses(type: Notification['type']) {
  const classes = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-amber-800 dark:text-amber-200',
    info: 'text-blue-800 dark:text-blue-200'
  }
  return classes[type]
}

function messageClasses(type: Notification['type']) {
  const classes = {
    success: 'text-green-700 dark:text-green-300',
    error: 'text-red-700 dark:text-red-300',
    warning: 'text-amber-700 dark:text-amber-300',
    info: 'text-blue-700 dark:text-blue-300'
  }
  return classes[type]
}

function closeButtonClasses(type: Notification['type']) {
  const classes = {
    success: 'text-green-500 hover:bg-green-100 dark:hover:bg-green-800/50',
    error: 'text-red-500 hover:bg-red-100 dark:hover:bg-red-800/50',
    warning: 'text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-800/50',
    info: 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-800/50'
  }
  return classes[type]
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
