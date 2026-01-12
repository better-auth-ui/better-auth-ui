import { useEffect, useRef, useState } from "react"

export function useIsOverflow<T extends HTMLElement>() {
    const [isOverflow, setIsOverflow] = useState(false)
    const ref = useRef<T>(null)
    const triggerRef = useRef<unknown>(undefined)

    // Monitor overflow state
    useEffect(() => {
        const element = ref.current
        if (!element) {
            setIsOverflow(false)
            return
        }

        // Reset if trigger changed
        const currentTrigger = element.textContent
        if (triggerRef.current !== currentTrigger) {
            triggerRef.current = currentTrigger
            setIsOverflow(false)
        }

        const checkOverflow = () => {
            setIsOverflow(element.offsetWidth < element.scrollWidth)
        }

        // Check immediately
        checkOverflow()

        // Use ResizeObserver to watch for size changes
        const resizeObserver = new ResizeObserver(checkOverflow)
        resizeObserver.observe(element)

        return () => {
            resizeObserver.disconnect()
        }
    })

    return { ref, isOverflow }
}
