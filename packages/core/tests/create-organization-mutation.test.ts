import { QueryClient } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { describe, expect, it, vi } from "vitest"
import {
  type CreateOrganizationParams,
  createOrganizationOptions,
  type OrganizationAuthClient
} from "../src/plugins/organization"

function collision(code = "ORGANIZATION_SLUG_ALREADY_TAKEN") {
  return Object.assign(new Error(code), {
    status: 400,
    statusText: "Bad Request",
    error: { code }
  }) satisfies BetterFetchError
}

function setup() {
  const checkSlug = vi.fn(async () => ({ status: true }))
  const create = vi.fn(async ({ slug }: { slug: string }) => ({
    id: "org",
    slug
  }))
  const authClient = { organization: { checkSlug, create } }
  const queryClient = new QueryClient()
  const mutation = queryClient
    .getMutationCache()
    .build(
      queryClient,
      createOrganizationOptions(authClient as unknown as OrganizationAuthClient)
    )
  return {
    checkSlug,
    create,
    submit: (params: CreateOrganizationParams) => mutation.execute(params)
  }
}

describe("organization creation with generated slugs", () => {
  it("checks the normalized candidate and forwards fetch options", async () => {
    const { checkSlug, create, submit } = setup()
    const fetchOptions = { headers: { "x-request-id": "request" } }

    await submit({ name: "Café Partners", fetchOptions })

    expect(checkSlug).toHaveBeenCalledExactlyOnceWith({
      slug: "cafe-partners",
      fetchOptions: { ...fetchOptions, throw: true }
    })
    expect(create).toHaveBeenCalledExactlyOnceWith({
      name: "Café Partners",
      slug: "cafe-partners",
      fetchOptions: { ...fetchOptions, throw: true }
    })
  })

  it("checks a unique alternative before creating when the base slug is taken", async () => {
    const { checkSlug, create, submit } = setup()
    checkSlug.mockRejectedValueOnce(collision())

    const result = await submit({ name: "Acme" })

    expect(result.slug).toMatch(/^acme-[a-f0-9-]+$/)
    expect(checkSlug).toHaveBeenCalledTimes(2)
    expect(checkSlug).toHaveBeenLastCalledWith(
      expect.objectContaining({ slug: result.slug })
    )
    expect(create).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ slug: result.slug })
    )
  })

  it.each(["ORGANIZATION_ALREADY_EXISTS", "ORGANIZATION_SLUG_ALREADY_TAKEN"])(
    "retries a collision during creation (%s)",
    async (code) => {
      const { checkSlug, create, submit } = setup()
      create.mockRejectedValueOnce(collision(code))

      const result = await submit({ name: "Acme" })

      expect(create).toHaveBeenCalledTimes(2)
      expect(result.slug).not.toBe("acme")
      expect(checkSlug).toHaveBeenCalledTimes(2)
      expect(checkSlug).toHaveBeenLastCalledWith(
        expect.objectContaining({ slug: result.slug })
      )
    }
  )

  it("preserves a manually supplied slug and reports its collision without retrying", async () => {
    const { checkSlug, create, submit } = setup()
    const error = collision("ORGANIZATION_ALREADY_EXISTS")
    create.mockRejectedValue(error)

    await expect(submit({ name: "Acme", slug: "custom" })).rejects.toBe(error)

    expect(checkSlug).not.toHaveBeenCalled()
    expect(create).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ slug: "custom" })
    )
  })

  it("stops after five unavailable candidates and reports the final error", async () => {
    const { checkSlug, create, submit } = setup()
    const error = collision()
    checkSlug.mockRejectedValue(error)

    await expect(submit({ name: "Acme" })).rejects.toBe(error)

    expect(checkSlug).toHaveBeenCalledTimes(5)
    expect(create).not.toHaveBeenCalled()
  })

  it.each(["checkSlug", "create"] as const)(
    "does not retry unrelated failures from %s",
    async (stage) => {
      const { checkSlug, create, submit } = setup()
      const error = new Error("Network unavailable")
      const operation = { checkSlug, create }[stage]
      operation.mockRejectedValue(error)

      await expect(submit({ name: "Acme" })).rejects.toBe(error)

      expect(checkSlug).toHaveBeenCalledTimes(1)
      expect(create).toHaveBeenCalledTimes(stage === "create" ? 1 : 0)
    }
  )
})
