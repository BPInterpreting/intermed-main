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
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
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
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useMarkPayoutPaidDialog } from "@/features/payouts/hooks/use-mark-payout-paid-dialog"
import { useMarkPayoutPaid } from "@/features/payouts/api/use-mark-payout-paid"
import { useGetPayout } from "@/features/payouts/api/use-get-payout"

const formSchema = z.object({
    paymentMethod: z.string().min(1, "Payment method is required"),
    paidAt: z.coerce.date(),
    paymentReference: z.string().optional(),
    notifyInterpreter: z.boolean().default(true),
})

type FormValues = z.input<typeof formSchema>

export const MarkPaidDialog = () => {
    const { isOpen, onClose, id } = useMarkPayoutPaidDialog()
    const payoutQuery = useGetPayout(id)
    const mutation = useMarkPayoutPaid(id)
    const payout = payoutQuery.data

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paymentMethod: "ach",
            paidAt: new Date(),
            paymentReference: "",
            notifyInterpreter: true,
        }
    })

    const onSubmit = (values: FormValues) => {
        mutation.mutate({
            paymentMethod: values.paymentMethod,
            paidAt: values.paidAt,
            paymentReference: values.paymentReference || undefined,
        }, {
            onSuccess: () => {
                form.reset()
                onClose()
            }
        })
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
                    <DialogTitle>Mark as Paid</DialogTitle>
                    <DialogDescription>
                        Confirm that payment has been sent to the interpreter.
                    </DialogDescription>
                </DialogHeader>

                {payout && (
                    <div className="bg-muted p-4 rounded-md space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Interpreter</span>
                            <span className="font-medium">{interpreterName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-bold text-green-600">${total.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select
                                        disabled={mutation.isPending}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ach">ACH / Direct Deposit</SelectItem>
                                            <SelectItem value="check">Check</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paidAt"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Payment Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={mutation.isPending}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentReference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmation # (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ACH confirmation, check #, etc."
                                            disabled={mutation.isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notifyInterpreter"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Notify interpreter via email
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                "Mark as Paid"
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}