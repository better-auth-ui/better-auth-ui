import assert from "node:assert/strict"
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile
} from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, relative, resolve } from "node:path"
import { listIntentSkills, loadIntentSkill } from "@tanstack/intent/core"

type SkillPlan = {
  skills: {
    name: string
    package: string
    path: string
    sources: string[]
  }[]
}

const root = resolve(import.meta.dir, "../..")
const bun = process.execPath
const cli = (name: string) => join(root, "node_modules/.bin", name)

function run(command: string[], cwd = root) {
  const result = Bun.spawnSync(command, {
    cwd,
    env: { ...process.env, CI: "1", DISABLE_TELEMETRY: "1" },
    stdout: "pipe",
    stderr: "pipe"
  })
  assert.equal(
    result.exitCode,
    0,
    `${command.join(" ")} failed:\n${result.stdout}\n${result.stderr}`
  )
}

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      assert(
        !entry.isSymbolicLink(),
        `Skill files must not be symlinks: ${path}`
      )
      return entry.isDirectory() ? filesIn(path) : [path]
    })
  )
  return files.flat().sort()
}

async function assertSameFiles(source: string, destination: string) {
  const sourceFiles = await filesIn(source)
  const destinationFiles = await filesIn(destination)
  assert.deepEqual(
    destinationFiles.map((path) => relative(destination, path)),
    sourceFiles.map((path) => relative(source, path))
  )
  for (const path of sourceFiles) {
    assert.deepEqual(
      await readFile(join(destination, relative(source, path))),
      await readFile(path),
      `Skill file changed during distribution: ${path}`
    )
  }
}

run([bun, cli("intent"), "validate", "--check"])

const tree = Bun.YAML.parse(
  await readFile(join(root, "_artifacts/skill_tree.yaml"), "utf8")
) as SkillPlan
const domainMap = Bun.YAML.parse(
  await readFile(join(root, "_artifacts/domain_map.yaml"), "utf8")
) as { skills: { slug: string }[] }
assert((await readFile(join(root, "_artifacts/skill_spec.md"), "utf8")).trim())

const skillNames = tree.skills.map((skill) => skill.name).sort()
assert.equal(
  new Set(skillNames).size,
  skillNames.length,
  "Skill names must be unique"
)
assert.deepEqual(domainMap.skills.map((skill) => skill.slug).sort(), skillNames)

const packages = []
for (const entry of await readdir(join(root, "packages"), {
  withFileTypes: true
})) {
  if (!entry.isDirectory()) continue
  const directory = join(root, "packages", entry.name)
  const manifest = JSON.parse(
    await readFile(join(directory, "package.json"), "utf8")
  )
  if (manifest.private) continue
  assert(
    manifest.files?.includes("skills"),
    `${manifest.name} must publish skills`
  )
  assert(
    manifest.keywords?.includes("tanstack-intent"),
    `${manifest.name} must be discoverable`
  )
  packages.push({ directory, manifest })
}
assert.deepEqual(
  [...new Set(tree.skills.map((skill) => skill.package))].sort(),
  packages.map(({ directory }) => relative(root, directory)).sort(),
  "Every public package needs skill coverage"
)

for (const skill of tree.skills) {
  assert.equal(skill.path, `${skill.package}/skills/${skill.name}/SKILL.md`)
  for (const source of skill.sources) {
    assert(
      (await readFile(join(root, source), "utf8")).trim(),
      `Empty source: ${source}`
    )
  }
  const skillRoot = dirname(join(root, skill.path))
  for (const file of await filesIn(skillRoot)) {
    if (!file.endsWith(".md")) continue
    const content = await readFile(file, "utf8")
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split("#")[0]
      if (!target || /^https?:\/\//.test(target)) continue
      const resolved = resolve(dirname(file), target)
      assert(
        !relative(skillRoot, resolved).startsWith(".."),
        `Reference leaves skill: ${file} -> ${target}`
      )
      await readFile(resolved)
    }
  }
}

const temporary = await mkdtemp(join(tmpdir(), "better-auth-ui-skills-"))
try {
  const consumer = join(temporary, "consumer")
  await mkdir(consumer)
  await writeFile(
    join(consumer, "package.json"),
    JSON.stringify({
      name: "skill-consumer",
      private: true,
      dependencies: Object.fromEntries(
        packages.map(({ manifest }) => [manifest.name, manifest.version])
      ),
      intent: { skills: packages.map(({ manifest }) => manifest.name) }
    })
  )

  for (const { directory, manifest } of packages) {
    const archive = join(temporary, `${manifest.name.replaceAll("/", "-")}.tgz`)
    run([bun, "pm", "pack", "--filename", archive, "--quiet"], directory)
    const installed = join(consumer, "node_modules", manifest.name)
    await mkdir(installed, { recursive: true })
    run(["tar", "-xzf", archive, "--strip-components=1", "-C", installed])
    await assertSameFiles(join(directory, "skills"), join(installed, "skills"))
  }

  const discovered = listIntentSkills({ cwd: consumer })
  assert.deepEqual(
    discovered.skills.map((skill) => skill.skillName).sort(),
    skillNames
  )
  for (const skill of discovered.skills) {
    const loaded = loadIntentSkill(skill.use, { cwd: consumer })
    assert.equal(
      resolve(consumer, loaded.path),
      join(
        consumer,
        "node_modules",
        skill.packageName,
        "skills",
        skill.skillName,
        "SKILL.md"
      )
    )
    assert(loaded.content.trim())
    for (const match of loaded.content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split("#")[0]
      if (!target || /^https?:\/\//.test(target)) continue
      await readFile(resolve(consumer, target))
    }
    const packaged = packages.find(
      ({ manifest }) => manifest.name === skill.packageName
    )
    assert.equal(loaded.version, packaged?.manifest.version)
  }

  run(
    [
      bun,
      cli("skills"),
      "add",
      root,
      "--full-depth",
      "--skill",
      ...skillNames,
      "--agent",
      "universal",
      "--copy",
      "--yes"
    ],
    consumer
  )
  const installedSkills = join(consumer, ".agents/skills")
  assert.deepEqual((await readdir(installedSkills)).sort(), skillNames)
  for (const skill of tree.skills) {
    await assertSameFiles(
      dirname(join(root, skill.path)),
      join(installedSkills, skill.name)
    )
  }
  console.log(
    `Validated ${skillNames.length} skills across ${packages.length} npm packages and skills.sh installation.`
  )
} finally {
  await rm(temporary, { recursive: true, force: true })
}
