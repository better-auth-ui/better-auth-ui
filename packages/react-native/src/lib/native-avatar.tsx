import { createContext, useContext } from "react"
import { defaultNativeAvatarConfig, type NativeAvatarConfig } from "./image"
export const NativeAvatarContext = createContext(defaultNativeAvatarConfig)
export const useNativeAvatar = (): NativeAvatarConfig =>
  useContext(NativeAvatarContext)
