import { useAuth } from "@better-auth-ui/solid"

export function SignIn() {
  const auth = useAuth()

  return (
    <form aria-label="Sign in">
      <h1>Sign in</h1>
      <p>Solid auth base path: {auth.basePaths.auth}</p>
      <button type="submit">Continue</button>
    </form>
  )
}
