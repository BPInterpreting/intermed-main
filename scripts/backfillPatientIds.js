// scripts/backfillPatientIds.ts



import { db } from '../db/drizzle'
import { patient } from "../db/schema" ; // adjust path to your schema
import { isNull, eq } from 'drizzle-orm';


async function backfillPatientIds() {
    // Get all patients without patient IDs, ordered by creation date
    const patientsWithoutIds = await db.select()
        .from(patient)
        .where(isNull(patient.patientId))
        .orderBy(patient.createdAt);

    console.log(`Found ${patientsWithoutIds.length} patients without IDs`);

    for (let i = 0; i < patientsWithoutIds.length; i++) {
        const patientId = `PAT-2024-${(i + 1).toString().padStart(3, '0')}`;

        await db.update(patient)
            .set({ patientId })
            .where(eq(patient.id, patientsWithoutIds[i].id));

        console.log(`Updated patient ${patientsWithoutIds[i].firstName} ${patientsWithoutIds[i].lastName} with ID: ${patientId}`);
    }

    console.log('Backfill complete!');
}

backfillPatientIds().catch(console.error);