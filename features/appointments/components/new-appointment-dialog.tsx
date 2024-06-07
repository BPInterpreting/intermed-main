'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"

import {useNewFacility} from "@/features/facilities/hooks/use-new-facility";
import {PatientForm} from "@/features/patients/components/patientForm";
import {insertAppointmentSchema} from "@/db/schema";
import {useCreateFacility} from "@/features/facilities/api/use-create-facility";
import {FacilityForm} from "@/features/facilities/components/facilityForm";
import {useNewAppointment} from "@/features/appointments/hooks/use-new-appointments";
import {useCreateAppointment} from "@/features/appointments/api/use-create-appointment";
import {useGetPatients} from "@/features/patients/api/use-get-patients";
import {useGetFacilities} from "@/features/facilities/api/use-get-facilities";
import {useCreatePatient} from "@/features/patients/api/use-create-patient";

const formSchema  = insertAppointmentSchema.omit({
    id: true,
})

type FormValues = z.input<typeof formSchema>

export const NewAppointmentDialog = () => {
    const {isOpen, onClose} = useNewAppointment()
    const mutation = useCreateAppointment()

    const facilityQuery = useGetFacilities()
    const facilityMutation = useCreateFacility()
    const onCreateFacility = (name: string) => {
        facilityMutation.mutate({
            name
        })
    }
    const facilityOptions = (facilityQuery.data ?? []).map(facility => ({
        label: facility.name,
        value: facility.id
    }))

    const patientQuery = useGetPatients()
    const patientMutation = useCreatePatient()
    const onCreatePatient = (firstName: string) => {
        patientMutation.mutate({
            firstName
        })
    }
    const patientOptions = (patientQuery.data ?? []).map(facility => ({
        label: facility.firstName,
        value: facility.id
    }))
    

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

     return(
         <Dialog open={isOpen} onOpenChange={onClose}>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>New Appointment Form</DialogTitle>
                     <DialogDescription>
                         Fill out the form below to add a new appointment to the system.
                     </DialogDescription>
                 </DialogHeader>

             </DialogContent>
         </Dialog>
     )
}