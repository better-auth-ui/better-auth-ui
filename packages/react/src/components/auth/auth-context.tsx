"use client"

import { createContext } from "react"
import type { ReactAuthConfig } from "./auth-provider"

/** Split from `auth-provider` so HMR reloading that file does not replace this context instance. */
export const AuthContext = createContext<ReactAuthConfig | undefined>(undefined)
