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

import { useConfirm } from "@/hooks/use-confirm"
import { useUpdatePatient } from "@/features/patients/hooks/use-update-patient";
import {PatientForm} from "@/features/patients/components/patientForm";
import {insertPatientSchema} from "@/db/schema";
import {useCreatePatient} from "@/features/patients/api/use-create-patient";
import {useEditPatient} from "@/features/patients/api/use-edit-patient";
import {useDeletePatient} from "@/features/patients/api/use-delete-patient";
import {useGetIndividualPatient} from "@/features/patients/api/use-get-individual-patient";
import {Loader2} from "lucide-react";

const formSchema  = insertPatientSchema.pick({
    firstName: true,
})

type FormValues = z.input<typeof formSchema>

export const EditPatientDialog = () => {
    //the id from the useUpdatePatient hook is used to get the patient data in the useGetIndividualPatient hook
    const {isOpen, onClose, id} = useUpdatePatient()
    const editMutation = useEditPatient(id)
    const deleteMutation = useDeletePatient(id)
    const patientQuery = useGetIndividualPatient(id)

    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure you want to delete this patient?',
        "You are about to delete a patient. This action cannot be undone."
    )

    //allow form suspension while the data is being fetched to avoid user spamming
    const isPending = editMutation.isPending || deleteMutation.isPending

    const isLoading = patientQuery.isLoading

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
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


    const defaultValues = patientQuery.data ? {
        firstName: patientQuery.data.firstName
    }: {
        firstName: ''
    }


     return(
         <>
             <ConfirmDialog />
             <Dialog open={isOpen} onOpenChange={onClose}>
                 <DialogContent className='space-y-4'>
                     <DialogHeader>
                         <DialogTitle>Edit patient </DialogTitle>
                         <DialogDescription>
                             Edit any part of the form below to update the patient
                         </DialogDescription>
                     </DialogHeader>
                     {/*conditianl rendering automatically enables default values  */}
                     {
                         isLoading ? (
                             <div className='absolute inset-0 flex items-center justify-center'>
                                 <Loader2 className='size-4 text-muted-foreground animate-spin' />
                             </div>
                         ) : (
                             <PatientForm
                                 id={id}
                                 onSubmit={onSubmit}
                                 disabled={isPending}
                                 defaultValues={defaultValues}
                                 onDelete={onDelete}
                             />
                         )
                     }
                 </DialogContent>
             </Dialog>
         </>
     )
}