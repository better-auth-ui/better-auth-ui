import { createContext, type JSX, type ReactNode, useContext } from "react"

const NativeLocaleContext = createContext<{
  languageTag?: string
  direction: "ltr" | "rtl"
}>({ direction: "ltr" })
export const useNativeLocale = () => useContext(NativeLocaleContext)
export function NativeLocaleProvider({
  locale,
  children
}: {
  locale: { languageTag?: string; direction: "ltr" | "rtl" }
  children: ReactNode
}): JSX.Element {
  return (
    <NativeLocaleContext.Provider value={locale}>
      {children}
    </NativeLocaleContext.Provider>
  )
}
