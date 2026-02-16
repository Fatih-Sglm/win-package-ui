// Package Model

import { PackageSource, CategoryType } from './enums'

export interface Package {
    name: string
    id: string
    currentVersion: string
    availableVersion: string
    source: PackageSource
    hasUpdate: boolean
    category: CategoryType
    publisher?: string
    description?: string
    version?: string // Fallback for various sources
    updating?: boolean
    progress?: number
    updateResult?: {
        success: boolean
        error?: string
    }
}

export interface PackageListResult {
    packages: Package[]
    totalUpdates: number
}

export interface UpdateResult {
    success: boolean
    output: string
    packageId: string
    code?: number
    error?: string
}

export interface BulkUpdateResult {
    results: Array<UpdateResult & { name: string }>
    total: number
    successful: number
    failed: number
}
