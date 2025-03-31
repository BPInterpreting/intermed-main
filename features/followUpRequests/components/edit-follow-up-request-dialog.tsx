'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { z } from "zod"

import { useConfirm } from "@/hooks/use-confirm"
import {useUpdateInterpreter} from "@/features/interpreters/hooks/use-update-interpreter";
import {InterpreterForm} from "@/features/interpreters/components/interpreterForm";
import {insertFollowUpRequestSchema, insertInterpreterSchema} from "@/db/schema";
import {useCreateInterpreter} from "@/features/interpreters/api/use-create-interpreter";
import {useEditInterpreter} from "@/features/interpreters/api/use-edit-interpreter";
import {useDeleteInterpreter} from "@/features/interpreters/api/use-delete-interpreter";
import {useGetIndividualInterpreter} from "@/features/interpreters/api/use-get-individual-interpreter";
import {Loader2} from "lucide-react";
import {useUpdateFollowUpRequest} from "@/features/followUpRequests/hooks/use-update-follow-up-request";
import {useEditFollowUpRequest} from "@/features/followUpRequests/api/use-edit-follow-up-request";
import {useDeleteFollowUpRequest} from "@/features/followUpRequests/api/use-delete-follow-up-request";
import {useGetIndividualFollowUpRequest} from "@/features/followUpRequests/api/use-get-individual-follow-up-request";
import {FollowUpRequestForm} from "@/features/followUpRequests/components/followUpRequestForm";
import FollowUpRequests from "@/app/api/[[...route]]/followUpRequests";

const formSchema = insertFollowUpRequestSchema.pick({
    date: true,
    startTime: true,
    projectedDuration: true,
    notes: true,
    appointmentType: true,
    status: true,
})

type FormValues = z.input<typeof formSchema>

export const EditFollowUpRequestDialog = () => {
    const {isOpen, onClose, id} = useUpdateFollowUpRequest()
    const editMutation = useEditFollowUpRequest(id ?? '')
    const deleteMutation = useDeleteFollowUpRequest(id ?? '')
    const followUpRequestQuery = useGetIndividualFollowUpRequest(id)

    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure you want to delete this follow up request?',
        "You are about to delete a follow up request. This action cannot be undone."
    )

    //allow form suspension while the data is being fetched to avoid user spamming
    const isPending = editMutation.isPending || deleteMutation.isPending

    const isLoading = followUpRequestQuery.isLoading

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

    const defaultValues = followUpRequestQuery.data ? {
        date: followUpRequestQuery.data.date ? new Date(followUpRequestQuery.data.date) : new Date(),
        startTime: followUpRequestQuery.data.startTime,
        projectedDuration: followUpRequestQuery.data.projectedDuration,
        notes: followUpRequestQuery.data.notes,
        appointmentType: followUpRequestQuery.data.appointmentType,
        status: followUpRequestQuery.data.status,
    } : {
        date: new Date(),
        startTime: '',
        projectedDuration: '' ,
        notes: '',
        appointmentType: '',
        status: '',
    }

     return(
         <>
             <ConfirmDialog />
             <Dialog open={isOpen} onOpenChange={onClose}>
                 <DialogContent className='space-y-4'>
                     <DialogHeader>
                         <DialogTitle>Edit Follow Up Request</DialogTitle>
                         <DialogDescription>
                             Edit any part of the form below to update the follow up request
                         </DialogDescription>
                     </DialogHeader>
                     {/*conditianl rendering automatically enables default values  */}
                     {
                         isLoading ? (
                             <div className='absolute inset-0 flex items-center justify-center'>
                                 <Loader2 className='size-4 text-muted-foreground animate-spin' />
                             </div>
                         ) : (
                             <FollowUpRequestForm
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