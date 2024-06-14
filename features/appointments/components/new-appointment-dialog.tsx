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
import {AppointmentForm} from "@/features/appointments/components/appointmentForm";
import {Loader2} from "lucide-react";

const formSchema  = insertAppointmentSchema.omit({
    id: true,
})

type FormValues = z.input<typeof formSchema>

export const NewAppointmentDialog = () => {
    const {isOpen, onClose} = useNewAppointment()
    const createMutation = useCreateAppointment()

    // facilityQuery is used to load the facilities from the database
    const facilityQuery = useGetFacilities()
    const facilityMutation = useCreateFacility()
    //used to create the facility from the dropdown input field
    const onCreateFacility = (name: string) => {
        facilityMutation.mutate({
            name
        })
    }
    const facilityOptions = (facilityQuery.data ?? []).map(facility => ({
        label: facility.name,
        value: facility.id
    }))

    // patientQuery is used to load the patients from the database
    const patientQuery = useGetPatients()
    const patientMutation = useCreatePatient()
    //used to create the patient from the dropdown input field
    const onCreatePatient = (firstName: string) => {
        patientMutation.mutate({
            firstName
        })
    }
    const patientOptions = (patientQuery.data ?? []).map(facility => ({
        label: facility.firstName,
        value: facility.id
    }))

    //disables the form while the mutation is pending
    const isPending = createMutation.isPending || facilityMutation.isPending || patientMutation.isPending

    //displays a loading spinner while the query is in progress
    const isLoading = facilityQuery.isLoading || patientQuery.isLoading


    const onSubmit = (values: FormValues) => {
        createMutation.mutate(values, {
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
                 {/*conditional rendering is needed since patient and facility data needs to be loaded */}
                 {isLoading ? (
                     <div className='absolute inset-0 flex items-center'>
                         <Loader2 className='size-4 text-muted-foreground'/>
                     </div>
                 ) : (
                     <AppointmentForm
                        onSubmit={onSubmit}
                        disabled={isPending}
                        facilityOptions={facilityOptions}
                        patientOptions={patientOptions}
                        onCreateFacility={onCreateFacility}
                        onCreatePatient={onCreatePatient}
                     />
                 )}
             </DialogContent>
         </Dialog>
     )
}