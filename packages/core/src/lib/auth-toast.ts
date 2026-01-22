export type RenderToast = (
  message?: string,
  options?: {
    action?: { label: string; onClick: () => Promise<void> | void }
    actionProps?: { children: string; onClick: () => Promise<void> | void }
  }
) => string | number | unknown

export type DismissToast = (
  // biome-ignore lint/suspicious/noExplicitAny: Flexible dismiss for toasts
  id?: number | string | unknown | any
) => string | number | unknown

export const defaultToast: RenderToast = (message, options) => {
  if (options?.action) {
    if (confirm(message)) {
      options.action.onClick()
    }
  } else {
    alert(message)
  }
}

export type Toast = {
  /** Display an error toast notification */
  error: RenderToast
  /** Display a danger toast notification */
  danger?: RenderToast
  /** Display a success toast notification */
  success: RenderToast
  /** Display an info toast notification */
  info: RenderToast
  /** Optional function to dismiss a toast notification by its ID */
  dismiss?: DismissToast
}
