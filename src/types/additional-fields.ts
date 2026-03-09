import type { ReactNode } from "react"

export type FieldType = "string" | "number" | "boolean" | "select"

export interface AdditionalField {
    description?: ReactNode
    instructions?: ReactNode
    label: ReactNode
    placeholder?: string
    required?: boolean
    type: FieldType
    /**
     * Render a multi-line textarea for string fields
     */
    multiline?: boolean
    validate?: (value: string) => Promise<boolean>
}

export interface AdditionalFields {
    [key: string]: AdditionalField
}
