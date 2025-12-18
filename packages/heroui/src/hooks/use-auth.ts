import {
  type AnyAuthConfig,
  useAuth as useAuthPrimitive
} from "@better-auth-ui/react"
import { deepmerge } from "@better-auth-ui/react/core"
import { toast } from "sonner"

const extendConfig: AnyAuthConfig = {
  toast
}

export function useAuth(config?: AnyAuthConfig) {
  return useAuthPrimitive(deepmerge(extendConfig, config || {}))
}
