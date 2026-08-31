import { z } from "zod"

export const docsVariantSchema = z.enum([
  "react",
  "solid",
  "shadcn",
  "heroui",
  "zaidan"
])

export type DocsVariant = z.infer<typeof docsVariantSchema>

export const docsVariantFrontmatterSchema = z.object({
  variant: docsVariantSchema.optional()
})
