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

import {useNewPatient} from "@/app/(dashboard)/patients/hooks/use-new-patient";
import PatientForm from "@/app/(dashboard)/patients/components/patientForm";
import {insertPatientSchema} from "@/db/schema";
import {useCreatePatient} from "@/app/(dashboard)/patients/api/use-create-patient";

const formSchema  = insertPatientSchema.pick({
    firstName: true,
})

type FormValues = z.input<typeof formSchema>





export const NewPatientDialog = () => {
    const {isOpen, onClose} = useNewPatient()
    const mutation = useCreatePatient()

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }
    // const {isOpen, onClose}  = useNewPatient()

     return(
         <Dialog open={isOpen} onOpenChange={onClose}>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>New Patient Form</DialogTitle>
                     <DialogDescription>
                         Fill out the form below to add a new patient to the system.
                     </DialogDescription>
                 </DialogHeader>
                 <PatientForm
                     onSubmit={onSubmit}
                     disabled={mutation.isPending}
                     defaultValues={{firstName: ''}}
                 />
             </DialogContent>
         </Dialog>
     )
}