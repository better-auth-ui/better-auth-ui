import {
  SignInUsername,
  type SignInUsernameProps
} from "./username/sign-in-username"

export type SignInProps = SignInUsernameProps

export function SignIn(props: SignInProps) {
  return <SignInUsername {...props} />
}
