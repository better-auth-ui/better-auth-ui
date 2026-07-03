# Better Auth UI framework surfaces

Use this reference to prevent API mixing across frameworks and UI distribution models.

## Surface boundaries

| Surface | What agents should touch | What agents should not assume |
| --- | --- | --- |
| Core | Shared query/mutation descriptors, keys, auth method types, plugin contracts, server helpers | React hooks, Solid reactivity, UI components |
| React | React hooks, React Query integration, React providers, React server helpers | Solid `Accessor`, Solid Query overloads, copied registry ownership |
| Solid | Solid hooks, Solid Query integration, `Accessor`-based inputs, Solid providers | React hook semantics, React Query options shape without checking Solid docs |
| shadcn/ui | Copied React component registry and app-owned component code | Package-style upgrades or runtime component imports |
| HeroUI | Packaged React UI components and HeroUI-specific examples | Copied registry ownership or Solid/Zaidan components |
| Zaidan | Copied Solid UI component registry and Solid examples | React component APIs or packaged HeroUI imports |

## Core-first rule

If behavior is shared across React and Solid, inspect `packages/core` first. Framework packages should usually adapt the core contract rather than reimplementing keys, endpoint selection, query/mutation params, or invalidation rules.

## React vs Solid reminders

- React hooks use React Query types and React component/provider conventions.
- Solid hooks use Solid Query and Solid reactivity. Check whether inputs are plain values, functions, or `Accessor<T>` before editing.
- Do not port code mechanically between React and Solid. Preserve each framework's reactive model.

## UI distribution reminders

- shadcn/ui and Zaidan install copied source through registry JSON; downstream apps own the copied files.
- HeroUI is a package import surface; compatibility changes must consider package exports, peer dependencies, and examples.
