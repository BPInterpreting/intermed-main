'use client'

import { NewPatientDialog } from "@/features/patients/components/new-patient-dialog";


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