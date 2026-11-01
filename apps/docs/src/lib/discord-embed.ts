import {
  ButtonStyle,
  ComponentType,
  type APIContainerComponent
} from "discord-api-types/v10"

export interface DiscordEmbedOptions {
  title: string
  label?: string
  description?: string
  url: string
  thumbnail?: string
  images?: readonly string[]
  links?: readonly { label: string; url: string }[]
  color?: number
}

function shorten(value: string, length: number) {
  if (length <= 0) return ""
  const characters = Array.from(value)
  return characters.length > length
    ? `${characters.slice(0, length - 1).join("")}…`
    : value
}

function markdown(value: string) {
  return value.replaceAll(/([\\`*_{}[\]()<>#|~])/g, "\\$1")
}

function publicUrl(value: string, maximum = 512) {
  try {
    const url = new URL(value)
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      url.href.length <= maximum
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

export function serializeDiscordEmbed(component: APIContainerComponent) {
  return JSON.stringify({ component }).replaceAll("<", "\\u003c")
}

export function createDiscordEmbed(
  options: DiscordEmbedOptions
): APIContainerComponent | undefined {
  const url = publicUrl(options.url)
  if (!url) return undefined
  let title = shorten(options.title.trim() || "View page", 120)
  let description = shorten(options.description?.trim() ?? "", 600)
  const images = (options.images ?? [])
    .flatMap((value) => publicUrl(value, 2048) ?? [])
    .slice(0, 4)
  const thumbnail = options.thumbnail
    ? publicUrl(options.thumbnail, 512)
    : undefined
  const links = [
    { label: options.label ?? "View page", url },
    ...(options.links ?? [])
  ]
    .flatMap((link) => {
      const href = publicUrl(link.url)
      return href
        ? [{ label: shorten(link.label.trim() || "View page", 60), url: href }]
        : []
    })
    .filter(
      (link, index, values) =>
        values.findIndex((other) => other.url === link.url) === index
    )
    .slice(0, 4)

  for (;;) {
    const text = {
      type: ComponentType.TextDisplay,
      content: `## [${markdown(title)}](${url})${description ? `\n${markdown(description)}` : ""}`
    } as const
    const component: APIContainerComponent = {
      type: ComponentType.Container,
      ...(options.color === undefined ? {} : { accent_color: options.color }),
      components: [
        thumbnail
          ? {
              type: ComponentType.Section,
              components: [text],
              accessory: {
                type: ComponentType.Thumbnail,
                media: { url: thumbnail }
              }
            }
          : text,
        ...(images.length
          ? [
              {
                type: ComponentType.MediaGallery as const,
                items: images.map((image) => ({ media: { url: image } }))
              }
            ]
          : []),
        {
          type: ComponentType.ActionRow,
          components: links.map((link) => ({
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            ...link
          }))
        }
      ]
    }
    if (
      new TextEncoder().encode(serializeDiscordEmbed(component)).byteLength <=
      3000
    )
      return component
    if (images.length) images.pop()
    else if (links.length > 1) links.pop()
    else if (description.length)
      description = shorten(
        description,
        Math.floor(Array.from(description).length / 2)
      )
    else if (Array.from(title).length > 16) title = shorten(title, 16)
    else return undefined
  }
}

export function discordEmbedScript(options: DiscordEmbedOptions) {
  const component = createDiscordEmbed(options)
  // TanStack's HeadContent renders script children with dangerouslySetInnerHTML.
  return component
    ? [
        {
          id: "discord:component-embed",
          type: "application/json",
          children: serializeDiscordEmbed(component)
        }
      ]
    : []
}
