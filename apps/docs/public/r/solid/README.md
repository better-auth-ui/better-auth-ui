# Solid registry static assets

Static asset host only.

The files in `apps/docs/public/r/solid` are generated from `examples/start-solid-zaidan-example` and served by the React Start docs app as inert JSON/Markdown assets.

The docs runtime must not import or execute Solid components from this directory. Solid/Zaidan source files stay owned by the Solid example and are copied into registry JSON snapshots during `registry:build`.
