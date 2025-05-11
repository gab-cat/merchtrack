import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { JWT_KEY } from '@/config';

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
  '/track-order',
  '/products(.*)',
  '/how-it-works',
]);

const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

const isApiRoute = createRouteMatcher([
  '/api(.*)',
]);

/**
 * Verifies JWT token from API requests
 * 
 * @param req - The incoming API request
 * @returns NextResponse object or null if verification succeeds
 */
async function verifyApiJwt(req: NextRequest): Promise<NextResponse | null> {
  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }
  
  try {
    const token = authorization.split(" ")[1];
    const jwtKey = JWT_KEY ?? '';
    if (!jwtKey) {
      return NextResponse.json({
        status: 500,
        message: "Server configuration error",
      }, { status: 500 });
    }
    
    const secret = new TextEncoder().encode(jwtKey);
    const verifyResult = await jose.jwtVerify(token, secret);
    
    // Add the verified payload to request headers for downstream handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-auth-user', JSON.stringify(verifyResult.payload));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return NextResponse.json({
      status: 401,
      message: "Invalid token",
    }, { status: 401 });
  }
}

export default clerkMiddleware(async (auth, req: NextRequest) => {

  if (isApiRoute(req)) {
    // Call the extracted verification function
    const verificationResult = await verifyApiJwt(req);
    if (verificationResult) {
      return verificationResult;
    }
    // If verificationResult is null, continue with middleware execution
  }

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


