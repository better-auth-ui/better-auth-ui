# Documentation

The documentation app uses TanStack Start and Fumadocs. React demos render inline, and Solid demos use Storybook iframes.

## Development

From the workspace root, run:

```bash
bun nx run docs:dev
```

Build the static site, registries, type tables, and Storybook previews with:

```bash
bun nx run docs:build
```

## Shared content

Keep pages and navigation metadata in `content/docs`. Keep reusable MDX fragments in `content/shared`, outside the page collection.

Fragments do not create routes, sidebar entries, or separate search results. The existing page URLs remain unchanged.

The shared directory groups content by topic:

- `queries` and `mutations`: API behavior, cache guidance, and plugin requirements.
- `ssr.mdx`: request caches and server helpers.
- `ui/components`: component behavior and email features.
- `ui/concepts` and `ui/plugins`: common configuration, server setup, and plugin behavior.
- `ui/integrations`: common setup guidance for each application framework.
- `ui/installation`: repeated installation commands for each registry.

Use Fumadocs includes to share explanations between framework pages:

```mdx
<include>../../../shared/queries/session.mdx#invalidation</include>
```

The path is relative to the page. A heading anchor selects a section and includes its heading.

For a selected fragment, wrap its content in `<section id="shared-behavior">` and include `file.mdx#shared-behavior`.

Use the `shared-` prefix for section IDs. Fumadocs also matches heading anchors, so a section ID must not collide with a heading.

Put a blank line before and after each include, including inside `<Steps>` and between consecutive includes. Adjacent includes can parse as one paragraph and replace each other's content.

Share an example only when it applies unchanged to every page that includes it. Keep different imports, router APIs, installation commands, previews, and caveats separate. Pages with no repeated content remain standalone.

Keep front matter and `<type-table>` declarations in page files. Keep component imports in each page that uses them, including components inside fragments such as `Callout` and `Step`.

Use absolute `/docs/...` links in shared content so links work from every page. A link to a particular framework must match every page that includes the fragment.

Fumadocs expands includes before it generates the table of contents, search data, and processed Markdown. Its Vite integration tracks included files for development updates.

The Nx `default` input covers the whole docs project. Build, test, and typecheck inputs therefore include `content/shared` through their existing input definitions.

### Type tables

Keep `<type-table>` declarations in `content/docs` pages. The snapshot generator scans those pages, and the remark plugin resolves type paths relative to each page.

Moving type-table declarations into fragments requires support for fragment discovery and source-relative paths in both tools.

### Validation

From the workspace root, run:

```bash
bun nx run docs:test
bun nx run docs:typecheck
bun nx run docs:lint
bun nx run workspace:lint
```

The docs tests expand every page with Fumadocs' native include transform. They check include boundaries and fragment IDs, and reject missing files or selectors.

After a content change, inspect the rendered page, its heading links, and its `.md` export. Shared headings must retain their existing anchors.
