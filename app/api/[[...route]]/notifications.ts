import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { notifications } from '@/db/schema';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { clerkClient } from '@clerk/nextjs/server';

export async function createAdminNotification(message: string, appointmentId?: string) {
    // --- DEBUGGING LOGS START ---
    console.log("\n--- [createAdminNotification] START ---");
    console.log(`[1] Received message: "${message}"`);

    try {
        const client = await clerkClient();
        const users = await client.users.getUserList({ limit: 499 });
        console.log(`[2] Fetched ${users.data.length} total users from Clerk.`);

        const adminUsers = users.data.filter(user => (user.publicMetadata as { role?: string })?.role === 'admin');
        console.log(`[3] Found ${adminUsers.length} user(s) with the 'admin' role.`);

        if (adminUsers.length === 0) {
            console.log("[4] No admin users found. Exiting function. Check Clerk public metadata.");
            console.log("--- [createAdminNotification] END ---\n");
            return; // Exit if no admins are found
        }

        const adminUserIds = adminUsers.map(user => user.id);
        const notificationRecords = adminUserIds.map(userId => ({
            id: createId(),
            userId: userId,
            message: message,
            link: appointmentId ? `/admin/dashboard/appointments/${appointmentId}` : undefined,
        }));

        console.log(`[4] Preparing to insert ${notificationRecords.length} notification(s) into the database.`);
        await db.insert(notifications).values(notificationRecords);
        console.log(`[5] ✅ Successfully inserted notifications into the database!`);

        const { publishUserNotification } = await import('@/lib/ably');
        for (const record of notificationRecords) {
            await publishUserNotification(record.userId, 'new-notification', record);
        }
        console.log("--- [createAdminNotification] END ---\n");

    } catch (error) {
        console.error("[X] ❌ An error occurred in createAdminNotification:", error);
        console.log("--- [createAdminNotification] END ---\n");
    }
}


const app = new Hono()
    // ... (rest of the file is unchanged) ...
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
                    isRead: notifications.isRead,
                    createdAt: notifications.createdAt,
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

