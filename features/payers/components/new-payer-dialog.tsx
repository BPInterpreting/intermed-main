'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { z } from "zod"

import { useNewPayer } from "@/features/payers/hooks/use-new-payer"
import { PayerForm } from "@/features/payers/components/payer-form"
import { insertPayerSchema } from "@/db/schema"
import { useCreatePayer } from "@/features/payers/api/use-create-payer"

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

export const NewPayerDialog = () => {
    const { isOpen, onClose } = useNewPayer()
    const mutation = useCreatePayer()

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
                    <DialogTitle>New Payer</DialogTitle>
                    <DialogDescription>
                        Add a new insurance payer to the system.
                    </DialogDescription>
                </DialogHeader>
                <PayerForm
                    onSubmit={onSubmit}
                    disabled={mutation.isPending}
                    defaultValues={{
                        name: '',
                        type: '',
                        defaultHourlyRate: '',
                        minimumHours: '2.00',
                        lateCancelFee: '',
                        noShowFee: '',
                        paymentTermsDays: 30,
                        billingCode: '',
                        notes: '',
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}