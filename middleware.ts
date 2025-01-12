import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import {NextResponse} from "next/server";


const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isProtectedRoute = createRouteMatcher(['/admin(.*)', '/'])

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect()

    const { sessionId, sessionClaims } = await auth();

    console.log("Session Claims: ", sessionClaims)
    console.log("Publishable Key: ", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)


    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (isAdminRoute(req) && role !== 'admin') {
        const url = new URL('/', req.url)
        return NextResponse.redirect(url)
        // (await auth()).sessionClaims?.metadata?.
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