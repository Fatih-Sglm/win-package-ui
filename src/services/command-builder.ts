import { Validator } from '@/utils/validator'

export type CommandTemplate =
    | 'winget.list'
    | 'winget.search'
    | 'winget.upgrade.list'
    | 'winget.install'
    | 'winget.install.interactive'
    | 'winget.upgrade'
    | 'winget.upgrade.interactive'
    | 'winget.uninstall'
    | 'choco.list'
    | 'choco.outdated'
    | 'choco.search'
    | 'choco.install'
    | 'choco.upgrade'
    | 'choco.uninstall'

export class CommandBuilder {
    private static readonly templates: Record<CommandTemplate, string> = {
        // Winget
        'winget.list': 'winget list --accept-source-agreements',
        'winget.search': 'winget search "{query}" --accept-source-agreements',
        'winget.upgrade.list': 'winget upgrade --accept-source-agreements',
        'winget.install': 'winget install --id {id} --accept-source-agreements --accept-package-agreements',
        'winget.install.interactive': 'winget install --id {id} --interactive',
        'winget.upgrade': 'winget upgrade --id {id} --accept-source-agreements --accept-package-agreements',
        'winget.upgrade.interactive': 'winget upgrade --id {id} --interactive',
        'winget.uninstall': 'winget uninstall --id {id} --accept-source-agreements',

        // Chocolatey
        'choco.list': 'choco list -lo -r',
        'choco.outdated': 'choco outdated -r',
        'choco.search': 'choco search {query} -r',
        'choco.install': 'choco install {id} -y',
        'choco.upgrade': 'choco upgrade {id} -y',
        'choco.uninstall': 'choco uninstall {id} -y'
    }

    /**
     * Builds a safe command string from a template and parameters
     * @param template Template key
     * @param params Key-value pairs for replacement (e.g. { id: '...' })
     * @throws Error if parameters are invalid
     */
    static build(template: CommandTemplate, params: Record<string, string> = {}): string {
        let command = this.templates[template]

        for (const [key, value] of Object.entries(params)) {
            const placeholder = `{${key}}`

            if (command.includes(placeholder)) {
                // Validation logic based on parameter type
                if (key === 'id') {
                    if (!Validator.validatePackageId(value)) {
                        throw new Error(`Invalid Package ID: ${value}`)
                    }
                } else if (key === 'query') {
                    // For search queries, we sanitize instead of strict validation
                    // to allow spaces and some punctuation, but remove dangerous chars
                    if (!Validator.validateSearchQuery(value)) {
                        throw new Error(`Invalid Search Query: ${value}`)
                    }
                }

                // Safe replacement
                // Note: For 'query' in winget, we wrapped it in quotes in the template "{query}"
                // So we just need to ensure the value doesn't break out of quotes
                const safeValue = (key === 'query') ? Validator.sanitize(value) : value.trim()

                command = command.replace(placeholder, safeValue)
            }
        }

        return command
    }
}
