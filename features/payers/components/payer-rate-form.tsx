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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Trash } from "lucide-react"

const formSchema = z.object({
    language: z.string().min(1, 'Language is required'),
    hourlyRate: z.string().min(1, 'Hourly rate is required'),
    minimumHours: z.string().nullable().optional(),
})

type FormValues = z.input<typeof formSchema>

type Props = {
    defaultValues?: {
        language: string
        hourlyRate: string
        minimumHours?: string | null
    }
    onSubmit: (values: FormValues) => void
    onDelete?: () => void
    disabled?: boolean
}

const LANGUAGES = [
    "Spanish",
    "Mandarin",
    "Cantonese",
    "Vietnamese",
    "Korean",
    "Tagalog",
    "Russian",
    "Arabic",
    "Farsi",
    "Portuguese",
    "Japanese",
    "ASL",
    "French",
    "German",
    "Italian",
    "Hindi",
    "Punjabi",
    "Other",
]

export const PayerRateForm = ({
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    })

    const handleSubmit = (values: FormValues) => {
        onSubmit(values)
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                    <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Language</FormLabel>
                                <Select
                                    disabled={disabled}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {LANGUAGES.map((lang) => (
                                            <SelectItem key={lang} value={lang}>
                                                {lang}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                            control={form.control}
                            name="hourlyRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hourly Rate ($)</FormLabel>
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
                                    <FormLabel>Min Hours (Optional)</FormLabel>
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

                    <Button className="w-full" disabled={disabled}>
                        Save Language Rate
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
                            Delete Language Rate
                        </Button>
                        )}
                    </form>
                </Form>
            </div>
        )
}

export default PayerRateForm