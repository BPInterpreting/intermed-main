'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

import { useConfirm } from "@/hooks/use-confirm"
import { useOpenInterpreterRate } from "@/features/interpreters/hooks/use-open-interpreter-rate"
import { InterpreterRateForm } from "@/features/interpreters/components/interpreter-rate-form"
import { useGetInterpreterRateHistory } from "@/features/interpreters/api/use-get-interpreter-rate-history"
import { useEditInterpreterRate } from "@/features/interpreters/api/use-edit-interpreter-rate"
import { useDeleteInterpreterRate } from "@/features/interpreters/api/use-delete-interpreter-rate"

export const EditInterpreterRateDialog = () => {
    const { isOpen, onClose, interpreterId, rateId } = useOpenInterpreterRate()
    const ratesQuery = useGetInterpreterRateHistory(interpreterId)
    const editMutation = useEditInterpreterRate(interpreterId, rateId)
    const deleteMutation = useDeleteInterpreterRate(interpreterId, rateId)

    const [ConfirmDialog, confirm] = useConfirm(
        'Delete this rate?',
        "This will remove this rate from the interpreter's history."
    )

    const isPending = editMutation.isPending || deleteMutation.isPending
    const isLoading = ratesQuery.isLoading

    const rates = ratesQuery.data || []
    const rate = Array.isArray(rates) ? rates.find((r: { id: string }) => r.id === rateId) : null

    const onSubmit = (values: {
        certifiedHourlyRate: string
        qualifiedHourlyRate?: string
        minimumHours?: string
        mileageRate?: string
        acceptsNoMileage?: boolean
        certifiedLateCancelFee?: string
        qualifiedLateCancelFee?: string
        certifiedNoShowFee?: string
        qualifiedNoShowFee?: string
        effectiveDate: Date
        notes?: string
    }) => {
        editMutation.mutate({
            certifiedHourlyRate: values.certifiedHourlyRate,
            qualifiedHourlyRate: values.qualifiedHourlyRate || null,
            minimumHours: values.minimumHours || "2.00",
            mileageRate: values.mileageRate || "0.00",
            acceptsNoMileage: values.acceptsNoMileage || false,
            certifiedLateCancelFee: values.certifiedLateCancelFee || null,
            qualifiedLateCancelFee: values.qualifiedLateCancelFee || null,
            certifiedNoShowFee: values.certifiedNoShowFee || null,
            qualifiedNoShowFee: values.qualifiedNoShowFee || null,
            effectiveDate: values.effectiveDate,
            notes: values.notes || null,
        }, {
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
        certifiedHourlyRate: rate.certifiedHourlyRate,
        qualifiedHourlyRate: rate.qualifiedHourlyRate,
        minimumHours: rate.minimumHours,
        mileageRate: rate.mileageRate,
        acceptsNoMileage: rate.acceptsNoMileage,
        certifiedLateCancelFee: rate.certifiedLateCancelFee,
        qualifiedLateCancelFee: rate.qualifiedLateCancelFee,
        certifiedNoShowFee: rate.certifiedNoShowFee,
        qualifiedNoShowFee: rate.qualifiedNoShowFee,
        effectiveDate: new Date(rate.effectiveDate),
        notes: rate.notes,
    } : undefined

    return (
        <>
            <ConfirmDialog />
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Interpreter Rate</DialogTitle>
                        <DialogDescription>
                            Update rate configuration.
                        </DialogDescription>
                    </DialogHeader>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <InterpreterRateForm
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