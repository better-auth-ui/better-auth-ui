import { useCopyToClipboard } from "@better-auth-ui/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "fumadocs-ui/components/tabs"
import { buttonVariants } from "fumadocs-ui/components/ui/button"
import { Check, Copy, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  createAgentPrompt,
  loadPromptMarkdown,
  type AgentPromptIntent
} from "@/lib/agent-prompts"

interface AgentPromptProps {
  title?: string
  docsPath?: string
  markdownUrl?: string
}

interface MarkdownState {
  url: string
  content?: string
  error?: boolean
}

function usePromptMarkdown(url: string) {
  const [state, setState] = useState<MarkdownState>()
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ url })

    loadPromptMarkdown(url, controller.signal).then(
      (content) => {
        if (!controller.signal.aborted) setState({ url, content })
      },
      () => {
        if (!controller.signal.aborted) setState({ url, error: true })
      }
    )

    return () => controller.abort()
  }, [url, attempt])

  return {
    content: state?.url === url ? state.content : undefined,
    error: state?.url === url && state.error,
    retry: () => setAttempt((value) => value + 1)
  }
}

export function AgentPromptButton({
  title = "Better Auth UI",
  docsPath = "/docs",
  markdownUrl = "/docs/index.md"
}: AgentPromptProps) {
  const [open, setOpen] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const markdown = usePromptMarkdown(markdownUrl)
  const { copied, copy } = useCopyToClipboard({
    onError: () => {
      setCopyError(true)
      setOpen(true)
    }
  })
  const ready = markdown.content !== undefined
  const prompt = createAgentPrompt({
    intent: "integrate",
    title,
    docsPath,
    markdown: markdown.content
  })

  return (
    <div className="agent-prompt-actions">
      <button
        type="button"
        className={buttonVariants({ variant: "secondary", size: "sm" })}
        disabled={!ready && !markdown.error}
        aria-busy={!ready && !markdown.error}
        onClick={() => {
          setCopyError(false)
          if (ready) void copy(prompt)
          else setOpen(true)
        }}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? "Copied!" : "Copy agent prompt"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Agent prompt copied" : ""}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          aria-label="Preview integration and upgrade prompts"
          onClick={() => setCopyError(false)}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <FileText aria-hidden="true" />
        </DialogTrigger>
        <DialogContent className="agent-prompt-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Use your coding agent</DialogTitle>
            <DialogDescription>
              Copy a prompt into your agent to integrate this page or update
              Better Auth UI. The prompt includes the page documentation.
            </DialogDescription>
          </DialogHeader>
          {copyError && (
            <p role="alert">
              Could not copy. Select and copy the prompt below.
            </p>
          )}
          <PromptContent
            title={title}
            docsPath={docsPath}
            markdown={markdown}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function AgentPromptBlock({
  title = "Better Auth UI",
  docsPath = "/docs",
  markdownUrl = "/docs/index.md"
}: AgentPromptProps) {
  const markdown = usePromptMarkdown(markdownUrl)

  return (
    <div className="agent-prompt-block not-prose">
      <PromptContent title={title} docsPath={docsPath} markdown={markdown} />
    </div>
  )
}

function PromptContent({
  title,
  docsPath,
  markdown
}: {
  title: string
  docsPath: string
  markdown: ReturnType<typeof usePromptMarkdown>
}) {
  return (
    <Tabs defaultValue="integrate">
      <TabsList aria-label="Agent task">
        <TabsTrigger value="integrate">Integrate this page</TabsTrigger>
        <TabsTrigger value="upgrade">Update Better Auth UI</TabsTrigger>
      </TabsList>
      {(["integrate", "upgrade"] as const).map((intent) => (
        <TabsContent key={intent} value={intent}>
          <PromptPreview
            title={title}
            docsPath={docsPath}
            intent={intent}
            markdown={markdown}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function PromptPreview({
  title,
  docsPath,
  intent,
  markdown
}: {
  title: string
  docsPath: string
  intent: AgentPromptIntent
  markdown: ReturnType<typeof usePromptMarkdown>
}) {
  const { copied, copy } = useCopyToClipboard()
  const [copyError, setCopyError] = useState(false)
  const prompt = createAgentPrompt({
    intent,
    title,
    docsPath,
    markdown: markdown.content
  })
  const ready = markdown.content !== undefined

  return (
    <div className="flex flex-col gap-3">
      <p className="agent-prompt-description">
        {intent === "integrate"
          ? "Add this feature using your existing stack and conventions."
          : "Patch upstream changes, add new files, remove obsolete files, and migrate usage while preserving your customizations."}
      </p>
      {markdown.error ? (
        <div role="alert" className="flex flex-col items-start gap-2">
          <p>Could not load the page documentation.</p>
          <button
            type="button"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            onClick={markdown.retry}
          >
            Retry
          </button>
        </div>
      ) : !ready ? (
        <p role="status">Loading page documentation…</p>
      ) : (
        <pre
          className="agent-prompt-text"
          tabIndex={0}
          aria-label={`${intent === "integrate" ? "Integration" : "Upgrade"} prompt`}
        >
          {prompt}
        </pre>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!ready}
          className={buttonVariants({ variant: "secondary", size: "sm" })}
          onClick={async () => setCopyError(!(await copy(prompt)))}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copied!" : "Copy prompt"}
        </button>
        <span role="status" className="sr-only">
          {copied ? "Agent prompt copied" : ""}
        </span>
        {copyError && (
          <p role="alert">Could not copy. Select and copy the prompt above.</p>
        )}
      </div>
    </div>
  )
}
