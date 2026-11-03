export {
  createAgentPrompt,
  type AgentPromptIntent
} from "../../../../tools/agent-prompts/prompts.ts"

export async function loadPromptMarkdown(
  markdownUrl: string,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(markdownUrl, { signal })
  if (!response.ok) {
    throw new Error(`Could not load page documentation (${response.status}).`)
  }

  return response.text()
}
