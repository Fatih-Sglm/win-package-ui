import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/models'


export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref<Notification[]>([])

    function addNotification(notification: Omit<Notification, 'id'>) {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9)
        const newNotification: Notification = {
            ...notification,
            id,
            duration: notification.duration ?? 5000
        }

        notifications.value.push(newNotification)

        // Auto remove after duration
        const duration = newNotification.duration ?? 5000
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, duration)
        }

        return id
    }

    function removeNotification(id: string) {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
            notifications.value.splice(index, 1)
        }
    }

    function clearAll() {
        notifications.value = []
    }

    // Helper functions
    function success(title: string, message: string, duration?: number) {
        return addNotification({ type: 'success', title, message, duration })
    }

    function error(title: string, message: string, duration?: number) {
        return addNotification({ type: 'error', title, message, duration })
    }

    function warning(title: string, message: string, duration?: number) {
        return addNotification({ type: 'warning', title, message, duration })
    }

    function info(title: string, message: string, duration?: number) {
        return addNotification({ type: 'info', title, message, duration })
    }

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        warning,
        info
    }
})
