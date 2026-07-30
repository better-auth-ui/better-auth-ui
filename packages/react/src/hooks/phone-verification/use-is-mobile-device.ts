"use client"

import { useEffect, useState } from "react"

const mobilePattern = /android|iphone|ipad|ipod|windows phone|mobile/i

/**
 * Detect whether the page is running on a mobile device, where WhatsApp can
 * be opened directly instead of showing a QR code.
 *
 * Resolves after hydration (SSR renders `false`) so server and client markup
 * stay consistent.
 */
export function useIsMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  useEffect(() => {
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches

    setIsMobileDevice(
      mobilePattern.test(navigator.userAgent) ||
        (coarsePointer && navigator.maxTouchPoints > 0)
    )
  }, [])

  return isMobileDevice
}
