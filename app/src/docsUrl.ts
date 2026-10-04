/** Builds a URL to a docs site page, honoring this build's own base path — the docs site is
 * always served at `<BASE>docs/...`, never a hardcoded `/docs/...`, which would 404 once the app
 * stops being served from the domain root (e.g. GitHub Pages project pages under `/serialdash/`).
 * `path` has no leading slash, e.g. `docsUrl('guide/simulator')` or `docsUrl('')` for the home page. */
export function docsUrl(path: string): string {
  return `${import.meta.env.BASE_URL}docs/${path}`;
}
