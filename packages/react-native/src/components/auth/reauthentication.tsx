import { authQueryKeys } from "@better-auth-ui/core"
import { useAuth, useSignOut } from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState
} from "react"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { AlertDialog } from "../../primitives/alert-dialog"
import { Button } from "../../primitives/button"
import { Description } from "../../primitives/description"
import { Box, Txt } from "../../primitives/styled"
import { toast } from "../../primitives/toast"

type Recovery = {
  retry: () => Promise<unknown>
  destination: string
  userId?: string
}
type RecoveryContext = {
  capture: (retry: () => Promise<unknown>) => void
  complete: () => Promise<boolean>
}
const ReauthenticationContext = createContext<RecoveryContext | null>(null)
export function useNativeReauthentication() {
  const context = useContext(ReauthenticationContext)
  if (!context) throw new Error("Reauthentication requires AuthProvider.")
  return context
}

/** Keep a failed action across native navigation and retry after fresh sign-in. */
export function ReauthenticationProvider({
  children
}: {
  children: ReactNode
}) {
  const { authClient, localization } = useAuth()
  const navigation = useAuthNavigation()
  const queryClient = useQueryClient()
  const pending = useRef<Recovery | null>(null)
  const [offered, setOffered] = useState(false)
  const signOut = useSignOut(authClient)
  const capture = useCallback(
    (retry: () => Promise<unknown>) => {
      if (pending.current || navigation.getParam("reauthenticate") === "true")
        return
      const cached = queryClient.getQueryData<{ user: { id: string } }>(
        authQueryKeys.session
      )
      pending.current = {
        retry,
        destination: navigation.getPath?.() ?? "/",
        userId: cached?.user.id
      }
      setOffered(true)
    },
    [navigation, queryClient]
  )
  const complete = useCallback(async () => {
    const action = pending.current
    if (!action) return false
    pending.current = null
    setOffered(false)
    const cached = queryClient.getQueryData<{ user: { id: string } }>(
      authQueryKeys.session
    )
    if (!action.userId || cached?.user.id !== action.userId) {
      toast.danger(localization.errors.permissionDenied)
      navigation.navigate({ to: action.destination, replace: true })
      return true
    }
    navigation.navigate({ to: action.destination, replace: true })
    try {
      await action.retry()
    } catch {
      /* The query or mutation error handler presents the retry failure. */
    }
    return true
  }, [localization.errors.permissionDenied, navigation, queryClient])
  return (
    <ReauthenticationContext.Provider value={{ capture, complete }}>
      {children}
      {navigation.getParam("reauthenticate") === "true" ? (
        <ReauthenticationNotice />
      ) : null}
      <AlertDialog
        isOpen={offered}
        onOpenChange={(open) => {
          if (!open && !signOut.isPending) {
            pending.current = null
            setOffered(false)
          }
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.settings.reauthenticationTitle}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <Description>
          {localization.settings.reauthenticationDescription}
        </Description>
        <AlertDialog.Footer>
          <Button
            isDisabled={signOut.isPending}
            onPress={() => {
              pending.current = null
              setOffered(false)
            }}
          >
            {localization.settings.cancel}
          </Button>
          <Button
            isPending={signOut.isPending}
            onPress={() =>
              signOut.mutate(undefined, {
                onSuccess: () => {
                  setOffered(false)
                  navigation.push("signIn", {
                    replace: true,
                    params: {
                      reauthenticate: "true",
                      redirectTo: pending.current?.destination ?? "/"
                    }
                  })
                }
              })
            }
          >
            {localization.settings.reauthenticationAction}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </ReauthenticationContext.Provider>
  )
}

export function ReauthenticationNotice() {
  const { localization } = useAuth()
  return (
    <Box className="gap-2 p-4">
      <Txt className="font-medium">
        {localization.settings.reauthenticationTitle}
      </Txt>
      <Description>
        {localization.settings.reauthenticationDescription}
      </Description>
    </Box>
  )
}
