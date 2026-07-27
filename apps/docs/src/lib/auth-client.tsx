import { apiKeyClient } from "@better-auth/api-key/client"
import { passkeyClient } from "@better-auth/passkey/client"
import {
  deviceAuthorizationClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  usernameClient
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const DEMO_SESSION_TOKEN = "demo_sess_current"
const DEMO_OTHER_SESSION_TOKEN = "demo_sess_mobile"

const customFetchImpl: typeof fetch = async (input, _init) => {
  const endpoint =
    typeof input === "string"
      ? new URL(input, "http://localhost").pathname
      : input instanceof URL
        ? input.pathname
        : new URL(input.url).pathname

  if (endpoint === "/api/auth/device") {
    return new Response(
      JSON.stringify({
        user_code: "AB12CD34",
        status: "pending"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  if (
    endpoint === "/api/auth/device/approve" ||
    endpoint === "/api/auth/device/deny"
  ) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/list-accounts") {
    const now = new Date().toISOString()
    return new Response(
      JSON.stringify([
        {
          id: "acc_demo_credential",
          providerId: "credential",
          accountId: "123",
          userId: "123",
          createdAt: now,
          updatedAt: now,
          scopes: []
        },
        {
          id: "acc_demo_github",
          providerId: "github",
          accountId: "12345678",
          userId: "123",
          createdAt: now,
          updatedAt: now,
          scopes: []
        }
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  if (endpoint === "/api/auth/account-info") {
    return new Response(
      JSON.stringify({
        user: {
          id: "demo-github-user",
          name: "daveycodez",
          email: "daveycodez@example.com",
          emailVerified: true,
          image: "/avatars/daveycodez.png"
        },
        data: {
          login: "daveycodez"
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  if (endpoint === "/api/auth/get-session") {
    return new Response(
      JSON.stringify({
        session: {
          id: "123",
          userId: "123",
          token: DEMO_SESSION_TOKEN,
          expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        user: {
          id: "123",
          name: "daveycodez",
          email: "daveycodez@example.com",
          emailVerified: true,
          image: "/avatars/daveycodez.png",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )
  }

  if (endpoint === "/api/auth/list-sessions") {
    const now = Date.now()
    return new Response(
      JSON.stringify([
        {
          id: "123",
          userId: "123",
          token: DEMO_SESSION_TOKEN,
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          ipAddress: "203.0.113.10",
          createdAt: new Date(now - 3_600_000).toISOString(),
          updatedAt: new Date(now - 3_600_000).toISOString(),
          expiresAt: new Date(now + 86_400_000).toISOString()
        },
        {
          id: "456",
          userId: "123",
          token: DEMO_OTHER_SESSION_TOKEN,
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1",
          ipAddress: "198.51.100.44",
          createdAt: new Date(now - 86_400_000 * 2).toISOString(),
          updatedAt: new Date(now - 86_400_000 * 2).toISOString(),
          expiresAt: new Date(now + 86_400_000).toISOString()
        }
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  if (endpoint === "/api/auth/revoke-session") {
    return new Response(JSON.stringify({ status: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/passkey/list-user-passkeys") {
    return new Response(
      JSON.stringify([
        {
          id: "passkey_demo_1",
          name: "Passkey",
          userId: "123",
          publicKey: "demo-public-key",
          credentialID: "demo-credential-id",
          counter: 42,
          createdAt: new Date(Date.now() - 86_400_000 * 14).toISOString()
        }
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  if (endpoint === "/api/auth/api-key/list") {
    const now = Date.now()
    return new Response(
      JSON.stringify({
        apiKeys: [
          {
            id: "ak_demo_1",
            name: "Production",
            start: "k4f9x2",
            prefix: null,
            userId: "123",
            enabled: true,
            rateLimitEnabled: false,
            rateLimitTimeWindow: null,
            rateLimitMax: null,
            requestCount: 0,
            remaining: null,
            lastRequest: null,
            expiresAt: new Date(now + 86_400_000 * 30).toISOString(),
            createdAt: new Date(now - 86_400_000 * 7).toISOString(),
            updatedAt: new Date(now - 86_400_000 * 7).toISOString(),
            permissions: null,
            metadata: null
          },
          {
            id: "ak_demo_2",
            name: "Staging",
            start: "p8c3m1",
            prefix: null,
            userId: "123",
            enabled: true,
            rateLimitEnabled: false,
            rateLimitTimeWindow: null,
            rateLimitMax: null,
            requestCount: 0,
            remaining: null,
            lastRequest: null,
            expiresAt: null,
            createdAt: new Date(now - 86_400_000 * 2).toISOString(),
            updatedAt: new Date(now - 86_400_000 * 2).toISOString(),
            permissions: null,
            metadata: null
          }
        ],
        total: 2,
        limit: undefined,
        offset: undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  if (endpoint === "/api/auth/api-key/create") {
    const now = new Date().toISOString()
    return new Response(
      JSON.stringify({
        id: "ak_demo_new",
        name: "Demo",
        start: "z7t2qa",
        prefix: null,
        key: "z7t2qa9HxV4mD8nLp1RsW6Jk3BcF5UyEgPzAhNoMtKlIvCdOe",
        userId: "123",
        enabled: true,
        rateLimitEnabled: false,
        rateLimitTimeWindow: null,
        rateLimitMax: null,
        requestCount: 0,
        remaining: null,
        lastRequest: null,
        expiresAt: null,
        createdAt: now,
        updatedAt: now,
        permissions: null,
        metadata: null
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  if (endpoint === "/api/auth/api-key/delete") {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/organization/list") {
    return new Response(JSON.stringify(DEMO_ORGANIZATIONS), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/organization/get-full-organization") {
    return new Response(JSON.stringify(DEMO_ACTIVE_ORGANIZATION), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/organization/list-members") {
    return new Response(
      JSON.stringify({
        members: DEMO_ACTIVE_ORGANIZATION.members,
        total: DEMO_ACTIVE_ORGANIZATION.members.length
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  if (endpoint === "/api/auth/organization/list-invitations") {
    return new Response(JSON.stringify(DEMO_ACTIVE_ORGANIZATION.invitations), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/organization/list-user-invitations") {
    return new Response(JSON.stringify(DEMO_USER_INVITATIONS), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/organization/has-permission") {
    return new Response(JSON.stringify({ success: true, error: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/organization/set-active") {
    return new Response(JSON.stringify(DEMO_ACTIVE_ORGANIZATION), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/organization/check-slug") {
    return new Response(JSON.stringify({ status: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (endpoint === "/api/auth/multi-session/list-device-sessions") {
    return new Response(
      JSON.stringify([
        {
          session: {
            id: "123",
            userId: "123",
            expiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          user: {
            id: "123",
            name: "daveycodez",
            email: "daveycodez@example.com",
            emailVerified: true,
            image: "/avatars/daveycodez.png",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        {
          session: {
            id: "456",
            userId: "456",
            expiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          user: {
            id: "456",
            name: "John Doe",
            email: "john.doe@example.com",
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  return new Response(JSON.stringify({ message: "Demo" }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  })
}

const NOW = new Date().toISOString()

const DEMO_ORGANIZATIONS = [
  {
    id: "org_acme",
    name: "Acme Inc.",
    slug: "acme",
    logo: null,
    createdAt: NOW,
    metadata: null
  },
  {
    id: "org_globex",
    name: "Globex Corporation",
    slug: "globex",
    logo: null,
    createdAt: NOW,
    metadata: null
  },
  {
    id: "org_initech",
    name: "Initech",
    slug: "initech",
    logo: null,
    createdAt: NOW,
    metadata: null
  }
]

const DEMO_ACTIVE_ORGANIZATION = {
  ...DEMO_ORGANIZATIONS[0],
  members: [
    {
      id: "mem_dave",
      organizationId: "org_acme",
      userId: "123",
      role: "owner",
      createdAt: NOW,
      user: {
        id: "123",
        name: "daveycodez",
        email: "daveycodez@example.com",
        image: "/avatars/daveycodez.png"
      }
    },
    {
      id: "mem_jane",
      organizationId: "org_acme",
      userId: "user_jane",
      role: "admin",
      createdAt: NOW,
      user: {
        id: "user_jane",
        name: "Jane Doe",
        email: "jane.doe@example.com",
        image: null
      }
    },
    {
      id: "mem_john",
      organizationId: "org_acme",
      userId: "user_john",
      role: "member",
      createdAt: NOW,
      user: {
        id: "user_john",
        name: "John Smith",
        email: "john.smith@example.com",
        image: null
      }
    }
  ],
  invitations: [
    {
      id: "inv_jane",
      organizationId: "org_acme",
      email: "jane.doe@example.com",
      role: "admin",
      status: "accepted",
      expiresAt: new Date(Date.now() + 86_400_000 * 7).toISOString(),
      inviterId: "123",
      createdAt: NOW
    },
    {
      id: "inv_alex",
      organizationId: "org_acme",
      email: "alex@example.com",
      role: "member",
      status: "pending",
      expiresAt: new Date(Date.now() + 86_400_000 * 7).toISOString(),
      inviterId: "123",
      createdAt: NOW
    },
    {
      id: "inv_morgan",
      organizationId: "org_acme",
      email: "morgan@example.com",
      role: "admin",
      status: "rejected",
      expiresAt: new Date(Date.now() + 86_400_000 * 5).toISOString(),
      inviterId: "123",
      createdAt: NOW
    },
    {
      id: "inv_john",
      organizationId: "org_acme",
      email: "john.smith@example.com",
      role: "member",
      status: "accepted",
      expiresAt: new Date(Date.now() + 86_400_000 * 7).toISOString(),
      inviterId: "123",
      createdAt: NOW
    },
    {
      id: "inv_taylor",
      organizationId: "org_acme",
      email: "taylor@example.com",
      role: "member",
      status: "canceled",
      expiresAt: new Date(Date.now() + 86_400_000 * 5).toISOString(),
      inviterId: "123",
      createdAt: NOW
    }
  ]
}

const DEMO_USER_INVITATIONS = [
  {
    id: "inv_initech_for_user",
    organizationId: "org_initech",
    email: "daveycodez@example.com",
    role: "member",
    status: "pending",
    expiresAt: new Date(Date.now() + 86_400_000 * 3).toISOString(),
    inviterId: "user_peter",
    createdAt: NOW,
    organizationName: "Initech",
    organizationSlug: "initech",
    organizationLogo: null,
    inviterEmail: "peter@initech.com"
  }
]

export const authClient = createAuthClient({
  plugins: [
    organizationClient(),
    multiSessionClient(),
    apiKeyClient(),
    passkeyClient(),
    usernameClient(),
    deviceAuthorizationClient(),
    magicLinkClient()
  ],
  fetchOptions: {
    customFetchImpl
  }
})
