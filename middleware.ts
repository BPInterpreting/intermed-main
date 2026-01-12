import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import {NextResponse} from "next/server";


const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isAdminLoginRoute = createRouteMatcher(['/admin/login'])
// Protect all admin routes except /admin/login
const isProtectedAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
    // Handle /admin/login route
    if (isAdminLoginRoute(req)) {
        // If user is already logged in, check if they're an admin
        const { sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;
        
        // If already logged in as admin, redirect to dashboard
        if (role === 'admin') {
            const url = new URL('/admin/dashboard/home', req.url);
            return NextResponse.redirect(url);
        }
        
        // Otherwise, allow access to login page (even if logged in as non-admin)
        return NextResponse.next();
    }

    // Protect all other admin routes
    if (isProtectedAdminRoute(req)) {
        await auth.protect();
    }

    const { sessionId, sessionClaims } = await auth();

    // Check admin role for all admin routes (except login)
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (isAdminRoute(req) && !isAdminLoginRoute(req) && role !== 'admin') {
        const url = new URL('/', req.url)
        return NextResponse.redirect(url)
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}