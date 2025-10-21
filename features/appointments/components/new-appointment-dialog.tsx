'use client'

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {z} from "zod"
import {insertAppointmentSchema} from "@/db/schema";
import {useNewAppointment} from "@/features/appointments/hooks/use-new-appointments";
import {useCreateAppointment} from "@/features/appointments/api/use-create-appointment";
import {useGetPatients} from "@/features/patients/api/use-get-patients";
import {useGetFacilities} from "@/features/facilities/api/use-get-facilities";
import {AppointmentForm} from "@/features/appointments/components/appointmentForm";
import {Loader2} from "lucide-react";
import {useGetInterpreters} from "@/features/interpreters/api/use-get-interpreters";

const formSchema  = insertAppointmentSchema.omit({
    id: true,
})

type FormValues = z.input<typeof formSchema>

export const NewAppointmentDialog = () => {
    const {isOpen, onClose} = useNewAppointment()
    const createMutation = useCreateAppointment()

    // facilityQuery is used to load the facilities from the database
    const facilityQuery = useGetFacilities()
    // const facilityMutation = useCreateFollowUpRequest()
    //used to create the facility from the dropdown input field
    // const onCreateFacility = (name: string) => {
    //     facilityMutation.mutate({
    //         name
    //     })
    // }
    const facilityOptions = (facilityQuery.data ?? []).map(facility => ({
        label: facility.name,
        value: facility.id
    }))

    // patientQuery is used to load the patients from the database
    const patientQuery = useGetPatients()
    // const patientMutation = useCreatePatient()
    //used to create the patient from the dropdown input field
    // const onCreatePatient = (firstName: string) => {
    //     patientMutation.mutate({
    //         firstName
    //     })
    // }
    const patientOptions = (patientQuery.data ?? []).map(facility => ({
        label: facility.firstName + ' ' + facility.lastName,
        value: facility.id
    }))

    const interpreterQuery = useGetInterpreters()
    const interpreterOptions = (interpreterQuery.data ?? []).map(interpreter => ({
        label: interpreter.firstName + ' ' + interpreter.lastName,
        value: interpreter.id
    }))

    //disables the form while the mutation is pending
    const isPending = createMutation.isPending
        // || facilityMutation.isPending || patientMutation.isPending

    //displays a loading spinner while the query is in progress
    const isLoading = facilityQuery.isLoading || patientQuery.isLoading


    const onSubmit = (values: FormValues) => {
        // Cleaned up the values to match API expectations
        const cleanedValues = {
            ...values,
            offerMode: values.offerMode ?? undefined,  // Convert null to undefined
            isRushAppointment: values.isRushAppointment ?? undefined,  // Convert null to undefined
            // Remove interpreterId if in offer mode
            interpreterId: values.offerMode ? undefined : values.interpreterId ?? undefined
        }

        createMutation.mutate(cleanedValues, {
            onSuccess: () => {
                onClose()
            }
        })
        console.log(values)
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
                        interpreterOptions={interpreterOptions}
                        // onCreateFacility={onCreateFacility}
                        // onCreatePatient={onCreatePatient}
                     />
                 )}
             </DialogContent>
         </Dialog>
     )
}