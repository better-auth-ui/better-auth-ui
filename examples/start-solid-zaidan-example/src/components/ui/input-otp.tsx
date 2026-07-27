import OtpField, { type RootProps as OtpFieldRootProps } from "@corvu/otp-field"
import { Minus } from "lucide-solid"
import { type ComponentProps, Show, splitProps } from "solid-js"

import { cn } from "@/lib/utils"

type InputOTPProps = OtpFieldRootProps &
  ComponentProps<"div"> &
  Pick<
    ComponentProps<"input">,
    | "aria-describedby"
    | "aria-invalid"
    | "aria-label"
    | "autocomplete"
    | "autofocus"
    | "disabled"
    | "inputmode"
    | "name"
    | "pattern"
    | "required"
  > & {
    containerClass?: string
  }

const InputOTP = (props: InputOTPProps) => {
  const [local, others] = splitProps(props as InputOTPProps, [
    "aria-describedby",
    "aria-invalid",
    "aria-label",
    "autocomplete",
    "autofocus",
    "class",
    "containerClass",
    "children",
    "id",
    "disabled",
    "inputmode",
    "name",
    "pattern",
    "required",
    "value",
    "onValueChange"
  ])

  return (
    <OtpField
      data-slot="input-otp"
      spellcheck={false}
      class={cn(
        "z-input-otp flex items-center has-disabled:opacity-50",
        local.containerClass
      )}
      {...others}
    >
      <OtpField.Input
        id={local.id}
        data-slot="input-otp-input"
        aria-describedby={local["aria-describedby"]}
        aria-invalid={local["aria-invalid"]}
        aria-label={local["aria-label"]}
        autocomplete={local.autocomplete}
        autofocus={local.autofocus}
        class={cn("z-input-otp-input disabled:cursor-not-allowed", local.class)}
        spellcheck={false}
        disabled={local.disabled}
        inputMode={local.inputmode}
        name={local.name}
        pattern={local.pattern}
        required={local.required}
        value={local.value}
        onChange={(e) => local.onValueChange?.(e.target.value)}
      />
      {local.children}
    </OtpField>
  )
}

type InputOTPGroupProps = ComponentProps<"div">

const InputOTPGroup = (props: InputOTPGroupProps) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div
      data-slot="input-otp-group"
      class={cn("z-input-otp-group flex items-center", local.class)}
      {...others}
    />
  )
}

type InputOTPSlotProps = ComponentProps<"div"> & {
  index: number
}

const InputOTPSlot = (props: InputOTPSlotProps) => {
  const [local, others] = splitProps(props, ["index", "class"])
  const context = OtpField.useContext()

  const char = () => context.value()[local.index]
  const isActive = () => context.activeSlots().includes(local.index)
  const showCaret = () => isActive() && context.isInserting()

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive()}
      class={cn(
        "relative z-input-otp-slot flex items-center justify-center data-[active=true]:z-10",
        local.class
      )}
      {...others}
    >
      {char()}
      <Show when={showCaret()}>
        <div class="pointer-events-none absolute inset-0 z-input-otp-caret flex items-center justify-center">
          <div class="z-input-otp-caret-line h-4 w-px animate-caret-blink bg-foreground" />
        </div>
      </Show>
    </div>
  )
}

type InputOTPSeparatorProps = ComponentProps<"div">

const InputOTPSeparator = (props: InputOTPSeparatorProps) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div
      data-slot="input-otp-separator"
      class={cn("z-input-otp-separator flex items-center", local.class)}
      aria-hidden="true"
      {...others}
    >
      <Minus />
    </div>
  )
}

export {
  InputOTP,
  InputOTPGroup,
  type InputOTPGroupProps,
  type InputOTPProps,
  InputOTPSeparator,
  type InputOTPSeparatorProps,
  InputOTPSlot,
  type InputOTPSlotProps
}
