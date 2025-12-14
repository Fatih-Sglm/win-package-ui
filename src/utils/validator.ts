/**
 * Input validator utility for security
 */
export class Validator {
    // Whitelist pattern for Package IDs
    // Allows alphanumeric, dots, hyphens, underscores, and spaces (for names)
    // Strictly forbids shell characters like ; & | < > ` $ ( )
    private static readonly ID_PATTERN = /^[a-zA-Z0-9.\-_ ]+$/

    // Pattern for strict IDs (no spaces) often used in Winget
    private static readonly STRICT_ID_PATTERN = /^[a-zA-Z0-9.\-_]+$/

    /**
     * Validates if the package ID is safe to use in commands
     * @param id Package ID to validate
     * @param strict If true, disallows spaces (default: false)
     */
    static validatePackageId(id: string, strict = false): boolean {
        if (!id || typeof id !== 'string') return false
        const pattern = strict ? this.STRICT_ID_PATTERN : this.ID_PATTERN
        return pattern.test(id.trim())
    }

    /**
     * Sanitizes input string by removing potentially dangerous shell characters
     * @param input Raw input string
     */
    static sanitize(input: string): string {
        if (!input) return ''
        // Remove shell operators and common injection characters
        // ; & | < > ` $ ( ) \ " '
        return input.replace(/[;&|<>\`$()\\"']/g, '')
    }

    /**
     * Validates search query
     * Allows bit more flexibility but still blocks command chaining
     */
    static validateSearchQuery(query: string): boolean {
        if (!query) return false
        // Prevent command chaining characters
        return !/[;&|]/.test(query)
    }
}
