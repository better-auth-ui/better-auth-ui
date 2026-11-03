import type {
  TablePersistenceAdapters,
  TableStorageAdapter
} from "@better-auth-ui/core"
import { createContext, type ReactNode, useContext, useMemo } from "react"

/** Keep table preferences for the app session, or supply synchronous native storage. */
export function createNativeTablePersistenceAdapters(
  storage?: TableStorageAdapter
): TablePersistenceAdapters {
  let search = new URLSearchParams()
  const values = new Map<string, string>()
  return {
    search: {
      read: () => new URLSearchParams(search),
      replace: (params) => {
        search = new URLSearchParams(params)
      },
      // This adapter owns app-session state; router adapters can subscribe to navigation.
      subscribe: () => () => {}
    },
    storage: storage ?? {
      read: (key) => values.get(key) ?? null,
      write: (key, value) => {
        values.set(key, value)
      }
    }
  }
}

const NativeTablePersistenceContext = createContext<
  TablePersistenceAdapters | undefined
>(undefined)

export function NativeTablePersistenceProvider({
  adapters,
  children
}: {
  adapters?: TablePersistenceAdapters
  children: ReactNode
}) {
  const fallback = useMemo(() => createNativeTablePersistenceAdapters(), [])
  return (
    <NativeTablePersistenceContext.Provider value={adapters ?? fallback}>
      {children}
    </NativeTablePersistenceContext.Provider>
  )
}

export function useNativeTablePersistence() {
  const adapters = useContext(NativeTablePersistenceContext)
  const fallback = useMemo(() => createNativeTablePersistenceAdapters(), [])
  return adapters ?? fallback
}
