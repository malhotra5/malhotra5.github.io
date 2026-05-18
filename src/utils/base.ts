/** Prepend Astro's configured base path to an internal route. */
export function base(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
