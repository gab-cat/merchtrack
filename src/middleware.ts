import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Configuration object used to define routing and matching rules.
 *
 * @property {Array<string>} matcher An array of path-matching rules. It includes:
 *   - Rules to skip Next.js internals and static files unless they appear in search parameters.
 *   - Rules to always run matching for API routes.
 */
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

/**
 * `isPublicRoute` is a route matcher function that determines
 * whether a given route path corresponds to a publicly accessible route in the application.
 *
 *
 * Any routes matching these patterns will be identified as public routes.
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/img(.*)',
  '/monitoring(.*)',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/admin/orders(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    return (await auth()).redirectToSignIn();
  }
  return null;
});

