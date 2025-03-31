import {Hono} from "hono";
import {db} from "@/db/drizzle";
import {followUpRequest, insertFollowUpRequestSchema} from "@/db/schema";
import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {zValidator} from "@hono/zod-validator";
import {z} from "zod";
import {and, eq} from "drizzle-orm";
import {createId} from "@paralleldrive/cuid2";

const app = new Hono()
    .get(
        '/',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({error: "Unauthorized"}, 401)
            }

            let data = await db
                .select({
                    id: followUpRequest.id,
                    date: followUpRequest.date,
                    startTime: followUpRequest.startTime,
                    projectedDuration: followUpRequest.projectedDuration,
                    notes: followUpRequest.notes,
                    appointmentType: followUpRequest.appointmentType,
                    status: followUpRequest.status,
                    newFacilityAddress: followUpRequest.newFacilityAddress,
                    patientId: followUpRequest.patientId,
                    facilityId: followUpRequest.facilityId,
                    interpreterId: followUpRequest.interpreterId,
                })
                .from(followUpRequest)


            return c.json({data})
        })
    .get(
        '/:id',
        clerkMiddleware(),
        //TODO: add clerkMiddleware(),
        zValidator('param', z.object({
            id: z.string().optional()
        })),
        async (c) => {
            const auth = getAuth(c)

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401)
            }

                const {id} = c.req.valid('param')

                if (!id) {
                    return c.json({error: "Invalid id"}, 400)
                 }

                const [data] = await db
                    .select({
                        id: followUpRequest.id,
                        date: followUpRequest.date,
                        startTime: followUpRequest.startTime,
                        projectedDuration: followUpRequest.projectedDuration,
                        notes: followUpRequest.notes,
                        appointmentType: followUpRequest.appointmentType,
                        status: followUpRequest.status,
                        newFacilityAddress: followUpRequest.newFacilityAddress,
                        patientId: followUpRequest.patientId,
                        facilityId: followUpRequest.facilityId,
                        interpreterId: followUpRequest.interpreterId,
                    })
                    .from(followUpRequest)
                    .where(
                        and(
                            eq(followUpRequest.id, id)
                        )
                    )

                if (!data) {
                        return c.json({ error: "Invalid data" }, 400)
                }
                return c.json({data})
        })
    .post(
        '/',
        zValidator(
            'json',
            insertFollowUpRequestSchema.pick({
                date: true,
                startTime: true,
                projectedDuration: true,
                notes: true,
                appointmentType: true,
                status: true,
                newFacilityAddress: true,
                patientId: true,
                facilityId: true,
                interpreterId: true,
            })
        ),
        async (c) => {
            const values = c.req.valid('json')

            const [data] = await db.insert(followUpRequest).values({
                id: createId(),
                ...values
            }).returning()
            return c.json({data})
        })
    .patch(
        '/:id',
        zValidator('param', z.object({
                id: z.string()
            })),
        zValidator(
            'json',
            insertFollowUpRequestSchema.pick({
                date: true,
                startTime: true,
                projectedDuration: true,
                notes: true,
                appointmentType: true,
                status: true,
                newFacilityAddress: true,
                patientId: true,
                facilityId: true,
                interpreterId: true,
            })),
        async (c) => {
            const {id} = c.req.valid('param')
            const values = c.req.valid('json')

            if (!id) {
                return c.json({error: "Invalid id"}, 400)
            }

            const [data] = await db.update(followUpRequest).set(
                values
            ).where(
                eq(followUpRequest.id, id)
            ).returning()

            if (!data) {
                return c.json({error: "Follow up not found"}, 404)
            }

            return c.json({data})
        }
    )
    .delete(
        '/:id',
        // validate the id that is being passed in the delete request
        zValidator('param', z.object({
            id: z.string()
        })),
        async ({json, req: {valid}}) => {
            const { id } = valid('param')

            if (!id) {
                return json({ error: "Invalid id" }, 400)
            }

            //delete the facility values according to drizzle update method.check if the facility id matches the id in the database
            const [data] = await db
                .delete(followUpRequest)
                .where(
                    and(
                        eq(followUpRequest.id, id)
                    )
                ).returning()

            if (!data) {
                return json({ error: "Follow up not found" }, 404)
            }
            return json({ data })
        }
    )

export default app