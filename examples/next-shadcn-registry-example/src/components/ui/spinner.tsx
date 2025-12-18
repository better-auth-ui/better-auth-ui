import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Renders an accessible animated SVG spinner.
 *
 * @param className - Additional CSS class names to merge with the default sizing and animation classes.
 * @param props - Other SVG attributes forwarded to the underlying icon.
 * @returns An SVG element rendering an accessible, animated loading spinner.
 */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }