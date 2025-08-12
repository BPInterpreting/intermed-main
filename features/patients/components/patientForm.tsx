'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
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
import { Trash, CalendarIcon } from "lucide-react"
import { insertPatientSchema } from "@/db/schema"
import { PhoneInput } from "@/components/customUi/phone-input"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// Updated formSchema to match appointment pattern
const formSchema = z.object({
    firstName: z.string().min(1, 'first name is required'),
    lastName: z.string().min(1, 'last name is required'),
    email: z.string().email().or(z.literal("")),
    phoneNumber: z.string(),
    insuranceCarrier: z.string().nullable().optional(),
    preferredLanguage: z.string().nullable().optional(),
    dateOfBirth: z.coerce.date().nullable().optional(), // Using coerce.date() like appointments
    claimNumber: z.string().optional(),
})

// API schema for sending to server
// API schema for sending to server - make email and phoneNumber optional
const apiSchema = insertPatientSchema.omit({
    id: true,
    patientId: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    // Override to ensure proper type handling
    dateOfBirth: z.date().nullable().optional()
})

type FormValues = z.input<typeof formSchema>
type ApiFormValues = z.input<typeof apiSchema>

type Props = {
    id?: string;
    defaultValues?: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        insuranceCarrier?: string | null;
        preferredLanguage?: string | null;
        dateOfBirth?: Date | null;
        claimNumber?: string;
    };
    onSubmit: (values: ApiFormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
}

export const PatientForm = ({
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
            email: values.email || '',
            phoneNumber: values.phoneNumber || '',
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
                    {/* Date of Birth Field - copied from appointment form pattern */}
                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date of birth</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] pl-3 text-left font-normal",
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
                                            selected={field.value ?? undefined}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='grid grid-cols-2 gap-2'>
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({field}) => (
                                <FormItem >
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="first name..."
                                            {...field}
                                            className='capitalize'
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="last name..."
                                            {...field}
                                            className='capitalize'
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="example@email.com"
                                            type={"email"}
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
                            name="phoneNumber"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            {...field}
                                            value={field.value || ''}
                                            format='(###) ###-####'
                                            allowEmptyFormatting={true}
                                            mask="_"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="insuranceCarrier"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Insurance carrier</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Insurance Inc"
                                            {...field}
                                            value={field.value || ""}
                                            className='capitalize'
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preferredLanguage"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Preferred Language</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="English"
                                            {...field}
                                            value={field.value || ""}
                                            className='capitalize'
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button className='w-full' disabled={disabled}>
                        {id ? "Update Patient" : "Add Patient"}
                    </Button>
                    {!!id && (
                        <Button
                            type='button'
                            disabled={disabled}
                            variant="destructive"
                            className='w-full'
                            onClick={handleDelete}
                        >
                            <Trash className='size-4 mr-2'/>
                            Delete Patient
                        </Button>
                    )}
                </form>
            </Form>
        </div>
    )
}