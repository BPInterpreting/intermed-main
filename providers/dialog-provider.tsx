'use client'

import { NewPatientDialog } from "@/features/patients/components/new-patient-dialog";
import {EditPatientDialog} from "@/features/patients/components/edit-patient-dialog";
import {useMountedState} from "react-use";
import {NewFacilityDialog} from "@/features/facilities/components/new-facility-dialog";
import {EditFacilityDialog} from "@/features/facilities/components/edit-facility-dialog";
import {NewAppointmentDialog} from "@/features/appointments/components/new-appointment-dialog";
import {EditAppointmentDialog} from "@/features/appointments/components/edit-appointment-dialog";
import {EditInterpreterDialog} from "@/features/interpreters/components/edit-interpreter-dialog";
import { NewPayerDialog } from "@/features/payers/components/new-payer-dialog";
import { EditPayerDialog } from "@/features/payers/components/edit-payer-dialog";
import { NewPayerRateDialog } from "@/features/payers/components/new-payer-rate-dialog";
import { EditPayerRateDialog } from "@/features/payers/components/edit-payer-rate-dialog";
import { GeneratePayoutsDialog } from "@/features/payouts/components/generate-payouts-dialog";
import { ProcessPayoutDialog } from "@/features/payouts/components/process-payout-dialog";
import { MarkPaidDialog } from "@/features/payouts/components/mark-paid-dialog"; 
import { NewInterpreterRateDialog } from "@/features/interpreters/components/new-interpreter-rate-dialog";
import { EditInterpreterRateDialog } from "@/features/interpreters/components/edit-interpreter-rate-dialog";


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

            <EditInterpreterDialog />

            <NewPayerDialog />
            <EditPayerDialog />

            <NewPayerRateDialog />
            <EditPayerRateDialog />

            {/* Payout dialogs */}
            <GeneratePayoutsDialog />
            <ProcessPayoutDialog />
            <MarkPaidDialog />

            <NewInterpreterRateDialog />
            <EditInterpreterRateDialog />
        
            
        </>
    )
}