'use client'

import { NewPatientDialog } from "@/app/(dashboard)/patients/[patientId]/components/new-patient-dialog";


export const DialogProvider = ( ) => {
    // const isMounted = useMountedState()
    //
    // if (!isMounted()) return null

    return (
        <>
            <NewPatientDialog />
        </>
    )
}