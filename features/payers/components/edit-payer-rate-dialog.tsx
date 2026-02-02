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
import { useOpenPayerRate } from "@/features/payers/hooks/use-open-payer-rate"
import { PayerRateForm } from "@/features/payers/components/payer-rate-form"
import { useUpdatePayerRate } from "@/features/payers/api/use-update-payer-rate"
import { useDeletePayerRate } from "@/features/payers/api/use-delete-payer-rate"
import { useGetPayer } from "@/features/payers/api/use-get-payer"

type FormValues = {
    language: string
    hourlyRate: string
    minimumHours?: string | null
}

export const EditPayerRateDialog = () => {
    const { isOpen, onClose, payerId, rateId } = useOpenPayerRate()
    const payerQuery = useGetPayer(payerId)
    const editMutation = useUpdatePayerRate(payerId, rateId)
    const deleteMutation = useDeletePayerRate(payerId, rateId)

    const [ConfirmDialog, confirm] = useConfirm(
        'Delete this language rate?',
        "This will remove the language rate. The default payer rate will be used instead."
    )

    const isPending = editMutation.isPending || deleteMutation.isPending
    const isLoading = payerQuery.isLoading

    // Find the specific rate from the payer data
    const rate = payerQuery.data?.languageRates?.find(r => r.id === rateId)

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

    const defaultValues = rate ? {
        language: rate.language,
        hourlyRate: rate.hourlyRate,
        minimumHours: rate.minimumHours ?? '',
    } : {
        language: '',
        hourlyRate: '',
        minimumHours: '',
    }

    return (
        <>
            <ConfirmDialog />
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Edit Language Rate</DialogTitle>
                        <DialogDescription>
                            Update the hourly rate for this language.
                        </DialogDescription>
                    </DialogHeader>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <PayerRateForm
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