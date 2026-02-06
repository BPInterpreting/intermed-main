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
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Trash, CalendarIcon, Plus, Building2, X } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { useGetPatientPayers } from "@/features/patient-payers/use-get-patient-payers" 
import { useGetActivePatientPayers } from "@/features/patient-payers/use-get-active-patient-payers" 
import { useAssignPatientPayer } from "@/features/patient-payers/use-assign-patient-payer"
import { useEndPatientPayer } from "@/features/patient-payers/use-end-patient-payer" 
import { useGetPayers } from "@/features/payers/api/use-get-payers"

const formSchema = z.object({
    firstName: z.string().min(1, 'first name is required'),
    lastName: z.string().min(1, 'last name is required'),
    email: z.string().email().or(z.literal("")),
    phoneNumber: z.string(),
    insuranceCarrier: z.string().nullable().optional(),
    preferredLanguage: z.string().nullable().optional(),
    dateOfBirth: z.coerce.date().nullable().optional(),
    claimNumber: z.string().optional(),
})

const apiSchema = insertPatientSchema.omit({
    id: true,
    patientId: true,
    createdAt: true,
    updatedAt: true,
}).extend({
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

    // Payer assignment state
    const [showAssignPayer, setShowAssignPayer] = useState(false)
    const [newPayerId, setNewPayerId] = useState<string>("")
    const [newPayerIsPrimary, setNewPayerIsPrimary] = useState(true)
    const [newPayerClaimNumber, setNewPayerClaimNumber] = useState("")

    // Payer queries (only fire when editing an existing patient)
    const payersQuery = useGetPayers()
    const activePayersQuery = useGetActivePatientPayers(id)
    const payerHistoryQuery = useGetPatientPayers(id)
    const assignPayerMutation = useAssignPatientPayer()

    const activePayers = activePayersQuery.data || []
    const payerHistory = payerHistoryQuery.data || []
    const allPayers = (payersQuery.data || []).filter((p: any) => p.isActive !== false)
    const activePrimary = activePayers.find((p: any) => p.isPrimary)
    const activeSecondary = activePayers.find((p: any) => !p.isPrimary)

    const handleSubmit = (values: FormValues) => {
        onSubmit({
            ...values,
            email: values.email || '',
            phoneNumber: values.phoneNumber || '',
        })
    }

    const handleDelete = () => {
        onDelete?.()
    }

    const handleAssignPayer = () => {
        if (!id || !newPayerId) return

        assignPayerMutation.mutate(
            {
                patientId: id,
                payerId: newPayerId,
                isPrimary: newPayerIsPrimary,
                effectiveDate: new Date(),
                claimNumber: newPayerClaimNumber || null,
            },
            {
                onSuccess: () => {
                    setShowAssignPayer(false)
                    setNewPayerId("")
                    setNewPayerClaimNumber("")
                    setNewPayerIsPrimary(true)
                },
            }
        )
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                    {/* Date of Birth */}
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
                                    <FormLabel>Insurance Carrier</FormLabel>
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

                    {/* ============================================================ */}
                    {/* PAYER ASSIGNMENT SECTION - Only shows when editing */}
                    {/* ============================================================ */}
                    {id && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Building2 className="size-4" />
                                        Payer Assignment
                                    </p>
                                    {!showAssignPayer && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAssignPayer(true)}
                                        >
                                            <Plus className="size-3 mr-1" />
                                            {activePrimary ? "Change Payer" : "Assign Payer"}
                                        </Button>
                                    )}
                                </div>

                                {/* Current Active Payer(s) */}
                                {activePrimary ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <div>
                                                <p className="text-sm font-medium">{activePrimary.payerName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="default" className="text-[10px] h-4">Primary</Badge>
                                                    <Badge variant="outline" className="text-[10px] h-4">
                                                        {activePrimary.payerType?.replace("_", " ")}
                                                    </Badge>
                                                    {activePrimary.claimNumber && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Claim: {activePrimary.claimNumber}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Since {format(new Date(activePrimary.effectiveDate), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                        {activeSecondary && (
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                <div>
                                                    <p className="text-sm font-medium">{activeSecondary.payerName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge variant="secondary" className="text-[10px] h-4">Secondary</Badge>
                                                        <Badge variant="outline" className="text-[10px] h-4">
                                                            {activeSecondary.payerType?.replace("_", " ")}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No payer assigned yet</p>
                                )}

                                {/* Assign New Payer Form */}
                                {showAssignPayer && (
                                    <div className="rounded-lg border p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">Assign New Payer</p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setShowAssignPayer(false)
                                                    setNewPayerId("")
                                                    setNewPayerClaimNumber("")
                                                }}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs font-medium">Payer</label>
                                                <Select value={newPayerId} onValueChange={setNewPayerId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select payer..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Payers</SelectLabel>
                                                            {allPayers.map((payer: any) => (
                                                                <SelectItem key={payer.id} value={payer.id}>
                                                                    {payer.name} ({payer.type?.replace("_", " ")})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs font-medium">Type</label>
                                                    <Select
                                                        value={newPayerIsPrimary ? "primary" : "secondary"}
                                                        onValueChange={(v) => setNewPayerIsPrimary(v === "primary")}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="primary">Primary</SelectItem>
                                                            <SelectItem value="secondary">Secondary</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium">Claim # (optional)</label>
                                                    <Input
                                                        placeholder="Claim number..."
                                                        value={newPayerClaimNumber}
                                                        onChange={(e) => setNewPayerClaimNumber(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {newPayerIsPrimary && activePrimary && (
                                                <p className="text-xs text-amber-600">
                                                    This will end the current primary payer assignment ({activePrimary.payerName})
                                                </p>
                                            )}

                                            <Button
                                                type="button"
                                                size="sm"
                                                className="w-full"
                                                disabled={!newPayerId || assignPayerMutation.isPending}
                                                onClick={handleAssignPayer}
                                            >
                                                {assignPayerMutation.isPending ? "Assigning..." : "Assign Payer"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Payer History */}
                                {payerHistory.length > 1 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Payer History</p>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs h-8">Payer</TableHead>
                                                    <TableHead className="text-xs h-8">Type</TableHead>
                                                    <TableHead className="text-xs h-8">Period</TableHead>
                                                    <TableHead className="text-xs h-8">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payerHistory.map((record: any) => (
                                                    <TableRow key={record.id}>
                                                        <TableCell className="text-xs py-1.5">
                                                            {record.payerName}
                                                        </TableCell>
                                                        <TableCell className="text-xs py-1.5">
                                                            {record.isPrimary ? "Primary" : "Secondary"}
                                                        </TableCell>
                                                        <TableCell className="text-xs py-1.5">
                                                            {format(new Date(record.effectiveDate), "MMM d, yy")}
                                                            {record.endDate && (
                                                                <> - {format(new Date(record.endDate), "MMM d, yy")}</>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs py-1.5">
                                                            {record.isActive ? (
                                                                <Badge variant="default" className="text-[10px] h-4">Active</Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground">Ended</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

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