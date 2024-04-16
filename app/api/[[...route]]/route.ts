// this is the catch all route where every single route will go to this file
//the default api route provided by NextJs is hijacked by Hono allowing us to use the Hono API

import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge';

//initialize the new hono api instance where base is out /api route
const app = new Hono().basePath('/api')

//c refers to the controller
app.get('/hello', (c) => {
    return c.json({
        message: 'Hello Next.js!',
    })
})

export const GET = handle(app)
export const POST = handle(app)