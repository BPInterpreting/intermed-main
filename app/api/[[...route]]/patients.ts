// authors.ts
import { Hono } from 'hono'

const app = new Hono()


// all the '/' routes are relative to the base path of this file which is /api/patients
app.get('/', (c) => c.json('list patients'))
app.post('/', (c) => c.json('create a patient', 201))
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app