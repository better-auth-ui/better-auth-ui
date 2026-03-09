export type TeamOptions = {
    /**
     * Enable teams feature
     * @default false
     */
    enabled?: boolean
    /**
     * Custom roles to add to the built-in team roles (admin, member)
     * @default []
     */
    customRoles?: Array<{ role: string; label: string }>
    /**
     * Team color configuration
     * Define custom CSS variables for team colors
     * @default Uses --team-1 through --team-5
     */
    colors?: {
        /**
         * Number of predefined team colors
         * @default 5
         */
        count?: number
        /**
         * CSS variable prefix
         * @default "team"
         */
        prefix?: string
    }
}

export type TeamOptionsContext = {
    /**
     * Enable teams feature
     */
    enabled: boolean
    /**
     * Custom roles to add to the built-in team roles (admin, member)
     */
    customRoles: Array<{ role: string; label: string }>
    /**
     * Team color configuration
     */
    colors: {
        count: number
        prefix: string
    }
}
