import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore
} from "react"

import { authDataCache } from "../lib/auth-data-cache"
import { AuthUIContext } from "../lib/auth-ui-provider"
import { getLocalizedError } from "../lib/utils"
import type { FetchError } from "../types/fetch-error"

export function useAuthData<T>({
    queryFn,
    cacheKey,
    staleTime = 10000 // Default 10 seconds
}: {
    queryFn: () => Promise<{ data: T | null; error?: FetchError | null }>
    cacheKey?: string
    staleTime?: number
}) {
    const {
        hooks: { useSession },
        toast,
        localization,
        localizeErrors
    } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = useSession()

    // Generate a stable cache key based on the queryFn if not provided
    const queryFnRef = useRef(queryFn)
    queryFnRef.current = queryFn

    const stableCacheKey = cacheKey || queryFn.toString()

    // Subscribe to cache updates for this key
    const cacheEntry = useSyncExternalStore(
        useCallback(
            (callback) => authDataCache.subscribe(stableCacheKey, callback),
            [stableCacheKey]
        ),
        useCallback(
            () => authDataCache.get<T>(stableCacheKey),
            [stableCacheKey]
        ),
        useCallback(
            () => authDataCache.get<T>(stableCacheKey),
            [stableCacheKey]
        )
    )

    const initialized = useRef(false)
    const previousUserId = useRef<string | undefined>(undefined)
    const [error, setError] = useState<FetchError | null>(null)

    const refetch = useCallback(async () => {
        // Check if there's already an in-flight request for this key
        const existingRequest = authDataCache.getInFlightRequest<{
            data: T | null
            error?: FetchError | null
        }>(stableCacheKey)
        if (existingRequest) {
            // Wait for the existing request to complete
            try {
                const result = await existingRequest
                if (result.error) {
                    setError(result.error)
                } else {
                    setError(null)
                }
            } catch (err) {
                setError(err as FetchError)
            }
            return
        }

        // Mark as refetching if we have cached data
        if (cacheEntry?.data !== undefined) {
            authDataCache.setRefetching(stableCacheKey, true)
        }

        // Create the fetch promise
        const fetchPromise = queryFnRef.current()

        // Store the promise as in-flight
        authDataCache.setInFlightRequest(stableCacheKey, fetchPromise)

        try {
            const { data, error } = await fetchPromise

            if (error) {
                setError(error)
                toast({
                    variant: "error",
                    message: getLocalizedError({
                        error,
                        localization,
                        localizeErrors
                    })
                })
            } else {
                setError(null)
            }

            // Update cache with new data
            authDataCache.set(stableCacheKey, data)
        } catch (err) {
            const error = err as FetchError
            setError(error)
            toast({
                variant: "error",
                message: getLocalizedError({
                    error,
                    localization,
                    localizeErrors
                })
            })
        } finally {
            authDataCache.setRefetching(stableCacheKey, false)
            authDataCache.removeInFlightRequest(stableCacheKey)
        }
    }, [stableCacheKey, toast, localization, localizeErrors, cacheEntry])

    useEffect(() => {
        const currentUserId = sessionData?.user?.id

        if (!sessionData) {
            // Clear cache when session is lost
            authDataCache.setRefetching(stableCacheKey, false)
            authDataCache.clear(stableCacheKey)
            initialized.current = false
            previousUserId.current = undefined
            return
        }

        // Check if user ID has changed
        const userIdChanged =
            previousUserId.current !== undefined &&
            previousUserId.current !== currentUserId

        // If user changed, clear cache to ensure isPending becomes true
        if (userIdChanged) {
            authDataCache.clear(stableCacheKey)
        }

        // If we have cached data, we're not pending anymore
        const hasCachedData = cacheEntry?.data !== undefined

        // Check if data is stale
        const isStale =
            !cacheEntry || Date.now() - cacheEntry.timestamp > staleTime

        if (
            !initialized.current ||
            !hasCachedData ||
            userIdChanged ||
            (hasCachedData && isStale)
        ) {
            // Only fetch if we don't have data or if the data is stale
            if (!hasCachedData || isStale) {
                initialized.current = true
                refetch()
            }
        }

        // Update the previous user ID
        previousUserId.current = currentUserId
    }, [
        sessionData,
        sessionData?.user?.id,
        stableCacheKey,
        refetch,
        cacheEntry,
        staleTime
    ])

    // Determine if we're in a pending state
    // We're only pending if:
    // 1. Session is still loading, OR
    // 2. We have no cached data and no error
    const isPending =
        sessionPending || (cacheEntry?.data === undefined && !error)

    return {
        data: cacheEntry?.data ?? null,
        isPending,
        isRefetching: cacheEntry?.isRefetching ?? false,
        error,
        refetch
    }
}
