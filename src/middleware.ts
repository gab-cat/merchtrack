import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

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
  '/contact',
  '/about',
  '/faqs',
  '/terms-of-service',
  '/privacy-policy',
  '/survey(.*)',
]);

const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {


  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // For users visiting /onboarding, don't try to redirect
  if (userId && isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && !isPublicRoute(req)) return redirectToSignIn({ returnBackUrl: req.url });

  // Catch users who do not have `onboardingComplete: true` in their publicMetadata
  if (userId && !sessionClaims?.metadata?.isOnboardingCompleted && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // If the user is admin and the route is protected, let them view.
  const isAdmin = sessionClaims?.metadata.data.isAdmin || sessionClaims?.metadata.data.isStaff;
  if (isAdmin && isAdminRoute(req)) return NextResponse.next();

  if (!isAdmin && isAdminRoute(req)) {
    return NextResponse.redirect(new URL('/404', req.url));
  }

  // If the user is logged in and the route is protected, let them view.
  if (userId && !isPublicRoute(req)) return NextResponse.next();

  // If visiting a public route, let the user view
  if (isPublicRoute(req)) return NextResponse.next();
});
