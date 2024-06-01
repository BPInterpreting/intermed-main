'use client'

import { NewPatientDialog } from "@/features/patients/components/new-patient-dialog";
import {EditPatientDialog} from "@/features/patients/components/edit-patient-dialog";
import {useMountedState} from "react-use";


export const DialogProvider = ( ) => {
    const isMounted = useMountedState()

    if (!isMounted) return null

    return (
        <>
            <NewPatientDialog />
            <EditPatientDialog />
        </>
    )
}