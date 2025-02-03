/**
 * Transforms a given string into a URL-friendly slug.
 *
 * The function converts the input text to lowercase, trims excess whitespace, and normalizes Unicode characters
 * to decompose accented letters. It removes diacritical marks and strips out special characters except for alphanumeric
 * characters, spaces, and hyphens. Finally, spaces and underscores are replaced with hyphens, and any leading or trailing
 * hyphens are removed.
 *
 * @param text - The string to be converted into a slug.
 * @returns A URL-friendly slug.
 *
 * @example
 * // Returns "hello-world"
 * slugify("Hello World!");
 *
 * @example
 * // Returns "cafe-del-mar"
 * slugify("Café del Mar");
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize unicode characters
    .replace(/\u0300-\u036f/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/(?:^-+)|(?:-+$)/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a unique, URL-friendly slug based on a provided base string.
 *
 * This asynchronous function first converts the `baseSlug` into a standard slug using the `slugify`
 * utility. It then verifies the uniqueness of the generated slug by calling the provided `checkExists`
 * callback. If the slug already exists, the function appends a numeric counter (e.g., `-1`, `-2`, etc.)
 * to the base slug, incrementing the counter until a unique slug is found.
 *
 * @param baseSlug - The string to be transformed into a slug.
 * @param checkExists - An asynchronous function that checks whether a slug already exists and returns a Promise resolving to a boolean.
 * @returns A Promise that resolves to a unique slug string.
 *
 * @example
 * async function doesSlugExist(slug: string): Promise<boolean> {
 *   // Check against a database or a collection of existing slugs
 *   return existingSlugs.has(slug);
 * }
 *
 * const uniqueSlug = await generateUniqueSlug("Example Base", doesSlugExist);
 * // uniqueSlug could be "example-base" or "example-base-1" if the initial slug already exists.
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const slug = slugify(baseSlug);
  let counter = 1;
  let finalSlug = slug;
  const checkedSlugs = new Set<string>();

  while (await checkExists(finalSlug)) {
    checkedSlugs.add(finalSlug);
    finalSlug = `${slug}-${counter}`;
    // Skip if we've already checked this slug
    while (checkedSlugs.has(finalSlug)) {
      counter++;
      finalSlug = `${slug}-${counter}`;
    }
    counter++;
  }

  return finalSlug;
}