/**
 * Passes a caller's `initialData` through while keeping `useQuery` on its
 * undefined-initial-data overload, so `data` stays `T | undefined` for every
 * hook, as it does in the React package.
 *
 * @param initialData - The caller's initial data, if any.
 * @returns An object to spread into the query options. Its `initialData` is
 * the same value, typed for the undefined-initial-data overload.
 */
export function passInitialData(initialData: unknown): {
  initialData: undefined
} {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- selects the useQuery overload only; the value is passed through unchanged
  return { initialData: initialData as undefined }
}
