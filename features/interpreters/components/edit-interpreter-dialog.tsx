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
import {useUpdateInterpreter} from "@/features/interpreters/hooks/use-update-interpreter";
import {InterpreterForm} from "@/features/interpreters/components/interpreterForm";
import {insertInterpreterSchema} from "@/db/schema";
import {useCreateInterpreter} from "@/features/interpreters/api/use-create-interpreter";
import {useEditInterpreter} from "@/features/interpreters/api/use-edit-interpreter";
import {useDeleteInterpreter} from "@/features/interpreters/api/use-delete-interpreter";
import {useGetIndividualInterpreter} from "@/features/interpreters/api/use-get-individual-interpreter";
import {Loader2} from "lucide-react";

const formSchema  = insertInterpreterSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phoneNumber: true,
    targetLanguages: true,
    isCertified: true,
    specialty: true,
    coverageArea: true
})

type FormValues = z.input<typeof formSchema>

export const EditPatientDialog = () => {
    //the id from the useUpdatePatient hook is used to get the patient data in the useGetIndividualPatient hook
    const {isOpen, onClose, id} = useUpdateInterpreter()
    const editMutation = useEditInterpreter(id ?? '')
    const deleteMutation = useDeleteInterpreter(id ?? '')
    const interpreterQuery = useGetIndividualInterpreter(id ?? '')

    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure you want to delete this interpreter?',
        "You are about to delete an interpreter. This action cannot be undone."
    )

    //allow form suspension while the data is being fetched to avoid user spamming
    const isPending = editMutation.isPending || deleteMutation.isPending

    const isLoading = interpreterQuery.isLoading

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

    const defaultValues = interpreterQuery.data ? {
        firstName: interpreterQuery.data.firstName,
        lastName: interpreterQuery.data.lastName,
        email: interpreterQuery.data.email,
        phoneNumber: interpreterQuery.data.phoneNumber,
        targetLanguages: interpreterQuery.data.targetLanguages,
        isCertified: interpreterQuery.data.isCertified,
        specialty: interpreterQuery.data.specialty,
        coverageArea: interpreterQuery.data.coverageArea

    }: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        targetLanguages: '',
        isCertified: false,
        specialty: '',
        coverageArea: ''

    }

     return(
         <>
             <ConfirmDialog />
             <Dialog open={isOpen} onOpenChange={onClose}>
                 <DialogContent className='space-y-4'>
                     <DialogHeader>
                         <DialogTitle>Edit Interpreter </DialogTitle>
                         <DialogDescription>
                             Edit any part of the form below to update the interpreter
                         </DialogDescription>
                     </DialogHeader>
                     {/*conditianl rendering automatically enables default values  */}
                     {
                         isLoading ? (
                             <div className='absolute inset-0 flex items-center justify-center'>
                                 <Loader2 className='size-4 text-muted-foreground animate-spin' />
                             </div>
                         ) : (
                             <InterpreterForm
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