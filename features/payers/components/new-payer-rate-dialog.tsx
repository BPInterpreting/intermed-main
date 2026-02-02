'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { z } from "zod"

import { useNewPayerRate } from "@/features/payers/hooks/use-new-payer-rate"
import { PayerRateForm } from "./payer-rate-form"
import { useCreatePayerRate } from "@/features/payers/api/use-create-payer-rate"

const formSchema = z.object({
    language: z.string().min(1, 'Language is required'),
    hourlyRate: z.string().min(1, 'Hourly rate is required'),
    minimumHours: z.string().nullable().optional(),
})

type FormValues = z.input<typeof formSchema>

export const NewPayerRateDialog = () => {
    const { isOpen, onClose, payerId } = useNewPayerRate()
    const mutation = useCreatePayerRate(payerId)

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Language Rate</DialogTitle>
                    <DialogDescription>
                        Add a custom hourly rate for a specific language.
                    </DialogDescription>
                </DialogHeader>
                <PayerRateForm
                    onSubmit={onSubmit}
                    disabled={mutation.isPending}
                    defaultValues={{
                        language: '',
                        hourlyRate: '',
                        minimumHours: '',
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}