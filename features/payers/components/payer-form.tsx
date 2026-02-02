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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Trash } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { insertPayerSchema } from "@/db/schema"

const formSchema = z.object({
    name: z.string().min(1, 'Payer name is required'),
    type: z.string().min(1, 'Payer type is required'),
    defaultHourlyRate: z.string().nullable().optional(),
    minimumHours: z.string().nullable().optional(),
    lateCancelFee: z.string().nullable().optional(),
    noShowFee: z.string().nullable().optional(),
    paymentTermsDays: z.coerce.number().nullable().optional(),
    billingCode: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
})

const apiSchema = insertPayerSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isActive: true,
})

type FormValues = z.input<typeof formSchema>
type ApiFormValues = z.input<typeof apiSchema>

type Props = {
    id?: string
    defaultValues?: {
        name: string
        type: string
        defaultHourlyRate?: string | null
        minimumHours?: string | null
        lateCancelFee?: string | null
        noShowFee?: string | null
        paymentTermsDays?: number | null
        billingCode?: string | null
        notes?: string | null
    }
    onSubmit: (values: ApiFormValues) => void
    onDelete?: () => void
    disabled?: boolean
}

export const PayerForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
}: Props) => {

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    const handleSubmit = (values: FormValues) => {
        console.log('Form values being submitted:', values)
        onSubmit({
            ...values,
            name: values.name,
            type: values.type,
        })
    }

    const handleDelete = () => {
        onDelete?.()
    }

    console.log('Form errors:', form.formState.errors)

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payer Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. State Compensation Insurance Fund"
                                        {...field}
                                        disabled={disabled}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payer Type</FormLabel>
                                <Select
                                    disabled={disabled}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payer type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="workers_comp">Workers Comp</SelectItem>
                                        <SelectItem value="medi_cal">Medi-Cal</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                            control={form.control}
                            name="defaultHourlyRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Hourly Rate ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="75.00"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            {...field}
                                            value={field.value || ""}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                            control={form.control}
                            name="lateCancelFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Late Cancel Fee ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="50.00"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="noShowFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>No Show Fee ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="50.00"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                            control={form.control}
                            name="paymentTermsDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Terms (Days)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="30"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="billingCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billing Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. SCIF-2025"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Any additional notes about this payer..."
                                        {...field}
                                        value={field.value || ""}
                                        disabled={disabled}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button className="w-full" disabled={disabled}>
                        {id ? "Update Payer" : "Add Payer"}
                    </Button>
                    {!!id && (
                        <Button
                            type="button"
                            disabled={disabled}
                            variant="destructive"
                            className="w-full"
                            onClick={handleDelete}
                        >
                            <Trash className="size-4 mr-2" />
                            Deactivate Payer
                        </Button>
                    )}
                </form>
            </Form>
        </div>
    )
}