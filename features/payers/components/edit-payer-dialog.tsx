'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { useConfirm } from "@/hooks/use-confirm"
import { useOpenPayer } from "@/features/payers/hooks/use-open-payer"
import { PayerForm } from "@/features/payers/components/payer-form" // Fixed import path
import { insertPayerSchema } from "@/db/schema"
import { useGetPayer } from "@/features/payers/api/use-get-payer"
import { useUpdatePayer } from "@/features/payers/api/use-update-payer"
import { useDeletePayer } from "@/features/payers/api/use-delete-payer"

const formSchema = insertPayerSchema.pick({
    name: true,
    type: true,
    defaultHourlyRate: true,
    minimumHours: true,
    lateCancelFee: true,
    noShowFee: true,
    paymentTermsDays: true,
    billingCode: true,
    notes: true,
})

type FormValues = z.input<typeof formSchema>

export const EditPayerDialog = () => {
    const { isOpen, onClose, id } = useOpenPayer()
    const payerQuery = useGetPayer(id)
    const editMutation = useUpdatePayer(id)
    const deleteMutation = useDeletePayer(id)

    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure you want to deactivate this payer?',
        "This will mark the payer as inactive. You can reactivate them later."
    )

    const isPending = editMutation.isPending || deleteMutation.isPending
    const isLoading = payerQuery.isLoading

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    const onDelete = async () => {
        const ok = await confirm()
        if (ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose()
                }
            })
        }
    }

    const defaultValues = payerQuery.data ? {
        name: payerQuery.data.name,
        type: payerQuery.data.type,
        defaultHourlyRate: payerQuery.data.defaultHourlyRate ?? '',
        minimumHours: payerQuery.data.minimumHours ?? '2.00',
        lateCancelFee: payerQuery.data.lateCancelFee ?? '',
        noShowFee: payerQuery.data.noShowFee ?? '',
        paymentTermsDays: payerQuery.data.paymentTermsDays ?? 30,
        billingCode: payerQuery.data.billingCode ?? '',
        notes: payerQuery.data.notes ?? '',
    } : {
        name: '',
        type: '',
        defaultHourlyRate: '',
        minimumHours: '2.00',
        lateCancelFee: '',
        noShowFee: '',
        paymentTermsDays: 30,
        billingCode: '',
        notes: '',
    }

    return (
        <>
            <ConfirmDialog />
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Edit Payer</DialogTitle>
                        <DialogDescription>
                            Update the payer information below.
                        </DialogDescription>
                    </DialogHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <PayerForm
                            id={id}
                            onSubmit={onSubmit}
                            disabled={isPending}
                            defaultValues={defaultValues}
                            onDelete={onDelete}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}