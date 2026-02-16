import { Validator } from '@/utils/validator'

export type CommandTemplate =
    | 'winget.list'
    | 'winget.search'
    | 'winget.show'
    | 'winget.show.versions'
    | 'winget.upgrade.list'
    | 'winget.install'
    | 'winget.install.version'
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
    private static readonly templates: Record<CommandTemplate, { program: string, args: string[] }> = {
        // Winget
        'winget.list': { program: 'winget', args: ['list', '--accept-source-agreements'] },
        'winget.search': { program: 'winget', args: ['search', '{query}', '--accept-source-agreements'] },
        'winget.show': { program: 'winget', args: ['show', '--id', '{id}', '--accept-source-agreements'] },
        'winget.show.versions': { program: 'winget', args: ['show', '--id', '{id}', '--versions', '--accept-source-agreements'] },
        'winget.upgrade.list': { program: 'winget', args: ['upgrade', '--accept-source-agreements'] },
        'winget.install': { program: 'winget', args: ['install', '--id', '{id}', '--accept-source-agreements', '--accept-package-agreements'] },
        'winget.install.version': { program: 'winget', args: ['install', '--id', '{id}', '--version', '{version}', '--force', '--accept-source-agreements', '--accept-package-agreements'] },
        'winget.install.interactive': { program: 'winget', args: ['install', '{id}', '--interactive'] },
        'winget.upgrade': { program: 'winget', args: ['upgrade', '--id', '{id}', '--accept-source-agreements', '--accept-package-agreements'] },
        'winget.upgrade.interactive': { program: 'winget', args: ['upgrade', '--id', '{id}', '--interactive'] },
        'winget.uninstall': { program: 'winget', args: ['uninstall', '--id', '{id}', '--accept-source-agreements'] },

        // Chocolatey
        'choco.list': { program: 'choco', args: ['list', '-lo', '-r'] },
        'choco.outdated': { program: 'choco', args: ['outdated', '-r'] },
        'choco.search': { program: 'choco', args: ['search', '{query}', '-r'] },
        'choco.install': { program: 'choco', args: ['install', '{id}', '-y'] },
        'choco.upgrade': { program: 'choco', args: ['upgrade', '{id}', '-y'] },
        'choco.uninstall': { program: 'choco', args: ['uninstall', '{id}', '-y'] }
    }

    /**
     * Builds a safe command object from a template and parameters
     * @param template Template key
     * @param params Key-value pairs for replacement (e.g. { id: '...' })
     * @throws Error if parameters are invalid
     */
    static build(template: CommandTemplate, params: Record<string, string> = {}): { program: string, args: string[] } {
        const tmpl = this.templates[template]
        const args: string[] = []

        for (const arg of tmpl.args) {
            let processedArg = arg
            for (const [key, value] of Object.entries(params)) {
                const placeholder = `{${key}}`
                if (processedArg.includes(placeholder)) {
                    // Validation logic
                    if (key === 'id') {
                        if (!Validator.validatePackageId(value)) {
                            throw new Error(`Invalid Package ID: ${value}`)
                        }
                    } else if (key === 'query') {
                        if (!Validator.validateSearchQuery(value)) {
                            throw new Error(`Invalid Search Query: ${value}`)
                        }
                    } else if (key === 'version') {
                        if (!Validator.validatePackageId(value)) {
                            throw new Error(`Invalid Version: ${value}`)
                        }
                    }

                    // Safe replacement
                    const safeValue = (key === 'query') ? Validator.sanitize(value) : value.trim()
                    processedArg = processedArg.replace(placeholder, safeValue)
                }
            }
            args.push(processedArg)
        }

        return { program: tmpl.program, args }
    }
}
