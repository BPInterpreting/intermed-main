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

import { useUpdatePatient } from "@/features/patients/hooks/use-update-patient";
import PatientForm from "@/features/patients/components/patientForm";
import {insertPatientSchema} from "@/db/schema";
import {useCreatePatient} from "@/features/patients/api/use-create-patient";
import {useEditPatient} from "@/features/patients/api/use-edit-patient";
import {useGetSinglePatient} from "@/features/patients/api/use-get-single-patient";


const formSchema  = insertPatientSchema.pick({
    firstName: true,
})

type FormValues = z.input<typeof formSchema>

export const EditPatientDialog = () => {
    const {isOpen, onClose, id} = useUpdatePatient()
    const editMutation = useEditPatient(id)
    const patientQuery = useGetSinglePatient(id)
    const isPending = editMutation.isPending

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    const defaultValues = patientQuery.data ? {
        firstName: patientQuery.data.firstName
    }: {
        firstName: ''
    }


     return(
         <Dialog open={isOpen} onOpenChange={onClose}>
             <DialogContent className='space-y-4'>
                 <DialogHeader>
                     <DialogTitle>Edit patient </DialogTitle>
                     <DialogDescription>
                         Edit any part of the form below to update the patient
                     </DialogDescription>
                 </DialogHeader>
                 <PatientForm
                     id={id}
                     onSubmit={onSubmit}
                     disabled={isPending}
                     defaultValues={defaultValues}
                 />
             </DialogContent>
         </Dialog>
     )
}