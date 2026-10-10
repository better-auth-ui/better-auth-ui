import { createContext, useContext } from "react"
import { defaultNativeAvatarConfig } from "./image"
export const NativeAvatarContext = createContext(defaultNativeAvatarConfig)
export const useNativeAvatar = () => useContext(NativeAvatarContext)
