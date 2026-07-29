import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { demos } from "@/demos"
import { cn } from "@/lib/utils"
import { ComponentPreviewContainer } from "./component-preview-container"

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  align?: "center" | "start" | "end"
  isBgSolid?: boolean
  description?: string
  hideCode?: boolean
  minHeight?: string
}

export function ComponentPreview({
  align = "center",
  className,
  description,
  hideCode = false,
  isBgSolid = false,
  minHeight,
  name,
  ...props
}: ComponentPreviewProps) {
  const Component = demos[name]

  if (!Component) {
    return (
      <div
        className={cn(
          "my-4 rounded-md border border-red-200 bg-red-50 p-4",
          className
        )}
      >
        <p className="text-sm text-red-600">
          Component demo &quot;{name}&quot; not found. Make sure the demo is
          registered in the demos index.
        </p>
      </div>
    )
  }

  return (
    <ComponentPreviewContainer
      align={align}
      className={className}
      description={description}
      hideCode={hideCode}
      isBgSolid={isBgSolid}
      minHeight={minHeight}
      name={name}
      {...props}
    >
      <Suspense
        fallback={
          <Skeleton
            aria-label="Loading demo"
            className="h-32 w-full max-w-md"
            role="status"
          />
        }
      >
        <Component />
      </Suspense>
    </ComponentPreviewContainer>
  )
}
