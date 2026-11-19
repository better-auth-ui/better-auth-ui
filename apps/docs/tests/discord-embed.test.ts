import { describe, expect, test } from "vitest"
import { ComponentType } from "discord-api-types/v10"
import {
  createDiscordEmbed,
  discordEmbedScript,
  serializeDiscordEmbed
} from "../src/lib/discord-embed"

describe("Discord component embeds", () => {
  test("renders current page data and link-only actions", () => {
    const options = {
      title: "A new post",
      description: "By Alice",
      url: "https://example.com/post/42",
      links: [{ label: "Author", url: "https://example.com/user/alice" }],
      images: ["https://example.com/art.png"]
    }
    const scripts = discordEmbedScript(options)
    const card = createDiscordEmbed(options)
    if (!card) throw new Error("Expected a component embed")
    expect(JSON.parse(scripts[0]?.children ?? "")).toEqual({ component: card })
    expect(card.type).toBe(ComponentType.Container)
    const [text, gallery] = card.components
    const actions = card.components.at(-1)
    expect(text).toMatchObject({
      type: ComponentType.TextDisplay,
      content: expect.stringContaining("A new post")
    })
    expect(text).toMatchObject({ content: expect.stringContaining("By Alice") })
    expect(gallery).toMatchObject({
      type: ComponentType.MediaGallery,
      items: [{ media: { url: "https://example.com/art.png" } }]
    })
    expect(actions).toMatchObject({
      components: [
        {
          type: 2,
          style: 5,
          label: "View page",
          url: "https://example.com/post/42"
        },
        {
          type: 2,
          style: 5,
          label: "Author",
          url: "https://example.com/user/alice"
        }
      ]
    })
  })

  test("escapes script terminators without changing the JSON data", () => {
    const options = {
      title: "</script><script>alert(1)</script>",
      url: "https://example.com"
    }
    const [script] = discordEmbedScript(options)
    expect(script?.children ?? "").not.toContain("<")
    expect(JSON.parse(script?.children ?? "")).toEqual({
      component: createDiscordEmbed(options)
    })
    expect(createDiscordEmbed(options)?.components[0]).toMatchObject({
      content: expect.stringContaining("script")
    })
  })

  test("keeps Unicode and long media URLs within the serialized byte limit", () => {
    const card = createDiscordEmbed({
      title: "🌍".repeat(200),
      description: "🌍</script>".repeat(1000),
      url: "https://example.com",
      images: Array.from(
        { length: 20 },
        (_, index) => `https://example.com/${index}/${"x".repeat(1900)}.png`
      ),
      links: Array.from({ length: 5 }, (_, index) => ({
        label: "🌍".repeat(80),
        url: `https://example.com/${index}/${"x".repeat(450)}`
      }))
    })
    expect(card).toBeDefined()
    if (!card) throw new Error("Expected a component embed")
    expect(
      new TextEncoder().encode(serializeDiscordEmbed(card)).byteLength
    ).toBeLessThanOrEqual(3000)
    const gallery = card.components.find(
      (component) => component.type === ComponentType.MediaGallery
    )
    if (gallery?.type === ComponentType.MediaGallery)
      expect(gallery.items.length).toBeLessThanOrEqual(4)
  })

  test("rejects unsafe URLs and omits invalid media and buttons", () => {
    expect(
      discordEmbedScript({ title: "Private", url: "javascript:alert(1)" })
    ).toEqual([])
    expect(
      discordEmbedScript({
        title: "Private",
        url: "https://user:password@example.com"
      })
    ).toEqual([])
    const [script] = discordEmbedScript({
      title: "Safe",
      url: "https://example.com",
      images: ["file:///tmp/image.png"],
      links: [{ label: "Bad", url: "javascript:alert(1)" }]
    })
    expect(JSON.parse(script?.children ?? "")).toMatchObject({
      component: { components: [{}, {}] }
    })
  })
})
