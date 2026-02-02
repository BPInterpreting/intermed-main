'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { useNewInterpreterRate } from "@/features/interpreters/hooks/use-new-interpreter-rate"
import { InterpreterRateForm } from "@/features/interpreters/components/interpreter-rate-form"
import { useCreateInterpreterRate } from "@/features/interpreters/api/use-create-interpreter-rate"

export const NewInterpreterRateDialog = () => {
    const { isOpen, onClose, interpreterId } = useNewInterpreterRate()
    const mutation = useCreateInterpreterRate(interpreterId)

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
        if (!interpreterId) return

        mutation.mutate({
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Interpreter Rate</DialogTitle>
                    <DialogDescription>
                        Set compensation rates for this interpreter.
                    </DialogDescription>
                </DialogHeader>
                <InterpreterRateForm
                    onSubmit={onSubmit}
                    disabled={mutation.isPending}
                />
            </DialogContent>
        </Dialog>
    )
}