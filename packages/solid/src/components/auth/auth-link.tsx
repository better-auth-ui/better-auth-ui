import type { Component, JSX } from "solid-js"
import { splitProps } from "solid-js"
import { Dynamic } from "solid-js/web"
import { useAuth } from "../../lib/auth-provider"

export type AuthLinkProps = Omit<
  JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
> & {
  href: string
  onClick?: JSX.EventHandler<HTMLAnchorElement, MouseEvent>
}

declare module "@better-auth-ui/core" {
  interface AuthConfig {
    /**
     * Optional component used to render internal navigation links.
     *
     * When omitted, `AuthLink` renders a native anchor.
     */
    Link?: Component<AuthLinkProps>
  }
}

/**
 * Render an internal auth link with the router adapter configured on
 * `AuthProvider`, falling back to a native anchor.
 */
export function AuthLink(props: AuthLinkProps) {
  const auth = useAuth()
  const [local, linkProps] = splitProps(props, ["children", "href", "onClick"])
  const Link = auth.Link ?? "a"

  const handleClick: JSX.EventHandler<HTMLAnchorElement, MouseEvent> = (
    event
  ) => {
    local.onClick?.(event)

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (linkProps.target && linkProps.target !== "_self") ||
      linkProps.download
    ) {
      return
    }

    event.preventDefault()
    auth.navigate({ to: local.href })
  }

  return (
    <Dynamic
      component={Link}
      {...linkProps}
      href={local.href}
      onClick={auth.Link ? local.onClick : handleClick}
    >
      {local.children}
    </Dynamic>
  )
}
