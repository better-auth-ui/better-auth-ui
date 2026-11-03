import type * as Workers from "@cloudflare/workers-types"

declare global {
  type Fetcher = Workers.Fetcher
}
