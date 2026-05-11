"use client"

import { fileToBase64 } from "@better-auth-ui/core"
import { Upload } from "lucide-react"
import { type ChangeEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const MAX_LOGO_BYTES = 10 * 1024 * 1024

export type OrganizationFormValues = {
  name: string
  slug: string
  logo?: string
}

export type OrganizationFormFieldsProps = {
  values: OrganizationFormValues
  onChange: (values: OrganizationFormValues) => void
  isPending: boolean
  idPrefix?: string
  className?: string
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function OrganizationFormFields({
  values,
  onChange,
  isPending,
  idPrefix = "org-form",
  className
}: OrganizationFormFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [slugTouched, setSlugTouched] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    slug?: string
  }>({})

  const pending = isPending || isUploading

  function handleNameChange(newName: string) {
    setFieldErrors((prev) => ({ ...prev, name: undefined }))

    if (slugTouched) {
      onChange({ ...values, name: newName })
    } else {
      onChange({ ...values, name: newName, slug: slugify(newName) })
    }
  }

  function handleSlugChange(newSlug: string) {
    setSlugTouched(newSlug.length > 0)
    setFieldErrors((prev) => ({ ...prev, slug: undefined }))
    onChange({ ...values, slug: newSlug })
  }

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ""

    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Logo must be 10MB or smaller.")
      return
    }

    setIsUploading(true)

    try {
      const base64 = await fileToBase64(file)
      onChange({ ...values, logo: base64 })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }

    setIsUploading(false)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Field>
        <Label htmlFor={`${idPrefix}-logo`}>Logo</Label>

        <input
          ref={fileInputRef}
          id={`${idPrefix}-logo`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />

        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={pending}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload organization logo"
            className="cursor-pointer rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Avatar
              className={cn(
                "size-[72px] rounded-md bg-transparent transition-colors",
                !values.logo &&
                  "border-2 border-muted-foreground/40 border-dashed hover:border-muted-foreground/70"
              )}
            >
              <AvatarImage
                src={values.logo ?? undefined}
                alt="Organization logo"
              />

              <AvatarFallback className="rounded-md bg-transparent">
                <Upload className="size-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </button>

          <div className="flex flex-col items-start gap-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading && <Spinner />}
              <Upload className="text-muted-foreground" />
              Upload Logo
            </Button>

            <FieldDescription>
              Recommended size 1:1, up to 10MB.
            </FieldDescription>
          </div>
        </div>
      </Field>

      <Field data-invalid={!!fieldErrors.name}>
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>

        <Input
          id={`${idPrefix}-name`}
          name="name"
          autoComplete="organization"
          placeholder="Acme Inc."
          disabled={pending}
          required
          value={values.name}
          onChange={(e) => handleNameChange(e.target.value)}
          onInvalid={(e) => {
            e.preventDefault()
            setFieldErrors((prev) => ({
              ...prev,
              name: (e.target as HTMLInputElement).validationMessage
            }))
          }}
          aria-invalid={!!fieldErrors.name}
        />

        <FieldError>{fieldErrors.name}</FieldError>
      </Field>

      <Field data-invalid={!!fieldErrors.slug}>
        <Label htmlFor={`${idPrefix}-slug`}>Slug</Label>

        <Input
          id={`${idPrefix}-slug`}
          name="slug"
          placeholder="acme"
          disabled={pending}
          required
          value={values.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          onInvalid={(e) => {
            e.preventDefault()
            setFieldErrors((prev) => ({
              ...prev,
              slug: (e.target as HTMLInputElement).validationMessage
            }))
          }}
          aria-invalid={!!fieldErrors.slug}
        />

        <FieldError>{fieldErrors.slug}</FieldError>
      </Field>
    </div>
  )
}
