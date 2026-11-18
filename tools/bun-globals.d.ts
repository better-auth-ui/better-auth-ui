// Types for the Bun runtime APIs that the workspace tools use. The workspace
// does not install bun-types, so these declarations cover only those APIs.

interface ImportMeta {
  /** Absolute path of the directory that contains the current module. */
  readonly dir: string
}

declare const Bun: {
  spawnSync(
    command: string[],
    options: {
      cwd?: string
      env?: Record<string, string | undefined>
      stdout?: "pipe" | "inherit" | "ignore"
      stderr?: "pipe" | "inherit" | "ignore"
    }
  ): { exitCode: number | null; stdout: Buffer; stderr: Buffer }
  YAML: {
    parse(input: string): unknown
  }
}
