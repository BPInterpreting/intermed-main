'use client'

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Trash, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const formSchema = z.object({
    certifiedHourlyRate: z.string().min(1, "Certified rate is required"),
    qualifiedHourlyRate: z.string().optional(),
    minimumHours: z.string().optional(),
    mileageRate: z.string().optional(),
    acceptsNoMileage: z.boolean().default(false),
    certifiedLateCancelFee: z.string().optional(),
    qualifiedLateCancelFee: z.string().optional(),
    certifiedNoShowFee: z.string().optional(),
    qualifiedNoShowFee: z.string().optional(),
    effectiveDate: z.coerce.date(),
    notes: z.string().optional(),
})

type FormValues = z.input<typeof formSchema>

type Props = {
    defaultValues?: {
        certifiedHourlyRate: string
        qualifiedHourlyRate?: string | null
        minimumHours?: string | null
        mileageRate?: string | null
        acceptsNoMileage?: boolean
        certifiedLateCancelFee?: string | null
        qualifiedLateCancelFee?: string | null
        certifiedNoShowFee?: string | null
        qualifiedNoShowFee?: string | null
        effectiveDate: Date
        notes?: string | null
    }
    onSubmit: (values: FormValues) => void
    onDelete?: () => void
    disabled?: boolean
}

export const InterpreterRateForm = ({
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            certifiedHourlyRate: defaultValues?.certifiedHourlyRate || "",
            qualifiedHourlyRate: defaultValues?.qualifiedHourlyRate || "",
            minimumHours: defaultValues?.minimumHours || "2.00",
            mileageRate: defaultValues?.mileageRate || "0.67",
            acceptsNoMileage: defaultValues?.acceptsNoMileage || false,
            certifiedLateCancelFee: defaultValues?.certifiedLateCancelFee || "",
            qualifiedLateCancelFee: defaultValues?.qualifiedLateCancelFee || "",
            certifiedNoShowFee: defaultValues?.certifiedNoShowFee || "",
            qualifiedNoShowFee: defaultValues?.qualifiedNoShowFee || "",
            effectiveDate: defaultValues?.effectiveDate || new Date(),
            notes: defaultValues?.notes || "",
        },
    })

    const handleSubmit = (values: FormValues) => {
        onSubmit(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Hourly Rates</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="certifiedHourlyRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Certified Rate ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="50.00"
                                            disabled={disabled}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="qualifiedHourlyRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Qualified Rate ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="30.00"
                                            disabled={disabled}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Leave blank to use certified rate
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="minimumHours"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Hours</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        placeholder="2.00"
                                        disabled={disabled}
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mileageRate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mileage Rate ($/mi)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.67"
                                        disabled={disabled}
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="acceptsNoMileage"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Accepts No Mileage</FormLabel>
                                <FormDescription>
                                    Willing to work without mileage pay
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={disabled}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Late Cancel Fees</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="certifiedLateCancelFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Certified ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="120.00"
                                            disabled={disabled}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="qualifiedLateCancelFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Qualified ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="80.00"
                                            disabled={disabled}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium">No Show Fees</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="certifiedNoShowFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Certified ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="120.00"
                                            disabled={disabled}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="qualifiedNoShowFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Qualified ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="80.00"
                                            disabled={disabled}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="effectiveDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Effective Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            disabled={disabled}
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

                <Button className="w-full" disabled={disabled}>
                    Save Rate
                </Button>

                {!!onDelete && (
                    <Button
                        type="button"
                        disabled={disabled}
                        variant="destructive"
                        className="w-full"
                        onClick={onDelete}
                    >
                        <Trash className="size-4 mr-2" />
                        Delete Rate
                    </Button>
                )}
            </form>
        </Form>
    )
}