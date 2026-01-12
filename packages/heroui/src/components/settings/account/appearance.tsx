import { useAuth } from "@better-auth-ui/react"
import { Display, Moon, Sun } from "@gravity-ui/icons"
import {
  Card,
  cn,
  Label,
  Radio,
  RadioGroup,
  useIsHydrated
} from "@heroui/react"

export type AppearanceProps = {
  className?: string
}

function ThemePreviewSystem(props: React.SVGProps<SVGSVGElement>) {
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
        {/* Diagonal clip for light (top-left) */}
        <clipPath id="systemDiagonalLight">
          <polygon points="0,0 240,0 0,117" />
        </clipPath>
        {/* Diagonal clip for dark (bottom-right) */}
        <clipPath id="systemDiagonalDark">
          <polygon points="240,0 240,117 0,117" />
        </clipPath>
      </defs>

      {/* Light side (top-left diagonal) */}
      <g clipPath="url(#systemDiagonalLight)">
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
      </g>

      {/* Dark side (bottom-right diagonal) */}
      <g clipPath="url(#systemDiagonalDark)">
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
      </g>
    </svg>
  )
}

function ThemePreviewLight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 240 117"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Light"
      {...props}
    >
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
    </svg>
  )
}

function ThemePreviewDark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 240 117"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dark"
      {...props}
    >
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
    </svg>
  )
}

/**
 * Renders a theme selector card with visual theme previews.
 *
 * Displays a card containing radio buttons for selecting between system, light,
 * and dark themes. Each option shows a visual preview of the theme. Only renders
 * if theme settings are configured (theme, setTheme, and themes are provided).
 *
 * @param className - Optional additional CSS class names for the card container.
 * @returns A JSX element containing the theme selector card, or null if theme settings are not configured.
 */
export function Appearance({ className }: AppearanceProps) {
  const {
    localization,
    settings: { theme, setTheme, themes }
  } = useAuth()

  const hydrated = useIsHydrated()

  if (!setTheme || !themes?.length) {
    return null
  }

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.appearance}
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <RadioGroup
          isOnSurface
          value={hydrated ? theme : undefined}
          onChange={setTheme}
          isDisabled={!hydrated || !theme}
        >
          <Label className="mb-2">{localization.settings.theme}</Label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.includes("system") && (
              <Radio
                value="system"
                className={cn(
                  "mt-0 group relative flex-col gap-4 rounded-xl border border-default px-5 py-4 hover:bg-default/20 transition-all data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                  "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10"
                )}
              >
                <Radio.Control className="absolute top-3 right-3 size-5">
                  <Radio.Indicator />
                </Radio.Control>

                <Radio.Content className="flex flex-col gap-3">
                  <Label className="cursor-pointer font-medium flex gap-2 items-center">
                    <Display className="text-muted" />
                    {localization.settings.system}
                  </Label>

                  <ThemePreviewSystem className="w-full" />
                </Radio.Content>
              </Radio>
            )}

            {themes.includes("light") && (
              <Radio
                value="light"
                className={cn(
                  "mt-0 group relative flex-col gap-4 rounded-xl border border-default px-5 py-4 hover:bg-default/20 transition-all data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                  "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10"
                )}
              >
                <Radio.Control className="absolute top-3 right-3 size-5">
                  <Radio.Indicator />
                </Radio.Control>

                <Radio.Content className="flex flex-col gap-3">
                  <Label className="cursor-pointer font-medium flex gap-2 items-center">
                    <Sun className="text-muted" />
                    {localization.settings.light}
                  </Label>

                  <ThemePreviewLight className="w-full" />
                </Radio.Content>
              </Radio>
            )}

            {themes.includes("dark") && (
              <Radio
                value="dark"
                className={cn(
                  "mt-0 group relative flex-col gap-4 rounded-xl border border-default px-5 py-4 hover:bg-default/20 transition-all data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                  "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10"
                )}
              >
                <Radio.Control className="absolute top-3 right-3 size-5">
                  <Radio.Indicator />
                </Radio.Control>

                <Radio.Content className="flex flex-col gap-3">
                  <Label className="cursor-pointer font-medium flex gap-2 items-center">
                    <Moon className="text-muted" />
                    {localization.settings.dark}
                  </Label>

                  <ThemePreviewDark className="w-full" />
                </Radio.Content>
              </Radio>
            )}
          </div>
        </RadioGroup>
      </Card.Content>
    </Card>
  )
}
