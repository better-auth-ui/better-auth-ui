import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusPageActionVariants = cva(
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/85",
        outline:
          "border border-fd-border bg-fd-background text-fd-foreground hover:bg-fd-muted"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
)

export function statusPageActionClassName({
  className,
  variant
}: VariantProps<typeof statusPageActionVariants> & {
  className?: string
} = {}) {
  return cn(statusPageActionVariants({ variant }), className)
}
