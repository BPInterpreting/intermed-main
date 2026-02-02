'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Download } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useProcessPayoutDialog } from "@/features/payouts/hooks/use-process-payout-dialog"
import { useGetPayout } from "@/features/payouts/api/use-get-payout"

const formSchema = z.object({
    paymentMethod: z.string().min(1, "Payment method is required"),
})

type FormValues = z.input<typeof formSchema>

export const ProcessPayoutDialog = () => {
    const { isOpen, onClose, id } = useProcessPayoutDialog()
    const payoutQuery = useGetPayout(id)
    const payout = payoutQuery.data

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paymentMethod: "ach",
        }
    })

    const handleExport = () => {
        // Open export link in new tab
        if (id) {
            window.open(`/api/payouts/${id}/export`, '_blank')
        }
    }

    const handleClose = (open: boolean) => {
        if (!open) {
            form.reset()
            onClose()
        }
    }

    const interpreterName = payout 
        ? `${payout.interpreterFirstName || ''} ${payout.interpreterLastName || ''}`.trim()
        : ''
    const total = payout ? parseFloat(payout.total || "0") : 0

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Process Payment</DialogTitle>
                    <DialogDescription>
                        Export payout details and process payment through your bank.
                    </DialogDescription>
                </DialogHeader>

                {payout && (
                    <div className="bg-muted p-4 rounded-md space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Payout #</span>
                            <span className="font-mono font-medium">{payout.payoutNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Interpreter</span>
                            <span className="font-medium">{interpreterName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span>{payout.interpreterEmail}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-bold text-green-600">${total.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-3">
                        <h4 className="font-medium">Steps to process:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Export the payout details (CSV)</li>
                            <li>Log into your bank portal</li>
                            <li>Process payment to interpreter</li>
                            <li>Come back and mark as paid</li>
                        </ol>
                    </div>

                    <Button 
                        onClick={handleExport}
                        className="w-full" 
                        variant="outline"
                    >
                        <Download className="size-4 mr-2" />
                        Export Payout Details (CSV)
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                        After processing payment in your bank, use "Mark as Paid" to complete.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}