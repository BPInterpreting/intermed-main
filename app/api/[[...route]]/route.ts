// this is the catch all route where every single route will go to this file
//the default api route provided by NextJs is hijacked by Hono allowing us to use the Hono API

import { Hono } from 'hono'
import { cors } from "hono/cors";
import { handle } from 'hono/vercel'
import patients from "@/app/api/[[...route]]/patients";
import facilities from "@/app/api/[[...route]]/facilities";
import appointments from "@/app/api/[[...route]]/appointments";
import interpreters from "@/app/api/[[...route]]/interpreters";
import followUpRequests from "@/app/api/[[...route]]/followUpRequests";
import notifications from "@/app/api/[[...route]]/notifications";

// export const runtime = 'edge';
//initialize the new hono api instance where base is out /api route
const app = new Hono().basePath('/api')
app.use('*', cors({
    origin: [
        // Development/local origins
        'http://localhost:8081',
        'https://localhost:3000',
        // Old domain (keep until new domain is fully migrated)
        'https://www.pena-med.com',
        // Old Vercel URL (keep until new one is confirmed working)
        'https://intermed-main.vercel.app',
        // New Vercel URL (after repo rename)
        'https://interprefi.vercel.app',
        // New custom domain
        'https://interprefi.com',
        'https://www.interprefi.com',
    ],
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
}))

//chained elements to the Hono app are the routes that are going to be used
const route = app
    .route('/patients', patients)
    .route('/facilities', facilities)
    .route('/appointments', appointments)
    .route('/interpreters', interpreters)
    .route('/followUpRequests', followUpRequests)
    .route('/notifications', notifications)

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof route