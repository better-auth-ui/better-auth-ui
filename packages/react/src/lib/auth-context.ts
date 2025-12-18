"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import { createContext } from "react"

export const AuthContext = createContext<AnyAuthConfig | undefined>(undefined)
