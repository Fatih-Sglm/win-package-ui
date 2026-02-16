// Packages Store - Paket yönetimi için Pinia store

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { packageRegistry } from '@/services/package-providers'
import { PackageSource, CategoryType } from '@/models'
import type { Package, UpdateResult } from '@/models'
import { useNotificationStore } from './notification'
import { cacheService } from '@/services/cache'

export const usePackagesStore = defineStore('packages', () => {
    // State
    const packages = ref<Package[]>([])
    const isLoading = ref(false)
    const totalUpdates = ref(0)

    // Filters
    const activeSource = ref<PackageSource | 'all'>('all')
    const activeCategory = ref<CategoryType | 'all'>('all')
    const searchQuery = ref('')

    // Persisted Settings
    const showOnlyUpdates = ref(localStorage.getItem('settings.showOnlyUpdates') !== 'false')
    const interactiveMode = ref(localStorage.getItem('settings.interactiveMode') !== 'false')

    // Watchers for persistence
    watch(showOnlyUpdates, (val) => localStorage.setItem('settings.showOnlyUpdates', String(val)))
    watch(interactiveMode, (val) => localStorage.setItem('settings.interactiveMode', String(val)))

    // Bulk update progress
    const bulkProgress = ref({
        active: false,
        current: 0,
        total: 0,
        successful: 0,
        failed: 0
    })

    // Computed
    const filteredPackages = computed(() => {
        let result = showOnlyUpdates.value
            ? packages.value.filter(p => p.hasUpdate)
            : packages.value

        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query)
            )
        }

        if (activeSource.value !== 'all') {
            result = result.filter(p => p.source === activeSource.value)
        }

        if (activeCategory.value !== 'all') {
            result = result.filter(p => p.category === activeCategory.value)
        }

        return result
    })

    const hasUpdates = computed(() => packages.value.some(p => p.hasUpdate))
    const hasPackages = computed(() => filteredPackages.value.length > 0)

    const sourceCounts = computed(() => {
        const pkgs = showOnlyUpdates.value
            ? packages.value.filter(p => p.hasUpdate)
            : packages.value
        return {
            all: pkgs.length,
            [PackageSource.Winget]: pkgs.filter(p => p.source === PackageSource.Winget).length,
            [PackageSource.Chocolatey]: pkgs.filter(p => p.source === PackageSource.Chocolatey).length,
            [PackageSource.MsStore]: pkgs.filter(p => p.source === PackageSource.MsStore).length
        }
    })

    const availableCategories = computed(() => {
        const pkgs = showOnlyUpdates.value
            ? packages.value.filter(p => p.hasUpdate)
            : packages.value

        const filtered = activeSource.value === 'all'
            ? pkgs
            : pkgs.filter(p => p.source === activeSource.value)

        const cats = new Set<CategoryType>()
        filtered.forEach(p => cats.add(p.category))
        return Array.from(cats).sort()
    })

    // Actions
    async function fetchPackages(force = false) {
        if (!force) {
            const cached = cacheService.get<{ packages: Package[], totalUpdates: number }>('installed-packages')
            if (cached) {
                packages.value = cached.packages.map(pkg => ({
                    ...pkg,
                    updating: false,
                    progress: 0,
                    updateResult: undefined
                }))
                totalUpdates.value = cached.totalUpdates
                return
            }
        }

        isLoading.value = true
        try {
            const result = await packageRegistry.getAllPackages(false)
            packages.value = result.packages.map(pkg => ({
                ...pkg,
                updating: false,
                progress: 0,
                updateResult: undefined
            }))
            totalUpdates.value = result.totalUpdates
            cacheService.set('installed-packages', { packages: result.packages, totalUpdates: result.totalUpdates })
        } catch (error: any) {
            const notificationStore = useNotificationStore()
            notificationStore.error('Hata', 'Paketler yüklenirken hata oluştu: ' + error.message)
        } finally {
            isLoading.value = false
        }
    }

    function invalidatePackageCache(id: string) {
        cacheService.invalidate(`pkg:${id}`)
        cacheService.invalidate(`versions:${id}`)
        cacheService.invalidate('installed-packages')
    }

    async function updatePackage(pkg: Package): Promise<UpdateResult> {
        const index = packages.value.findIndex(p => p.id === pkg.id && p.source === pkg.source)
        if (index === -1) {
            return { success: false, output: '', packageId: pkg.id, error: 'Paket bulunamadı' }
        }

        packages.value[index].updating = true
        packages.value[index].progress = 0
        packages.value[index].updateResult = undefined

        const progressInterval = setInterval(() => {
            if (packages.value[index].progress! < 90) {
                packages.value[index].progress = Math.floor(Math.min(90, packages.value[index].progress! + Math.random() * 10))
            }
        }, 500)

        try {
            const result = await packageRegistry.updatePackage(pkg.id, pkg.source, interactiveMode.value)

            clearInterval(progressInterval)
            packages.value[index].progress = 100
            packages.value[index].updateResult = { success: result.success, error: result.error }

            if (result.success) {
                invalidatePackageCache(pkg.id)
                setTimeout(() => {
                    const idx = packages.value.findIndex(p => p.id === pkg.id && p.source === pkg.source)
                    if (idx > -1) {
                        packages.value[idx].hasUpdate = false
                        totalUpdates.value = packages.value.filter(p => p.hasUpdate).length
                    }
                }, 2000)
            }

            return result
        } catch (error: any) {
            clearInterval(progressInterval)
            const errorResult = { success: false, output: '', packageId: pkg.id, error: error.message }
            packages.value[index].updateResult = { success: false, error: error.message }
            return errorResult
        } finally {
            packages.value[index].updating = false
        }
    }

    async function installPackage(id: string, source: PackageSource, version?: string): Promise<UpdateResult> {
        isLoading.value = true
        try {
            const result = await packageRegistry.installPackage(id, source, interactiveMode.value, version)
            if (result.success) {
                invalidatePackageCache(id)
                await fetchPackages(true)
            }
            return result
        } catch (error: any) {
            return { success: false, output: '', packageId: id, error: error.message }
        } finally {
            isLoading.value = false
        }
    }

    async function fetchPackageDetails(id: string): Promise<Package | null> {
        const cacheKey = `pkg:${id}`
        const cached = cacheService.get<Package>(cacheKey)
        if (cached) return cached

        try {
            const result = await packageRegistry.showPackage(id)
            if (result) cacheService.set(cacheKey, result)
            return result
        } catch {
            return null
        }
    }

    async function fetchVersions(id: string, source: PackageSource = PackageSource.Winget, limit: number = 5): Promise<string[]> {
        const cacheKey = `versions:${id}`
        const cached = cacheService.get<string[]>(cacheKey)
        if (cached) return cached

        try {
            const result = await packageRegistry.getVersions(id, source, limit)
            if (result.length > 0) cacheService.set(cacheKey, result)
            return result
        } catch {
            return []
        }
    }

    async function fetchMultiplePackageDetails(ids: string[]): Promise<Package[]> {
        const results = await Promise.allSettled(
            ids.map(id => fetchPackageDetails(id))
        )
        return results
            .filter((r): r is PromiseFulfilledResult<Package | null> => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value!)
    }

    async function searchRemote(query: string, source: PackageSource | 'all' = 'all'): Promise<Package[]> {
        isLoading.value = true
        try {
            if (source !== 'all') {
                const provider = packageRegistry.get(source)
                if (provider && provider.searchPackages) {
                    const results = await provider.searchPackages(query)
                    return results.slice(0, 5)
                }
                return []
            }
            // If 'all', use the registry's search and limit
            const results = await packageRegistry.searchPackages(query)
            return results.slice(0, 5)
        } catch (error) {
            console.error('Search error:', error)
            return []
        } finally {
            isLoading.value = false
        }
    }

    async function uninstallPackage(pkg: Package): Promise<UpdateResult> {
        const index = packages.value.findIndex(p => p.id === pkg.id && p.source === pkg.source)
        if (index === -1) {
            return { success: false, output: '', packageId: pkg.id, error: 'Paket bulunamadı' }
        }

        packages.value[index].updating = true
        packages.value[index].progress = 0

        const progressInterval = setInterval(() => {
            if (packages.value[index].progress! < 90) {
                packages.value[index].progress = Math.floor(Math.min(90, packages.value[index].progress! + Math.random() * 10))
            }
        }, 500)

        try {
            const result = await packageRegistry.uninstallPackage(pkg.id, pkg.source)

            clearInterval(progressInterval)
            packages.value[index].progress = 100
            packages.value[index].updateResult = { success: result.success, error: result.error }

            if (result.success) {
                invalidatePackageCache(pkg.id)
                setTimeout(() => {
                    const idx = packages.value.findIndex(p => p.id === pkg.id && p.source === pkg.source)
                    if (idx > -1) {
                        packages.value.splice(idx, 1)
                        totalUpdates.value = packages.value.filter(p => p.hasUpdate).length
                    }
                }, 2000)
            }

            return result
        } catch (error: any) {
            clearInterval(progressInterval)
            return { success: false, output: '', packageId: pkg.id, error: error.message }
        } finally {
            packages.value[index].updating = false
        }
    }

    async function updateAllPackages() {
        const packagesToUpdate = filteredPackages.value.filter(p => p.hasUpdate)

        bulkProgress.value = {
            active: true,
            current: 0,
            total: packagesToUpdate.length,
            successful: 0,
            failed: 0
        }

        isLoading.value = true

        for (const pkg of packagesToUpdate) {
            const result = await updatePackage(pkg)
            bulkProgress.value.current++
            if (result.success) {
                bulkProgress.value.successful++
            } else {
                bulkProgress.value.failed++
            }
        }

        isLoading.value = false

        setTimeout(() => {
            bulkProgress.value.active = false
        }, 3000)
    }

    function setFilter(key: 'source' | 'category' | 'search' | 'onlyUpdates', value: any) {
        switch (key) {
            case 'source':
                activeSource.value = value
                activeCategory.value = 'all'
                break
            case 'category':
                activeCategory.value = value
                break
            case 'search':
                searchQuery.value = value
                break
            case 'onlyUpdates':
                showOnlyUpdates.value = value
                break
        }
    }

    function getSourceCount(source: PackageSource | 'all'): number {
        return sourceCounts.value[source] || 0
    }

    function getCategoryCount(category: CategoryType): number {
        const pkgs = showOnlyUpdates.value
            ? packages.value.filter(p => p.hasUpdate)
            : packages.value

        const filtered = activeSource.value === 'all'
            ? pkgs
            : pkgs.filter(p => p.source === activeSource.value)

        return filtered.filter(p => p.category === category).length
    }

    return {
        // State
        packages,
        isLoading,
        totalUpdates,
        activeSource,
        activeCategory,
        searchQuery,
        showOnlyUpdates,
        interactiveMode,
        bulkProgress,

        // Computed
        filteredPackages,
        hasUpdates,
        hasPackages,
        sourceCounts,
        availableCategories,

        // Actions
        fetchPackages,
        fetchPackageDetails,
        fetchVersions,
        fetchMultiplePackageDetails,
        updatePackage,
        installPackage,
        uninstallPackage,
        updateAllPackages,
        searchRemote,
        setFilter,
        getSourceCount,
        getCategoryCount
    }
})
