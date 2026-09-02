"use client"

import {
  getViewURL,
  isPasswordCompromisedError,
  validateMatchingValue,
  validateStringLength
} from "@better-auth-ui/core"
import {
  useAuth,
  useChangePassword,
  useFetchOptions,
  useListAccounts,
  useRequestPasswordReset,
  useSession
} from "@better-auth-ui/react"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { isAuthFormFieldInvalid, useAuthForm } from "../../auth-form"
import { OpenEmailButton } from "../../open-email-button"
import { PasswordStrengthMeter } from "../../password-strength-meter"

export type ChangePasswordProps = {
  className?: string
}

/**
 * Render a card form for changing the authenticated user's password.
 *
 * When the user has a credential account, displays fields for current password,
 * new password, and optionally confirm password. When the user only has social
 * accounts, displays a prompt to set a password via the reset flow.
 *
 * @returns A JSX element containing the change-password or set-password card
 */
export function ChangePassword({ className }: ChangePasswordProps) {
  const { authClient, emailAndPassword, localization } = useAuth()
  const { data: session } = useSession(authClient)
  const { data: accounts, isPending: isAccountsPending } =
    useListAccounts(authClient)

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  )

  if (!isAccountsPending && !hasCredentialAccount) {
    return <SetPassword className={className} />
  }

  return (
    <ChangePasswordForm
      className={className}
      emailAndPassword={emailAndPassword}
      localization={localization}
      session={isAccountsPending ? undefined : session}
    />
  )
}

function SetPassword({ className }: { className?: string }) {
  const { authClient, basePaths, baseURL, localization, plugins, viewPaths } =
    useAuth()
  const { data: session } = useSession(authClient)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const [sentEmail, setSentEmail] = useState("")

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset(
    authClient,
    {
      onError: () => {
        resetFetchOptions()
      },
      onSuccess: (_data, { email }) => {
        setSentEmail(email)
      }
    }
  )

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const handleSetPassword = () => {
    if (!session) return

    requestPasswordReset({
      email: session.user.email,
      redirectTo: getViewURL(
        baseURL,
        basePaths.auth,
        viewPaths.auth.resetPassword
      ),
      fetchOptions
    })
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {localization.settings.changePassword}
      </h2>

      <Card className={cn(className)}>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium leading-tight">
              {localization.settings.setPassword}
            </p>

            <p className="text-muted-foreground text-xs mt-0.5">
              {localization.settings.setPasswordDescription}
            </p>
          </div>

          {sentEmail ? (
            <div className="flex flex-col gap-3 items-start sm:items-end">
              <p className="text-sm" role="status">
                {localization.auth.resetLinkSentTo.replace(
                  "{{email}}",
                  sentEmail
                )}
              </p>

              <OpenEmailButton email={sentEmail} className="w-auto" />
            </div>
          ) : (
            <div className="flex flex-col gap-3 items-start sm:items-end">
              {Captcha && <div>{Captcha}</div>}

              <Button
                size="sm"
                disabled={isPending || !session?.user.email}
                onClick={handleSetPassword}
              >
                {isPending && <Spinner />}

                {localization.auth.sendResetLink}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ChangePasswordForm({
  className,
  emailAndPassword,
  localization,
  session
}: {
  className?: string
  emailAndPassword: ReturnType<typeof useAuth>["emailAndPassword"]
  localization: ReturnType<typeof useAuth>["localization"]
  session: ReturnType<typeof useSession>["data"]
}) {
  const { authClient } = useAuth()
  const { mutate: changePassword, isPending } = useChangePassword(authClient, {
    onError: (error) => {
      // The haveIBeenPwned plugin rejects on the password itself, so it
      // belongs against the field rather than in a toast.
      setIsCompromised(isPasswordCompromisedError(error))
    },
    onSuccess: () => {
      form.reset()
      toast.success(localization.settings.changePasswordSuccess)
    }
  })

  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false)
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const [isCompromised, setIsCompromised] = useState(false)

  const form = useAuthForm({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: ""
    },
    onSubmit: ({ value }) => {
      changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true
      })
    }
  })

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {localization.settings.changePassword}
      </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-6">
            <form.AppField
              name="currentPassword"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    requiredMessage: localization.auth.fieldRequired
                  })
              }}
            >
              {(field) => (
                <Field data-invalid={isAuthFormFieldInvalid(field.state.meta)}>
                  <FieldLabel htmlFor="currentPassword">
                    {localization.settings.currentPassword}
                  </FieldLabel>

                  {session ? (
                    <InputGroup>
                      <InputGroupInput
                        id="currentPassword"
                        name={field.name}
                        type={isCurrentPasswordVisible ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder={
                          localization.settings.currentPasswordPlaceholder
                        }
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isPending}
                        required
                        aria-invalid={isAuthFormFieldInvalid(field.state.meta)}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-xs"
                          aria-label={
                            isCurrentPasswordVisible
                              ? localization.auth.hidePassword
                              : localization.auth.showPassword
                          }
                          title={
                            isCurrentPasswordVisible
                              ? localization.auth.hidePassword
                              : localization.auth.showPassword
                          }
                          onClick={() => {
                            setIsCurrentPasswordVisible((visible) => !visible)
                          }}
                        >
                          {isCurrentPasswordVisible ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  ) : (
                    <Skeleton>
                      <Input className="invisible" />
                    </Skeleton>
                  )}

                  <field.AuthFormFieldError />
                </Field>
              )}
            </form.AppField>

            <form.AppField
              name="newPassword"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    maxLength: emailAndPassword.maxPasswordLength,
                    maxLengthMessage: localization.auth.tooLong.replace(
                      "{{max}}",
                      String(emailAndPassword.maxPasswordLength)
                    ),
                    minLength: emailAndPassword.minPasswordLength,
                    minLengthMessage: localization.auth.tooShort.replace(
                      "{{min}}",
                      String(emailAndPassword.minPasswordLength)
                    ),
                    requiredMessage: localization.auth.fieldRequired
                  })
              }}
            >
              {(field) => {
                const isInvalid =
                  isAuthFormFieldInvalid(field.state.meta) || isCompromised

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="newPassword">
                      {localization.auth.newPassword}
                    </FieldLabel>

                    {session ? (
                      <InputGroup>
                        <InputGroupInput
                          id="newPassword"
                          name={field.name}
                          type={isNewPasswordVisible ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={localization.auth.newPasswordPlaceholder}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                            setIsCompromised(false)
                          }}
                          minLength={emailAndPassword.minPasswordLength}
                          maxLength={emailAndPassword.maxPasswordLength}
                          disabled={isPending}
                          required
                          aria-invalid={isInvalid}
                        />

                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="icon-xs"
                            aria-label={
                              isNewPasswordVisible
                                ? localization.auth.hidePassword
                                : localization.auth.showPassword
                            }
                            onClick={() =>
                              setIsNewPasswordVisible((visible) => !visible)
                            }
                          >
                            {isNewPasswordVisible ? <EyeOff /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    ) : (
                      <Skeleton>
                        <Input className="invisible" />
                      </Skeleton>
                    )}

                    {isCompromised ? (
                      <FieldError>
                        {localization.auth.passwordCompromised}
                      </FieldError>
                    ) : (
                      <field.AuthFormFieldError />
                    )}

                    <PasswordStrengthMeter password={field.state.value} />
                  </Field>
                )
              }}
            </form.AppField>

            {emailAndPassword.confirmPassword && (
              <form.AppField
                name="confirmPassword"
                validators={{
                  onChangeListenTo: ["newPassword"],
                  onChange: ({ fieldApi, value }) =>
                    validateStringLength(value, {
                      maxLength: emailAndPassword.maxPasswordLength,
                      maxLengthMessage: localization.auth.tooLong.replace(
                        "{{max}}",
                        String(emailAndPassword.maxPasswordLength)
                      ),
                      minLength: emailAndPassword.minPasswordLength,
                      minLengthMessage: localization.auth.tooShort.replace(
                        "{{min}}",
                        String(emailAndPassword.minPasswordLength)
                      ),
                      requiredMessage: localization.auth.fieldRequired
                    }) ??
                    validateMatchingValue(
                      value,
                      fieldApi.form.getFieldValue("newPassword"),
                      localization.auth.passwordsDoNotMatch
                    )
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={isAuthFormFieldInvalid(field.state.meta)}
                  >
                    <FieldLabel htmlFor="confirmPassword">
                      {localization.auth.confirmPassword}
                    </FieldLabel>

                    {session ? (
                      <InputGroup>
                        <InputGroupInput
                          id="confirmPassword"
                          name={field.name}
                          type={isConfirmPasswordVisible ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={
                            localization.auth.confirmPasswordPlaceholder
                          }
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          minLength={emailAndPassword.minPasswordLength}
                          maxLength={emailAndPassword.maxPasswordLength}
                          disabled={isPending}
                          required
                          aria-invalid={isAuthFormFieldInvalid(
                            field.state.meta
                          )}
                        />

                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="icon-xs"
                            aria-label={
                              isConfirmPasswordVisible
                                ? localization.auth.hidePassword
                                : localization.auth.showPassword
                            }
                            onClick={() =>
                              setIsConfirmPasswordVisible((visible) => !visible)
                            }
                          >
                            {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    ) : (
                      <Skeleton>
                        <Input className="invisible" />
                      </Skeleton>
                    )}

                    <field.AuthFormFieldError />
                  </Field>
                )}
              </form.AppField>
            )}
          </CardContent>

          <CardFooter>
            <form.Subscribe
              selector={(state) =>
                [state.canSubmit, state.isSubmitting] as const
              }
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!canSubmit || isSubmitting || isPending || !session}
                >
                  {(isSubmitting || isPending) && <Spinner />}

                  {localization.settings.updatePassword}
                </Button>
              )}
            </form.Subscribe>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
