export const siteUrl = "https://better-auth-ui.com"
export const siteDescription =
  "Authentication, account settings, and organization components for Better Auth. Built for React and SolidJS with shadcn/ui, HeroUI, and Zaidan."
export const socialImage = `${siteUrl}/better-auth-ui-promo-dark.png`

export function pageHead(
  path: string,
  title: string,
  description: string,
  type = "website"
) {
  const url = new URL(path, siteUrl).href
  return {
    links: [{ rel: "canonical", href: url }],
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: type },
      { property: "og:site_name", content: "Better Auth UI" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: socialImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: socialImage }
    ]
  }
}

export function createSitemap(paths: readonly string[]) {
  const urls = [...new Set(["/", ...paths])].map((path) => {
    const url = new URL(path, siteUrl).href.replaceAll("&", "&amp;")
    return `<url><loc>${url}</loc></url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`
}
