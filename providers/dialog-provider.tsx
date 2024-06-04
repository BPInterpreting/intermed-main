'use client'

import { NewPatientDialog } from "@/features/patients/components/new-patient-dialog";
import {EditPatientDialog} from "@/features/patients/components/edit-patient-dialog";
import {useMountedState} from "react-use";
import {NewFacilityDialog} from "@/features/facilities/components/new-facility-dialog";
import {EditFacilityDialog} from "@/features/facilities/components/edit-facility-dialog";


export const DialogProvider = ( ) => {
    const isMounted = useMountedState()

    if (!isMounted) return null

    return (
        <>
            <NewPatientDialog />
            <EditPatientDialog />

            <NewFacilityDialog />
            <EditFacilityDialog />
        </>
    )
}