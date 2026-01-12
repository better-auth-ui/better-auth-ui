"use client"

import { createContext } from "react"
import type { AuthConfig } from "./auth-config"

export const AuthContext = createContext<AuthConfig | undefined>(undefined)
