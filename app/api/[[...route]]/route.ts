// this is the catch all route where every single route will go to this file
//the default api route provided by NextJs is hijacked by Hono allowing us to use the Hono API

import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import patients from "@/app/api/[[...route]]/patients";
import facilities from "@/app/api/[[...route]]/facilities";
import appointments from "@/app/api/[[...route]]/appointments";

export const runtime = 'edge';

//initialize the new hono api instance where base is out /api route
const app = new Hono().basePath('/api')

//chained elements to the Hono app are the routes that are going to be used
const route = app
    .route('/patients', patients)
    .route('/facilities', facilities)
    .route('/appointments', appointments)

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof route