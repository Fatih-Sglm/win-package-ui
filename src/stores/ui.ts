// UI Store - UI state için Pinia store

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ConsoleLog {
    type: 'log' | 'error' | 'warn' | 'info'
    message: string
    timestamp: string
}

export interface ErrorModalData {
    title: string
    packageName: string
    error: string
    output: string
}

export const useUIStore = defineStore('ui', () => {
    // Console state
    const consoleOpen = ref(false)
    const consoleLogs = ref<ConsoleLog[]>([])

    // Modal state
    const showInstallModal = ref(false)
    const showErrorModal = ref(false)
    const errorModalData = ref<ErrorModalData>({
        title: '',
        packageName: '',
        error: '',
        output: ''
    })

    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    // Console actions
    function addConsoleLog(type: ConsoleLog['type'], message: string) {
        const timestamp = new Date().toLocaleTimeString('tr-TR')
        consoleLogs.value.push({ type, message, timestamp })
        if (consoleLogs.value.length > 500) {
            consoleLogs.value.shift()
        }
    }

    function clearConsole() {
        consoleLogs.value = []
        addConsoleLog('info', 'Konsol temizlendi')
    }

    function toggleConsole() {
        consoleOpen.value = !consoleOpen.value
    }

    // Modal actions
    function openInstallModal() {
        showInstallModal.value = true
    }

    function closeInstallModal() {
        showInstallModal.value = false
    }

    function openErrorModal(data: ErrorModalData) {
        errorModalData.value = data
        showErrorModal.value = true
    }

    function closeErrorModal() {
        showErrorModal.value = false
    }

    // Pagination actions
    function setPage(page: number) {
        currentPage.value = page
    }

    function setItemsPerPage(count: number) {
        itemsPerPage.value = count
        currentPage.value = 1
    }

    function resetPage() {
        currentPage.value = 1
    }

    // Console log interceptors
    function setupConsoleInterceptors() {
        const originalLog = console.log
        const originalError = console.error
        const originalWarn = console.warn
        const originalInfo = console.info

        console.log = (...args: any[]) => {
            originalLog(...args)
            addConsoleLog('log', args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '))
        }

        console.error = (...args: any[]) => {
            originalError(...args)
            addConsoleLog('error', args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '))
        }

        console.warn = (...args: any[]) => {
            originalWarn(...args)
            addConsoleLog('warn', args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '))
        }

        console.info = (...args: any[]) => {
            originalInfo(...args)
            addConsoleLog('info', args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '))
        }
    }

    return {
        // Console
        consoleOpen,
        consoleLogs,
        addConsoleLog,
        clearConsole,
        toggleConsole,
        setupConsoleInterceptors,

        // Modals
        showInstallModal,
        showErrorModal,
        errorModalData,
        openInstallModal,
        closeInstallModal,
        openErrorModal,
        closeErrorModal,

        // Pagination
        currentPage,
        itemsPerPage,
        setPage,
        setItemsPerPage,
        resetPage
    }
})
