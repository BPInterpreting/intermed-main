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

export const runtime = 'edge';
//initialize the new hono api instance where base is out /api route
const app = new Hono().basePath('/api')
app.use('*', cors({
    origin: ['http://localhost:8081', 'https://www.pena-med.com', 'https://intermed-main.vercel.app'],
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

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof route