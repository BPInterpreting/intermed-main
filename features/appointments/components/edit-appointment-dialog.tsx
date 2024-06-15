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
import {insertAppointmentSchema} from "@/db/schema";
import {useUpdateAppointment} from "@/features/appointments/hooks/use-update-appointment";
import {useConfirm} from "@/hooks/use-confirm";
import {Loader2} from "lucide-react";
import {AppointmentForm} from "@/features/appointments/components/appointmentForm";
import {useEditAppointment} from "@/features/appointments/api/use-edit-appointment";
import {useGetIndividualAppointment} from "@/features/appointments/api/use-get-individual-appointment";
import {useDeleteAppointment} from "@/features/appointments/api/use-delete-appointment";
import {useGetFacilities} from "@/features/facilities/api/use-get-facilities";
import {useCreateFacility} from "@/features/facilities/api/use-create-facility";
import {useGetPatients} from "@/features/patients/api/use-get-patients";
import {useCreatePatient} from "@/features/patients/api/use-create-patient";

const formSchema  = insertAppointmentSchema.omit
({
   id: true,
})

type FormValues = z.input<typeof formSchema>

export const EditAppointmentDialog = () => {
    const {isOpen, onClose, id} = useUpdateAppointment()
    const editMutation = useEditAppointment(id)
    const appointmentQuery = useGetIndividualAppointment(id)
    const deleteMutation = useDeleteAppointment(id)

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


    const isPending = editMutation.isPending || deleteMutation.isPending || patientMutation.isPending || facilityMutation.isPending || appointmentQuery.isLoading

    const isLoading = appointmentQuery.isLoading || patientQuery.isLoading || facilityQuery.isLoading

    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure you want to delete this appointment?',
        "You are about to delete an appointment . This action cannot be undone."
    )

    const defaultValues = appointmentQuery.data ? {
        patientId: appointmentQuery.data.patientId,
        facilityId: appointmentQuery.data.facilityId,
        date: appointmentQuery.data.date ? new Date(appointmentQuery.data.date) : new Date(),
        notes: appointmentQuery.data.notes
    } : {
        patientId: '',
        facilityId: '',
        date: new Date(),
        notes: ''
    }

    const onDelete = async () => {
        const ok = await confirm()

        if(ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose()
                }
            })
        }
    }


    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

     return(
         <>
             <ConfirmDialog />
             <Dialog open={isOpen} onOpenChange={onClose}>
                 <DialogContent>
                     <DialogHeader>
                         <DialogTitle>Edit Appointment Form</DialogTitle>
                         <DialogDescription>
                             Fill out details to edit appointment.
                         </DialogDescription>
                     </DialogHeader>
                     {
                         isLoading ? (
                             <div className='absolute inset-0 flex items-center justify-center'>
                                 <Loader2 className='size-4 text-muted-foreground animate-spin' />
                             </div>
                         ) : (
                             <AppointmentForm
                                 id={id}
                                 onSubmit={onSubmit}
                                 disabled={isPending}
                                 defaultValues={defaultValues}
                                 onDelete={onDelete}
                                 facilityOptions={facilityOptions}
                                 patientOptions={patientOptions}
                                 onCreateFacility={onCreateFacility}
                                 onCreatePatient={onCreatePatient}
                             />
                         )
                     }
                 </DialogContent>
             </Dialog>
         </>

     )
}