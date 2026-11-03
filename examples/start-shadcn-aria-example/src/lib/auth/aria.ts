import { createElement, type ComponentProps, type ReactElement } from "react"
import { Pressable, type Placement } from "react-aria-components"

/** Map the auth menu's side and alignment onto React Aria placement. */
export function getMenuPlacement(
  side: "top" | "right" | "bottom" | "left" = "bottom",
  align: "center" | "end" | "start" = "start"
): Placement {
  if (align === "center") return side
  if (side === "left" || side === "right") {
    return `${side} ${align === "start" ? "top" : "bottom"}`
  }
  return `${side} ${align}`
}

/** Native buttons need Pressable to receive the menu trigger events. */
export function renderMenuTrigger(trigger: ReactElement) {
  return typeof trigger.type === "string"
    ? createElement(Pressable, {
        children: trigger as ComponentProps<typeof Pressable>["children"]
      })
    : trigger
}
