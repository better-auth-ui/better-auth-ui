"use client"
import { create } from "@orama/orama"
import { useDocsSearch } from "fumadocs-core/search/client"
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps
} from "fumadocs-ui/components/dialog/search"
import { useI18n } from "fumadocs-ui/contexts/i18n"

/**
 * Initialize an Orama search instance configured for English with a single string field named `_`.
 *
 * @returns An Orama instance configured with a schema containing a `_` string field and language set to English.
 */
function initOrama() {
  return create({
    schema: { _: "string" },
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: "english"
  })
}

/**
 * Renders a searchable dialog wired to the docs search state and Orama index.
 *
 * Uses the current locale and a static Orama initializer to manage search state via `useDocsSearch`.
 * The rendered SearchDialog receives the current `search` value, `setSearch` as the change handler,
 * `isLoading` from the query state, and all other `props` are forwarded to the underlying dialog.
 * The list of results is passed to SearchDialogList only when `query.data` is not the string `"empty"`.
 *
 * @param props - Props forwarded to the underlying SearchDialog component
 * @returns A SearchDialog React element configured with docs search behavior and UI chrome
 */
export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n() // (optional) for i18n
  const { search, setSearch, query } = useDocsSearch({
    type: "static",
    initOrama,
    locale
  })

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== "empty" ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  )
}
