import { useMemo, useState } from "react"
import { FlatList, Modal, TextInput } from "react-native"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"
import { tw } from "../lib/tw"
import { Box, Btn, Txt } from "./styled"
import { Check, ChevronDown } from "./ui-icons"

export interface ComboBoxOption {
  key: string
  label: string
}

export interface ComboBoxProps {
  options: ComboBoxOption[]
  /** Controlled text shown in the field (the typeahead filter query). */
  inputValue: string
  onInputValueChange: (value: string) => void
  /** Controlled selected option key, or `undefined` when nothing is selected. */
  selectedKey?: string
  onSelectionChange?: (key: string) => void
  placeholder?: string
  isDisabled?: boolean
  fullWidth?: boolean
  className?: string
  /** Empty-state text shown when no option matches the current query. */
  noResultsText?: string
  "aria-label"?: string
}

/**
 * Typeahead-filterable select. A text field that filters `options` by
 * substring match against `inputValue` and opens a bottom-sheet `Modal`
 * (mirroring the `UserButton` menu pattern) listing the filtered rows; the
 * currently `selectedKey` renders with a trailing `Check`. Controlled
 * end-to-end — the parent owns both `inputValue` and `selectedKey`.
 */
export function ComboBox({
  options,
  inputValue,
  onInputValueChange,
  selectedKey,
  onSelectionChange,
  placeholder,
  isDisabled = false,
  fullWidth = true,
  className,
  noResultsText = "No results found",
  "aria-label": ariaLabel
}: ComboBoxProps) {
  const colors = useThemeColors()
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = inputValue.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    )
  }, [options, inputValue])

  const close = () => setOpen(false)

  const handleSelect = (option: ComboBoxOption) => {
    onSelectionChange?.(option.key)
    onInputValueChange(option.label)
    close()
  }

  return (
    <>
      <Btn
        disabled={isDisabled}
        onPress={() => setOpen(true)}
        className={cn(
          "h-11 flex-row items-center rounded-lg border border-border pl-3",
          fullWidth && "w-full",
          isDisabled && "opacity-50",
          className
        )}
      >
        <TextInput
          value={inputValue}
          onChangeText={(text) => {
            onInputValueChange(text)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          editable={!isDisabled}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={ariaLabel}
          style={tw("h-full flex-1 text-base text-foreground", colors)}
        />
        <Box className="h-full items-center justify-center px-2">
          <ChevronDown width={16} height={16} color={colors.muted} />
        </Box>
      </Btn>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Btn className="flex-1 justify-end bg-black/30" onPress={close}>
          <Btn
            className="max-h-[60%] gap-1 rounded-t-2xl border border-border bg-surface p-2"
            onPress={(event) => event.stopPropagation()}
          >
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Box className="items-center justify-center px-3 py-6">
                  <Txt className="text-sm text-muted">{noResultsText}</Txt>
                </Box>
              }
              renderItem={({ item }) => {
                const isSelected = item.key === selectedKey
                return (
                  <Btn
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleSelect(item)}
                    className="flex-row items-center gap-2 rounded-lg px-3 py-2"
                  >
                    <Txt className="flex-1 text-sm text-foreground">
                      {item.label}
                    </Txt>
                    {isSelected && (
                      <Check width={16} height={16} color={colors.accent} />
                    )}
                  </Btn>
                )
              }}
            />
          </Btn>
        </Btn>
      </Modal>
    </>
  )
}
