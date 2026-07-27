import { useAuth } from "@better-auth-ui/solid"
import { Monitor, Moon, Sun } from "lucide-solid"
import type { JSX } from "solid-js"
import { createSignal, For, onMount } from "solid-js"
import {
  resolveThemePluginState,
  type ThemeOption
} from "@/components/auth/theme/theme-plugin-state"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { applyThemePreference, type ThemeMode } from "@/lib/theme"

type ThemePreviewSvgProps = JSX.SvgSVGAttributes<SVGSVGElement>

function ThemePreviewLightPaths() {
  return (
    <>
      <path
        d="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"
        fill="white"
      />
      <path
        d="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"
        stroke="#E4E4E7"
      />
      <path
        d="M32 48.5C32 45.4624 34.4624 43 37.5 43H67.5C70.5376 43 73 45.4624 73 48.5C73 51.5376 70.5376 54 67.5 54H37.5C34.4624 54 32 51.5376 32 48.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M17 105C17 101.686 19.6863 99 23 99H67C70.3137 99 73 101.686 73 105C73 108.314 70.3137 111 67 111H23C19.6863 111 17 108.314 17 105Z"
        fill="#F4F4F5"
      />
      <path
        d="M88 25.5C88 22.4624 90.4624 20 93.5 20H207.5C210.538 20 213 22.4624 213 25.5C213 28.5376 210.538 31 207.5 31H93.5C90.4624 31 88 28.5376 88 25.5Z"
        fill="#E4E4E7"
      />
      <path
        d="M88 105C88 101.686 90.6863 99 94 99H189C192.314 99 195 101.686 195 105C195 108.314 192.314 111 189 111H94C90.6863 111 88 108.314 88 105Z"
        fill="#F4F4F5"
      />
      <path
        d="M88 51C88 46.5817 91.5817 43 96 43H221C225.418 43 229 46.5817 229 51V85C229 89.4183 225.418 93 221 93H96C91.5817 93 88 89.4183 88 85V51Z"
        fill="#F4F4F5"
      />
      <path
        d="M17 48.5C17 45.4624 19.4624 43 22.5 43C25.5376 43 28 45.4624 28 48.5C28 51.5376 25.5376 54 22.5 54C19.4624 54 17 51.5376 17 48.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M17 66.5C17 63.4624 19.4624 61 22.5 61C25.5376 61 28 63.4624 28 66.5C28 69.5376 25.5376 72 22.5 72C19.4624 72 17 69.5376 17 66.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M17 86.5C17 83.4624 19.4624 81 22.5 81C25.5376 81 28 83.4624 28 86.5V87.5C28 90.5376 25.5376 93 22.5 93C19.4624 93 17 90.5376 17 87.5V86.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M32 25.5C32 22.4624 34.4624 20 37.5 20H67.5C70.5376 20 73 22.4624 73 25.5C73 28.5376 70.5376 31 67.5 31H37.5C34.4624 31 32 28.5376 32 25.5Z"
        fill="#E4E4E7"
      />
      <path
        d="M32 66.5C32 63.4624 34.4624 61 37.5 61H67.5C70.5376 61 73 63.4624 73 66.5C73 69.5376 70.5376 72 67.5 72H37.5C34.4624 72 32 69.5376 32 66.5Z"
        fill="#F4F4F5"
      />
      <path
        d="M32 87C32 83.6863 34.6863 81 38 81H67C70.3137 81 73 83.6863 73 87C73 90.3137 70.3137 93 67 93H38C34.6863 93 32 90.3137 32 87Z"
        fill="#F4F4F5"
      />
      <circle cx="22.5" cy="25.5" fill="#E4E4E7" r="5.5" />
    </>
  )
}

function ThemePreviewDarkPaths() {
  return (
    <>
      <path
        d="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"
        fill="black"
      />
      <path
        d="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"
        stroke="#3F3F46"
      />
      <path
        d="M32 48.5C32 45.4624 34.4624 43 37.5 43H67.5C70.5376 43 73 45.4624 73 48.5C73 51.5376 70.5376 54 67.5 54H37.5C34.4624 54 32 51.5376 32 48.5Z"
        fill="#27272A"
      />
      <path
        d="M17 105C17 101.686 19.6863 99 23 99H67C70.3137 99 73 101.686 73 105C73 108.314 70.3137 111 67 111H23C19.6863 111 17 108.314 17 105Z"
        fill="#27272A"
      />
      <path
        d="M88 25.5C88 22.4624 90.4624 20 93.5 20H207.5C210.538 20 213 22.4624 213 25.5C213 28.5376 210.538 31 207.5 31H93.5C90.4624 31 88 28.5376 88 25.5Z"
        fill="#3F3F46"
      />
      <path
        d="M88 105C88 101.686 90.6863 99 94 99H189C192.314 99 195 101.686 195 105C195 108.314 192.314 111 189 111H94C90.6863 111 88 108.314 88 105Z"
        fill="#27272A"
      />
      <path
        d="M88 51C88 46.5817 91.5817 43 96 43H221C225.418 43 229 46.5817 229 51V85C229 89.4183 225.418 93 221 93H96C91.5817 93 88 89.4183 88 85V51Z"
        fill="#27272A"
      />
      <path
        d="M17 48.5C17 45.4624 19.4624 43 22.5 43C25.5376 43 28 45.4624 28 48.5C28 51.5376 25.5376 54 22.5 54C19.4624 54 17 51.5376 17 48.5Z"
        fill="#27272A"
      />
      <path
        d="M17 66.5C17 63.4624 19.4624 61 22.5 61C25.5376 61 28 63.4624 28 66.5C28 69.5376 25.5376 72 22.5 72C19.4624 72 17 69.5376 17 66.5Z"
        fill="#27272A"
      />
      <path
        d="M17 86.5C17 83.4624 19.4624 81 22.5 81C25.5376 81 28 83.4624 28 86.5V87.5C28 90.5376 25.5376 93 22.5 93C19.4624 93 17 90.5376 17 87.5V86.5Z"
        fill="#27272A"
      />
      <path
        d="M32 25.5C32 22.4624 34.4624 20 37.5 20H67.5C70.5376 20 73 22.4624 73 25.5C73 28.5376 70.5376 31 67.5 31H37.5C34.4624 31 32 28.5376 32 25.5Z"
        fill="#3F3F46"
      />
      <path
        d="M32 66.5C32 63.4624 34.4624 61 37.5 61H67.5C70.5376 61 73 63.4624 73 66.5C73 69.5376 70.5376 72 67.5 72H37.5C34.4624 72 32 69.5376 32 66.5Z"
        fill="#27272A"
      />
      <path
        d="M32 87C32 83.6863 34.6863 81 38 81H67C70.3137 81 73 83.6863 73 87C73 90.3137 70.3137 93 67 93H38C34.6863 93 32 90.3137 32 87Z"
        fill="#27272A"
      />
      <circle cx="22.5" cy="25.5" fill="#3F3F46" r="5.5" />
    </>
  )
}

function ThemePreviewSystem(props: ThemePreviewSvgProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 240 117"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="System theme preview"
      {...props}
    >
      <defs>
        <clipPath id="systemDiagonalLight">
          <polygon points="0,0 240,0 0,117" />
        </clipPath>
        <clipPath id="systemDiagonalDark">
          <polygon points="240,0 240,117 0,117" />
        </clipPath>
      </defs>
      <g clip-path="url(#systemDiagonalLight)">
        <ThemePreviewLightPaths />
      </g>
      <g clip-path="url(#systemDiagonalDark)">
        <ThemePreviewDarkPaths />
      </g>
    </svg>
  )
}

function ThemePreviewLight(props: ThemePreviewSvgProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 240 117"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Light"
      {...props}
    >
      <ThemePreviewLightPaths />
    </svg>
  )
}

function ThemePreviewDark(props: ThemePreviewSvgProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 240 117"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dark"
      {...props}
    >
      <ThemePreviewDarkPaths />
    </svg>
  )
}

function ThemePreview(props: { mode: ThemeMode }) {
  if (props.mode === "light")
    return <ThemePreviewLight class="aspect-[240/117] w-full rounded-md" />
  if (props.mode === "dark")
    return <ThemePreviewDark class="aspect-[240/117] w-full rounded-md" />

  return <ThemePreviewSystem class="aspect-[240/117] w-full rounded-md" />
}

export type AppearanceProps = {
  class?: string
}

const themeIcon = (value: ThemeMode) => {
  if (value === "light") return Sun
  if (value === "dark") return Moon

  return Monitor
}

const themeLabel = (
  localization: ReturnType<typeof resolveThemePluginState>["localization"],
  option: ThemeOption
) => localization[option.value]

export function Appearance(props: AppearanceProps = {}) {
  const auth = useAuth()
  const themeState = () => resolveThemePluginState(auth.plugins)
  const [theme, setTheme] = createSignal<ThemeMode>(themeState().theme)

  onMount(() => {
    const initialTheme = themeState().theme

    setTheme(initialTheme)
    applyThemePreference(initialTheme)
  })

  const selectTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme)
    themeState().setTheme(nextTheme)
  }

  return (
    <div class={props.class}>
      <h2 class="mb-3 text-sm font-semibold">
        {themeState().localization.appearance}
      </h2>
      <Card>
        <CardContent>
          <Field>
            <FieldLabel>{themeState().localization.theme}</FieldLabel>
            <RadioGroup
              class="grid grid-cols-2 gap-3 sm:grid-cols-3"
              onChange={(value) => selectTheme(value as ThemeMode)}
              value={theme()}
            >
              <For each={themeState().themes}>
                {(option) => {
                  const Icon = themeIcon(option.value)

                  return (
                    <FieldLabel for={`theme-${option.value}`}>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <div class="flex items-center justify-between gap-2">
                            <FieldTitle>
                              <Icon class="text-muted-foreground" />
                              {themeLabel(themeState().localization, option)}
                            </FieldTitle>
                            <RadioGroupItem
                              id={`theme-${option.value}`}
                              value={option.value}
                            />
                          </div>
                          <ThemePreview mode={option.value} />
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  )
                }}
              </For>
            </RadioGroup>
          </Field>
        </CardContent>
      </Card>
    </div>
  )
}
