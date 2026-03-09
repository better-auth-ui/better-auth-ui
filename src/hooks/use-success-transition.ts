import { useCallback, useContext, useState } from "react"
import { AuthUIContext } from "../lib/auth-ui-provider"
import { getSearchParam } from "../lib/utils"

export function useOnSuccessTransition({
    redirectTo: redirectToProp
}: {
    redirectTo?: string
}) {
    const { redirectTo: contextRedirectTo } = useContext(AuthUIContext)

    const getRedirectTo = useCallback(
        () =>
            redirectToProp || getSearchParam("redirectTo") || contextRedirectTo,
        [redirectToProp, contextRedirectTo]
    )

    const [isPending, setIsPending] = useState(false)

    const {
        navigate,
        hooks: { useSession },
        onSessionChange
    } = useContext(AuthUIContext)

    const { refetch: refetchSession } = useSession()

    const onSuccess = useCallback(async () => {
        setIsPending(true)

        await refetchSession?.()

        if (onSessionChange) await onSessionChange()

        setIsPending(false)

        navigate(getRedirectTo())
    }, [refetchSession, onSessionChange, navigate, getRedirectTo])

    return { onSuccess, isPending }
}
