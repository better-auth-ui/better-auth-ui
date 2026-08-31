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

## Shared pages

Keep URLs, front matter, component imports, and navigation metadata in `content/docs`. Keep shared page bodies in `content/topics`.

Each topic defines the page structure once. Its route files select a variant and include that topic:

```mdx
---
title: useSignInEmail
description: Email/password sign-in mutation.
variant: react
---

<include>../../../topics/mutations/sign-in-email.mdx</include>
```

The supported variants are `react`, `solid`, `shadcn`, `heroui`, and `zaidan`. The front matter schema validates this field.

In a shared topic, use a block for platform-specific prose or several related elements:

```mdx
<DocVariant name="shadcn zaidan">
## Installation

Install the component from its registry.
</DocVariant>
```

For a preview or type table, use `doc-variant="heroui"`. For a code fence, put the selector after its language:

````mdx
<ComponentPreview doc-variant="heroui" name="heroui-sign-in" />

```tsx doc-variant="heroui" file=<rootDir>/src/demos/heroui/auth/sign-in.tsx
```
````

Selectors match the exact page variant. Separate multiple names with spaces. Nested selectors must all match for their content to appear.

Wrap conditional includes in `DocVariant`. Native includes do not preserve selector attributes.

The Remark transform removes excluded branches and selector attributes before code imports, type tables, headings, search, and Markdown exports. No variant component reaches React.

Keep real API differences in explicitly authored examples. Do not derive Solid examples through substitutions in React code. Distinct guides can remain standalone.

## Page templates

Mutation and component topics use compile-time templates. Edit their shared structure in `src/lib/docs-templates/render.ts`.

Each entry in `src/lib/docs-templates/mutations.ts` supplies the mutation name, Params type reference, and examples. The template creates Usage, Options factory, and Params.

Write type references as `path#ExportedType`. Mutation paths are relative to the workspace root.

Example configuration controls bindings, arguments, calls, and client setup. React and Solid keep separate examples. Use `{ code: "..." }` for examples that need custom setup. Set a section to `false` when it does not apply.

Each entry in `src/lib/docs-templates/components.ts` supplies the demo, props source, and preview details. The template creates Usage, Installation, and Props.

Component paths are relative to each platform's demo or component directory. Registry items default to the final segment of the template ID. Inline preview names add the platform prefix, such as `heroui-sign-in`.

Zaidan components supply Storybook details; email components use inline previews.

Use platform overrides for different demos, registry items, or props. Override paths are complete paths: demos use `<rootDir>`, and props use the workspace root.

Topics keep their explanations and custom sections in named slots:

```mdx
<MutationPage id="sign-in-email">
<PageSlot name="options">

Explain the options factory here.

</PageSlot>
</MutationPage>
```

Use `<ComponentPage id="sign-in" />` when a component needs no extra content.

| Template | Slots after the generated example or type table |
| --- | --- |
| Mutation | `usage`, `options`, `params` |
| Component | `usage`, `installation`, `props` |

Add `:before` to place content after the section heading but before its example or type table. Components also support `example:before` and `beforeProps`.

Slots can contain headings, includes, and variant selectors. Put templates and slots in separate blocks. Unknown IDs, invalid variants, duplicate slots, and unused nonempty slots fail compilation.

Templates expand after includes and variant selection, before code imports, type tables, headings, search, and Markdown exports. They add no runtime components.

## Shared fragments

Keep pages and navigation metadata in `content/docs`. Keep reusable MDX fragments in `content/shared`, outside the page collection.

Fragments do not create routes, sidebar entries, or separate search results. The existing page URLs remain unchanged.

Use fragments for content reused across topics or standalone guides, such as cache rules, plugin requirements, and integration setup. Fold fragments with one consumer into its topic.

Use Fumadocs includes to share explanations between framework pages:

```mdx
<include>../../../shared/queries/session.mdx#invalidation</include>
```

The path is relative to the page. A heading anchor selects a section and includes its heading.

For a selected fragment, wrap its content in `<section id="shared-behavior">` and include `file.mdx#shared-behavior`.

Use the `shared-` prefix for section IDs. Fumadocs also matches heading anchors, so a section ID must not collide with a heading.

Put a blank line before and after each include, including inside `<Steps>` and between consecutive includes. Adjacent includes can parse as one paragraph and replace each other's content.

Share an example only when it applies unchanged to every page that includes it. Keep different imports, router APIs, installation commands, previews, and caveats separate. Pages with no repeated content remain standalone.

Keep component imports in each route file that uses them, including components inside topics or fragments such as `Callout` and `Step`.

Use absolute `/docs/...` links in shared content so links work from every page. A link to a particular framework must match every page that includes the fragment.

Fumadocs expands includes before it generates the table of contents, search data, and processed Markdown. Its Vite integration tracks included files for development updates.

The Nx build, test, and typecheck inputs include topics and fragments. The type-table target also tracks the full content directory and composition helpers.

### Type tables

Type tables can live in route files, topics, or fragments. Their paths are relative to the workspace root:

```mdx
<type-table path="packages/core/src/mutations/sign-in-email-mutation.ts" name="SignInEmailParams" />
```

The snapshot generator expands includes, selects variants, and renders templates before it discovers references. Compilation uses the same reference resolver.

### Validation

From the workspace root, run:

```bash
bun nx run docs:test
bun nx run docs:typecheck
bun nx run docs:lint
bun nx run workspace:lint
```

The docs tests expand every page with native includes, variant selection, and templates. They validate composition errors and generated factory behavior.

After a content change, inspect the rendered page, its heading links, and its `.md` export. Shared headings must retain their existing anchors.
