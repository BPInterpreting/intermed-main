import "dotenv/config"
import { db } from "@/db/drizzle";
import { appointments } from "@/db/schema";
import { isNull, not, eq } from "drizzle-orm";

async function migrateNotes() {
    console.log("🚀 Starting notes migration...");

    // 1. Find all appointments that have data in the old 'notes' column
    const appointmentsToMigrate = await db
        .select()
        .from(appointments)
        .where(not(isNull(appointments.notes)));

    if (appointmentsToMigrate.length === 0) {
        console.log("✅ No notes to migrate. Exiting.");
        return;
    }

    console.log(`🔍 Found ${appointmentsToMigrate.length} appointments with notes to migrate.`);

    // 2. Loop through each one and move the data
    for (const appt of appointmentsToMigrate) {
        if (appt.status === "Closed") {
            // If completed, assume it's an interpreter's closing note
            await db
                .update(appointments)
                .set({ interpreterNotes: appt.notes })
                .where(eq(appointments.id, appt.id));
        } else {
            // Otherwise, assume it's an admin's instructional note
            await db
                .update(appointments)
                .set({ adminNotes: appt.notes })
                .where(eq(appointments.id, appt.id));
        }
    }

    console.log("🎉 Migration complete!");
}

migrateNotes().catch(console.error);