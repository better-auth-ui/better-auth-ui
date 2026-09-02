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
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  FieldError,
  Fieldset,
  InputGroup,
  Label,
  Skeleton,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { useState } from "react"
import { isAuthFormFieldInvalid, useAuthForm } from "../../auth-form"

import { OpenEmailButton } from "../../open-email-button"
import { PasswordStrengthMeter } from "../../password-strength-meter"

export type ChangePasswordProps = {
  className?: string
  variant?: CardProps["variant"]
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
export function ChangePassword({
  className,
  variant,
  ...props
}: ChangePasswordProps & Omit<CardProps, "children">) {
  const { authClient, emailAndPassword, localization } = useAuth()
  const { data: session } = useSession(authClient)
  const { data: accounts, isPending: isAccountsPending } =
    useListAccounts(authClient)

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  )

  if (!isAccountsPending && !hasCredentialAccount) {
    return <SetPassword className={className} variant={variant} {...props} />
  }

  return (
    <ChangePasswordForm
      className={className}
      variant={variant}
      emailAndPassword={emailAndPassword}
      localization={localization}
      session={isAccountsPending ? undefined : session}
      {...props}
    />
  )
}

function SetPassword({
  className,
  variant,
  ...props
}: Omit<CardProps, "children">) {
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
    if (!session?.user.email) return
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
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.settings.changePassword}
      </h2>

      <Card className={cn(className)} variant={variant} {...props}>
        <Card.Content className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium leading-tight">
              {localization.settings.setPassword}
            </p>

            <p className="text-muted text-xs mt-0.5">
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
                isPending={isPending}
                isDisabled={!session?.user.email}
                onPress={handleSetPassword}
              >
                {isPending && <Spinner color="current" size="sm" />}
                {localization.auth.sendResetLink}
              </Button>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  )
}

function ChangePasswordForm({
  className,
  variant,
  emailAndPassword,
  localization,
  session,
  ...props
}: {
  emailAndPassword: ReturnType<typeof useAuth>["emailAndPassword"]
  localization: ReturnType<typeof useAuth>["localization"]
  session: ReturnType<typeof useSession>["data"]
} & Omit<CardProps, "children">) {
  const { authClient } = useAuth()
  const [isCompromised, setIsCompromised] = useState(false)
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false)

  const { mutateAsync: changePassword, isPending } = useChangePassword(
    authClient,
    {
      onError: (error) => {
        // The haveIBeenPwned plugin rejects on the password itself, so it
        // belongs against the field rather than in a toast.
        setIsCompromised(isPasswordCompromisedError(error))
      },
      onSuccess: () => {
        form.reset()
        toast.success(localization.settings.changePasswordSuccess)
      }
    }
  )

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const form = useAuthForm({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: ""
    },
    onSubmit: async ({ value }) => {
      try {
        await changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true
        })
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  })

  return (
    <div>
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.settings.changePassword}
      </h2>

      <Card className={cn("p-4 gap-4", className)} variant={variant} {...props}>
        <Card.Content>
          <form.AppForm>
            <form.AuthFormRoot>
              <Fieldset className="w-full gap-4">
                <Fieldset.Group>
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
                      <TextField
                        name={field.name}
                        isDisabled={isPending || !session}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        isInvalid={
                          isAuthFormFieldInvalid(field.state.meta) || undefined
                        }
                        validationBehavior="aria"
                      >
                        <Label>{localization.settings.currentPassword}</Label>

                        <InputGroup
                          className={cn(!session && "hidden")}
                          variant={
                            variant === "transparent" ? "primary" : "secondary"
                          }
                        >
                          <InputGroup.Input
                            autoComplete="current-password"
                            name="currentPassword"
                            placeholder={
                              localization.settings.currentPasswordPlaceholder
                            }
                            required
                            type={
                              isCurrentPasswordVisible ? "text" : "password"
                            }
                          />

                          <InputGroup.Suffix className="px-0">
                            <Button
                              isIconOnly
                              aria-label={
                                isCurrentPasswordVisible
                                  ? localization.auth.hidePassword
                                  : localization.auth.showPassword
                              }
                              size="sm"
                              variant="ghost"
                              onPress={() =>
                                setIsCurrentPasswordVisible(
                                  !isCurrentPasswordVisible
                                )
                              }
                              isDisabled={isPending}
                            >
                              {isCurrentPasswordVisible ? (
                                <EyeSlash />
                              ) : (
                                <Eye />
                              )}
                            </Button>
                          </InputGroup.Suffix>
                        </InputGroup>

                        {!session && (
                          <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                        )}

                        <field.AuthFormFieldError />
                      </TextField>
                    )}
                  </form.AppField>

                  <form.AppField
                    name="newPassword"
                    validators={{
                      onChange: ({ value }) =>
                        validateStringLength(value, {
                          maxLength: emailAndPassword?.maxPasswordLength,
                          maxLengthMessage: localization.auth.tooLong.replace(
                            "{{max}}",
                            String(emailAndPassword?.maxPasswordLength)
                          ),
                          minLength: emailAndPassword?.minPasswordLength,
                          minLengthMessage: localization.auth.tooShort.replace(
                            "{{min}}",
                            String(emailAndPassword?.minPasswordLength)
                          ),
                          requiredMessage: localization.auth.fieldRequired
                        })
                    }}
                  >
                    {(field) => {
                      const isInvalid =
                        isAuthFormFieldInvalid(field.state.meta) ||
                        isCompromised

                      return (
                        <TextField
                          minLength={emailAndPassword?.minPasswordLength}
                          maxLength={emailAndPassword?.maxPasswordLength}
                          isDisabled={isPending || !session}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(value) => {
                            field.handleChange(value)
                            setIsCompromised(false)
                          }}
                          isInvalid={isInvalid || undefined}
                          validationBehavior="aria"
                        >
                          <Label>{localization.auth.newPassword}</Label>

                          <InputGroup
                            className={cn(!session && "hidden")}
                            variant={
                              variant === "transparent"
                                ? "primary"
                                : "secondary"
                            }
                          >
                            <InputGroup.Input
                              name="newPassword"
                              type={isNewPasswordVisible ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder={
                                localization.auth.newPasswordPlaceholder
                              }
                              required
                            />

                            <InputGroup.Suffix className="px-0">
                              <Button
                                isIconOnly
                                aria-label={
                                  isNewPasswordVisible
                                    ? localization.auth.hidePassword
                                    : localization.auth.showPassword
                                }
                                size="sm"
                                variant="ghost"
                                onPress={() =>
                                  setIsNewPasswordVisible(!isNewPasswordVisible)
                                }
                                isDisabled={isPending}
                              >
                                {isNewPasswordVisible ? <EyeSlash /> : <Eye />}
                              </Button>
                            </InputGroup.Suffix>
                          </InputGroup>

                          {!session && (
                            <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                          )}

                          {isCompromised ? (
                            <FieldError>
                              {localization.auth.passwordCompromised}
                            </FieldError>
                          ) : (
                            <field.AuthFormFieldError />
                          )}

                          <PasswordStrengthMeter password={field.state.value} />
                        </TextField>
                      )
                    }}
                  </form.AppField>

                  {emailAndPassword?.confirmPassword && (
                    <form.AppField
                      name="confirmPassword"
                      validators={{
                        onChangeListenTo: ["newPassword"],
                        onChange: ({ fieldApi, value }) =>
                          validateStringLength(value, {
                            maxLength: emailAndPassword?.maxPasswordLength,
                            maxLengthMessage: localization.auth.tooLong.replace(
                              "{{max}}",
                              String(emailAndPassword?.maxPasswordLength)
                            ),
                            minLength: emailAndPassword?.minPasswordLength,
                            minLengthMessage:
                              localization.auth.tooShort.replace(
                                "{{min}}",
                                String(emailAndPassword?.minPasswordLength)
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
                        <TextField
                          minLength={emailAndPassword?.minPasswordLength}
                          maxLength={emailAndPassword?.maxPasswordLength}
                          isDisabled={isPending || !session}
                          isRequired
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={field.handleChange}
                          isInvalid={
                            isAuthFormFieldInvalid(field.state.meta) ||
                            undefined
                          }
                          validationBehavior="aria"
                        >
                          <Label>{localization.auth.confirmPassword}</Label>

                          <InputGroup
                            className={cn(!session && "hidden")}
                            variant={
                              variant === "transparent"
                                ? "primary"
                                : "secondary"
                            }
                          >
                            <InputGroup.Input
                              name="confirmPassword"
                              type={
                                isConfirmPasswordVisible ? "text" : "password"
                              }
                              autoComplete="new-password"
                              placeholder={
                                localization.auth.confirmPasswordPlaceholder
                              }
                              required
                            />

                            <InputGroup.Suffix className="px-0">
                              <Button
                                isIconOnly
                                aria-label={
                                  isConfirmPasswordVisible
                                    ? localization.auth.hidePassword
                                    : localization.auth.showPassword
                                }
                                size="sm"
                                variant="ghost"
                                onPress={() =>
                                  setIsConfirmPasswordVisible(
                                    !isConfirmPasswordVisible
                                  )
                                }
                                isDisabled={isPending}
                              >
                                {isConfirmPasswordVisible ? (
                                  <EyeSlash />
                                ) : (
                                  <Eye />
                                )}
                              </Button>
                            </InputGroup.Suffix>
                          </InputGroup>

                          {!session && (
                            <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                          )}

                          <field.AuthFormFieldError />
                        </TextField>
                      )}
                    </form.AppField>
                  )}
                </Fieldset.Group>

                <Fieldset.Actions>
                  <form.AuthFormSubmitButton isDisabled={!session} size="sm">
                    {localization.settings.updatePassword}
                  </form.AuthFormSubmitButton>
                </Fieldset.Actions>
              </Fieldset>
            </form.AuthFormRoot>
          </form.AppForm>
        </Card.Content>
      </Card>
    </div>
  )
}
