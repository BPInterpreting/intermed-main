'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { endOfMonth, startOfMonth } from "date-fns"

import { useGeneratePayoutsDialog } from "@/features/payouts/hooks/use-generate-payouts-dialog"
import { useGeneratePayouts } from "@/features/payouts/api/use-generate-payouts"

const formSchema = z.object({
    periodType: z.enum(["first_half", "second_half", "full_month"]),
    month: z.string().min(1, "Month is required"),
    year: z.string().min(1, "Year is required"),
    paymentFrequency: z.enum(["biweekly", "monthly", "all"]),
})

type FormValues = z.input<typeof formSchema>

export const GeneratePayoutsDialog = () => {
    const { isOpen, onClose } = useGeneratePayoutsDialog()
    const mutation = useGeneratePayouts()

    const currentDate = new Date()
    const currentMonth = (currentDate.getMonth() + 1).toString()
    const currentYear = currentDate.getFullYear().toString()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            periodType: "first_half",
            month: currentMonth,
            year: currentYear,
            paymentFrequency: "monthly",
        }
    })

    const onSubmit = (values: FormValues) => {
        // Calculate period dates
        const year = parseInt(values.year)
        const month = parseInt(values.month) - 1 // JS months are 0-indexed
        
        let periodStart: Date
        let periodEnd: Date

        if (values.periodType === "first_half") {
            periodStart = new Date(year, month, 1)
            periodEnd = new Date(year, month, 15)
        } else if (values.periodType === "second_half") {
            periodStart = new Date(year, month, 16)
            periodEnd = endOfMonth(new Date(year, month, 1))
        } else {
            periodStart = startOfMonth(new Date(year, month, 1))
            periodEnd = endOfMonth(new Date(year, month, 1))
        }

        
        mutation.mutate({
            periodStart,
            periodEnd,
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

    // Generate month options
    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ]

    // Generate year options (current year and previous year)
    const years = [
        currentYear,
        (parseInt(currentYear) - 1).toString(),
    ]

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate Payouts</DialogTitle>
                    <DialogDescription>
                        Generate payouts for all interpreters with completed appointments in the selected period.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="periodType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billing Period</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="first_half" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    First Half (1st - 15th)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="second_half" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Second Half (16th - End of Month)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="full_month" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Full Month
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="month"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Month</FormLabel>
                                        <Select
                                            disabled={mutation.isPending}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select month" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {months.map((month) => (
                                                    <SelectItem key={month.value} value={month.value}>
                                                        {month.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year</FormLabel>
                                        <Select
                                            disabled={mutation.isPending}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem key={year} value={year}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="paymentFrequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Frequency Filter</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="biweekly" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Bi-weekly interpreters only
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="monthly" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Monthly interpreters only
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="all" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    All interpreters
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormDescription>
                                        Filter by interpreter's preferred payment schedule.
                                    </FormDescription>
                                    <FormMessage />
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
                                    Generating...
                                </>
                            ) : (
                                "Generate Payouts"
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}