'use client'

import { NewPatientDialog } from "@/features/patients/components/new-patient-dialog";
import {EditPatientDialog} from "@/features/patients/components/edit-patient-dialog";
import {useMountedState} from "react-use";
import {NewFacilityDialog} from "@/features/facilities/components/new-facility-dialog";
import {EditFacilityDialog} from "@/features/facilities/components/edit-facility-dialog";
import {NewAppointmentDialog} from "@/features/appointments/components/new-appointment-dialog";
import {EditAppointmentDialog} from "@/features/appointments/components/edit-appointment-dialog";


export const DialogProvider = ( ) => {
    const isMounted = useMountedState()

    if (!isMounted) return null

    return (
        <>
            <NewPatientDialog />
            <EditPatientDialog />

            <NewFacilityDialog />
            <EditFacilityDialog />

            <NewAppointmentDialog />
            <EditAppointmentDialog />
        </>
    )
}