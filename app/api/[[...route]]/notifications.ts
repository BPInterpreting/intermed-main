import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import {appointments, facilities, notifications} from '@/db/schema';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { clerkClient } from '@clerk/nextjs/server';
import {format, parse} from "date-fns";


export async function createAdminNotification(message: string, appointmentId?: string) {
    console.log("\n--- [createAdminNotification] START ---");
    console.log(`[1] Received message: "${message}"`);
    console.log(`[2] Received appointmentId: ${appointmentId}`);

    try {
        const client = await clerkClient();
        const users = await client.users.getUserList({ limit: 499 });
        const adminUsers = users.data.filter(user => (user.publicMetadata as { role?: string })?.role === 'admin');

        if (adminUsers.length === 0) {
            console.log("[X] No admin users found. Exiting.");
            return;
        }

        let subtext: string | undefined = undefined;

        if (appointmentId) {
            const [appointmentDetails] = await db
                .select({
                    facilityName: facilities.name,
                    facilityAddress: facilities.address,
                    date: appointments.date,
                    startTime: appointments.startTime,
                })
                .from(appointments)
                .innerJoin(facilities, eq(appointments.facilityId, facilities.id))
                .where(eq(appointments.id, appointmentId))
                .limit(1)

            console.log("[3] Fetched appointment details from DB:", appointmentDetails);

            if (appointmentDetails) {
                const formattedDate = format(new Date(appointmentDetails.date), "PPP");
                const parsedTime = parse(appointmentDetails.startTime, "HH:mm:ss", new Date());
                const formattedTime = format(parsedTime, "p");
                subtext = `${appointmentDetails.facilityName} - ${formattedDate} at ${formattedTime}`;
                console.log(`[4] ✅ Successfully created subtext: "${subtext}"`);
            } else {
                console.log("[4] ❌ Appointment details not found for ID. Subtext will be null.");
            }
        } else {
            console.log("[3] No appointmentId provided. Skipping subtext creation.");
        }

        const adminUserIds = adminUsers.map(user => user.id);
        const notificationRecords = adminUserIds.map(userId => ({
            id: createId(),
            userId: userId,
            message: message,
            subtext: subtext,
            link: appointmentId ? `/admin/dashboard/appointments/${appointmentId}` : undefined,
        }));

        console.log("[5] Preparing to insert notification:", notificationRecords[0]);
        await db.insert(notifications).values(notificationRecords);
        console.log("[6] ✅ Successfully inserted into DB.");

        const { publishUserNotification } = await import('@/lib/ably');
        for (const record of notificationRecords) {
            await publishUserNotification(record.userId, 'new-notification', record);
        }

    } catch (error) {
        console.error("[X] ❌ An error occurred in createAdminNotification:", error);
    } finally {
        console.log("--- [createAdminNotification] END ---\n");
    }
}


const app = new Hono()
    .get(
        '/',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const data = await db
                .select()
                .from(notifications)
                .where(eq(notifications.userId, auth.userId))
                .orderBy(desc(notifications.createdAt));

            return c.json({ data });
        }
    )
    .get(
        '/summary',
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const allUserNotifications = await db
                .select({
                    id: notifications.id,
                    message: notifications.message,
                    subtext: notifications.subtext,
                    isRead: notifications.isRead,
                    createdAt: notifications.createdAt,
                    link: notifications.link,
                })
                .from(notifications)
                .where(eq(notifications.userId, auth.userId))
                .orderBy(desc(notifications.createdAt));

            const unreadCount = allUserNotifications.filter(n => !n.isRead).length;
            const latestNotifications = allUserNotifications.slice(0, 5);

            return c.json({
                unreadCount,
                latestNotifications
            });
        }
    )
    .post(
        '/mark-read',
        clerkMiddleware(),
        zValidator('json', z.object({
            ids: z.array(z.string()),
        })),
        async (c) => {
            const auth = getAuth(c);
            const { ids } = c.req.valid('json');
            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            if (ids.length === 0) {
                return c.json({ data: [] });
            }

            const data = await db
                .update(notifications)
                .set({ isRead: true })
                .where(
                    and(
                        eq(notifications.userId, auth.userId),
                        inArray(notifications.id, ids)
                    )
                )
                .returning();

            return c.json({ data });
        }
    );


export default app;

