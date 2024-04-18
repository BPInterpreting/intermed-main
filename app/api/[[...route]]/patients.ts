// authors.ts
import { Hono } from 'hono'
import { db } from '@/db/drizzle'
import {patient} from "@/db/schema";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

//part of RPC is to create a schema for the validation that is used in the post request
const schema = z.object({
    firstName: z.string(),
})

const app = new Hono()


// all the '/' routes are relative to the base path of this file which is /api/patients
app.get('/', async (c) => {
    // the get request will return all the patients in the database
    const patients = await db.query.patient.findMany({
        orderBy: (patient, {desc}) => [desc(patient.firstName)]
    })
    return c.json(patients)
})

app.post(
    '/',
    //TODO:add verify auth middleware
    zValidator("form", schema),
    async (c) => {
        //access data from the frontend
        const data = c.req.valid("form")

        //TODO: throw HTTP exception from Hono if there is no user
        const newPatient = await db.insert(patient).values({
            firstName: data.firstName
        })

        return c.json(newPatient)
})


export default app