/** Mirror physical utility positions while Yoga handles flex direction. */
export function directionalStyle<T extends object>(
  style: T,
  direction: "ltr" | "rtl"
): T {
  if (direction === "ltr") return style
  const result = { ...style } as Record<string, unknown>
  for (const [left, right] of [
    ["left", "right"],
    ["marginLeft", "marginRight"],
    ["paddingLeft", "paddingRight"],
    ["borderLeftWidth", "borderRightWidth"],
    ["borderTopLeftRadius", "borderTopRightRadius"],
    ["borderBottomLeftRadius", "borderBottomRightRadius"]
  ]) {
    const leftValue = result[left!],
      rightValue = result[right!]
    delete result[left!]
    delete result[right!]
    if (rightValue !== undefined) result[left!] = rightValue
    if (leftValue !== undefined) result[right!] = leftValue
  }
  if (result.textAlign === "left") result.textAlign = "right"
  else if (result.textAlign === "right") result.textAlign = "left"
  return result as T
}
