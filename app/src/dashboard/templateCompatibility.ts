/** APP-DSH-05: widget kinds interchangeable for the same value shape — spec's own example is
 * exactly this numeric set (line ↔ value ↔ gauge ↔ level). Switching is just an override on `k`
 * (see useWidgetOverridesStore); it never touches what the device itself declared. */
const NUMERIC_KINDS = ['line', 'value', 'gauge', 'level'] as const;

export function compatibleKinds(kind: string): readonly string[] {
  if ((NUMERIC_KINDS as readonly string[]).includes(kind)) {
    return NUMERIC_KINDS.filter((k) => k !== kind);
  }
  return [];
}
