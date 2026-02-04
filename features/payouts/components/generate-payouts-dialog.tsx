'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, ArrowLeft, CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { endOfMonth, startOfMonth, format, parse } from "date-fns"
import { useState } from "react"

import { useGeneratePayoutsDialog } from "@/features/payouts/hooks/use-generate-payouts-dialog"
import { useGeneratePayouts } from "@/features/payouts/api/use-generate-payouts"
import { usePreviewPayouts, PreviewResponse, PreviewInterpreter, SkippedInterpreter } from "@/features/payouts/api/use-preview-payouts"

const formSchema = z.object({
    periodType: z.enum(["first_half", "second_half", "full_month"]),
    month: z.string().min(1, "Month is required"),
    year: z.string().min(1, "Year is required"),
    paymentFrequency: z.enum(["biweekly", "monthly", "all"]),
})

type FormValues = z.input<typeof formSchema>

// Helper to format time strings
const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '-'
    try {
        const parsedTime = parse(timeString, "HH:mm:ss", new Date())
        return format(parsedTime, "h:mm a")
    } catch {
        return timeString
    }
}

// Status badge config using custom badge variants
const statusBadgeConfig: Record<string, { label: string; variant: "closed" | "cancelled" | "confirmed" | "pendingConfirmation" | "pendingAuthorization" | "interpreterRequested" | "outline" }> = {
    "Closed": { label: "Closed", variant: "closed" },
    "No Show": { label: "No Show", variant: "cancelled" },
    "Late CX": { label: "Late CX", variant: "cancelled" },
    "Confirmed": { label: "Confirmed", variant: "confirmed" },
    "Pending Confirmation": { label: "Pending Confirmation", variant: "pendingConfirmation" },
    "Pending Authorization": { label: "Pending Authorization", variant: "pendingAuthorization" },
    "offer_sent": { label: "Offer Sent", variant: "interpreterRequested" },
}
// Expandable interpreter row component
const InterpreterRow = ({ interp }: { interp: PreviewInterpreter }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">
                            {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </div>
                        <div>
                            <p className="font-medium">{interp.interpreterName}</p>
                            <Badge variant="outline" className="mt-0.5 text-xs">
                                {interp.isCertified ? 'Certified' : 'Qualified'}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                            <p className="text-muted-foreground">Appts</p>
                            <p className="font-medium">{interp.appointmentCount}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground">Hours</p>
                            <p className="font-medium">{interp.estimatedHours.toFixed(1)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground">Rate</p>
                            <p className="font-medium">${interp.rate.toFixed(2)}/hr</p>
                        </div>
                        <div className="text-right min-w-[80px]">
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-bold text-green-600">${interp.estimatedTotal.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="mt-1 ml-7 mr-1 mb-3 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">Date</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Patient</TableHead>
                                <TableHead className="text-xs">Facility</TableHead>
                                <TableHead className="text-xs">Start</TableHead>
                                <TableHead className="text-xs">End</TableHead>
                                <TableHead className="text-xs text-right">Hours</TableHead>
                                <TableHead className="text-xs text-right">Rate</TableHead>
                                <TableHead className="text-xs text-right">Miles</TableHead>
                                <TableHead className="text-xs text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interp.appointments.map((appt) => {
                                const apptStatus = appt.status ?? ''
                                const badge = statusBadgeConfig[apptStatus] || { label: apptStatus || '-', variant: 'outline' as const }

                                return (
                                    <TableRow key={appt.id}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {format(new Date(appt.date), "MMM d")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={badge.variant} className="text-xs whitespace-nowrap">
                                                {badge.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap">{appt.patientName}</TableCell>
                                        <TableCell className="text-xs max-w-[120px]">
                                            <div className="truncate">{appt.facilityName}</div>
                                        </TableCell>
                                        <TableCell className="text-xs whitespace-nowrap">{formatTime(appt.startTime)}</TableCell>
                                        <TableCell className="text-xs whitespace-nowrap">{formatTime(appt.endTime)}</TableCell>
                                        <TableCell className="text-xs text-right">
                                            {appt.adjustmentType ? '-' : appt.serviceHours.toFixed(1)}
                                        </TableCell>
                                        <TableCell className="text-xs text-right">
                                            {appt.adjustmentType ? '-' : `$${appt.hourlyRate.toFixed(2)}`}
                                        </TableCell>
                                        <TableCell className="text-xs text-right">
                                            {appt.mileage > 0 ? appt.mileage.toFixed(0) : '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-right font-medium">
                                            ${appt.lineTotal.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

// Expandable skipped interpreter row
const SkippedRow = ({ skipped }: { skipped: SkippedInterpreter }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:bg-red-100/50 rounded p-1 transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="text-red-600">
                            {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                        </div>
                        <p className="text-sm text-red-700">
                            {skipped.name} — {skipped.reason} ({skipped.appointmentCount} appt{skipped.appointmentCount !== 1 ? 's' : ''})
                        </p>
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="ml-5 mt-1 mb-2 space-y-1">
                    {skipped.appointments.map((appt) => {
                        const apptStatus = appt.status ?? ''
                        const badge = statusBadgeConfig[apptStatus] || { label: apptStatus || '-', variant: 'outline' as const }
                        return (
                            <div key={appt.id} className="flex items-center gap-2 text-xs text-red-700">
                                <span className="whitespace-nowrap">{format(new Date(appt.date), "MMM d")}</span>
                                <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
                                <span className="truncate">{appt.patientName}</span>
                                <span className="text-red-500">·</span>
                                <span className="truncate">{appt.facilityName}</span>
                            </div>
                        )
                    })}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

export const GeneratePayoutsDialog = () => {
    const { isOpen, onClose } = useGeneratePayoutsDialog()
    const generateMutation = useGeneratePayouts()
    const previewMutation = usePreviewPayouts()
    
    const [step, setStep] = useState<'form' | 'preview'>('form')
    const [previewData, setPreviewData] = useState<PreviewResponse['data'] | null>(null)
    const [periodDates, setPeriodDates] = useState<{ start: Date; end: Date } | null>(null)
    const [showUnclosedDetails, setShowUnclosedDetails] = useState(false)

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

    const calculatePeriodDates = (values: FormValues) => {
        const year = parseInt(values.year)
        const month = parseInt(values.month) - 1

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

        return { start: periodStart, end: periodEnd }
    }

    const onPreview = (values: FormValues) => {
        const dates = calculatePeriodDates(values)
        setPeriodDates(dates)

        previewMutation.mutate({
            periodStart: dates.start,
            periodEnd: dates.end,
        }, {
            onSuccess: (response) => {
                setPreviewData(response.data)
                setStep('preview')
                setShowUnclosedDetails(false)
            }
        })
    }

    const onConfirmGenerate = () => {
        if (!periodDates) return

        generateMutation.mutate({
            periodStart: periodDates.start,
            periodEnd: periodDates.end,
        }, {
            onSuccess: () => {
                handleReset()
            }
        })
    }

    const handleReset = () => {
        form.reset()
        setStep('form')
        setPreviewData(null)
        setPeriodDates(null)
        setShowUnclosedDetails(false)
        onClose()
    }

    const handleClose = (open: boolean) => {
        if (!open) {
            handleReset()
        }
    }

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

    const years = [
        currentYear,
        (parseInt(currentYear) - 1).toString(),
    ]

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className={step === 'preview' ? "max-w-4xl max-h-[90vh] overflow-y-auto" : undefined}>
                {step === 'form' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Generate Payouts</DialogTitle>
                            <DialogDescription>
                                Select a billing period to preview payable appointments before generating payouts.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onPreview)} className="space-y-4 pt-4">
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
                                                    disabled={previewMutation.isPending}
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
                                                    disabled={previewMutation.isPending}
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
                                                Filter by interpreter&apos;s preferred payment schedule.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={previewMutation.isPending}
                                >
                                    {previewMutation.isPending ? (
                                        <>
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                            Loading Preview...
                                        </>
                                    ) : (
                                        "Preview Payouts"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </>
                )}

                {step === 'preview' && previewData && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Payout Preview</DialogTitle>
                            <DialogDescription>
                                {periodDates && (
                                    <>
                                        Period: {format(periodDates.start, "MMM d, yyyy")} – {format(periodDates.end, "MMM d, yyyy")}
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg border p-3 text-center">
                                    <p className="text-sm text-muted-foreground">Appointments</p>
                                    <p className="text-2xl font-bold">{previewData.totalAppointments}</p>
                                </div>
                                <div className="rounded-lg border p-3 text-center">
                                    <p className="text-sm text-muted-foreground">Interpreters</p>
                                    <p className="text-2xl font-bold">{previewData.totalInterpreters}</p>
                                </div>
                                <div className="rounded-lg border p-3 text-center">
                                    <p className="text-sm text-muted-foreground">Estimated Total</p>
                                    <p className="text-2xl font-bold text-green-600">${previewData.estimatedTotal.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Warnings - Unclosed with status breakdown */}
                            {previewData.warnings.length > 0 && (
                                <div className="space-y-2">
                                    {previewData.warnings.map((warning, index) => (
                                        <div key={index}>
                                            {warning.type === 'unclosed_past' ? (
                                                <Collapsible open={showUnclosedDetails} onOpenChange={setShowUnclosedDetails}>
                                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                                        <CollapsibleTrigger asChild>
                                                            <div className="flex items-start gap-2 cursor-pointer">
                                                                <AlertTriangle className="size-4 text-yellow-600 mt-0.5 shrink-0" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm text-yellow-800 font-medium">
                                                                        {warning.count} past appointment{warning.count !== 1 ? 's' : ''} not included:
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                                                        {Object.entries(previewData.unclosedByStatus).map(([status, count]) => (
                                                                            <Badge key={status} variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-100">
                                                                                {count} {status}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                    <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                                                                        {showUnclosedDetails ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                                                                        {showUnclosedDetails ? 'Hide details' : 'Show details'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent>
                                                            <div className="mt-3 max-h-[200px] overflow-y-auto">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead className="text-xs">Date</TableHead>
                                                                            <TableHead className="text-xs">Status</TableHead>
                                                                            <TableHead className="text-xs">Interpreter</TableHead>
                                                                            <TableHead className="text-xs">Patient</TableHead>
                                                                            <TableHead className="text-xs">Facility</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {previewData.unclosedDetails.map((appt) => {
                                                                            const apptStatus = appt.status ?? ''
                                                                            const badge = statusBadgeConfig[apptStatus] || { label: apptStatus || '-', variant: 'outline' as const }
                                                                            return (
                                                                                <TableRow key={appt.id}>
                                                                                    <TableCell className="text-xs whitespace-nowrap">
                                                                                        {format(new Date(appt.date), "MMM d")}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
                                                                                    </TableCell>
                                                                                    <TableCell className="text-xs">{appt.interpreterName}</TableCell>
                                                                                    <TableCell className="text-xs">{appt.patientName}</TableCell>
                                                                                    <TableCell className="text-xs max-w-[120px]">
                                                                                        <div className="truncate">{appt.facilityName}</div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            )
                                                                        })}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </CollapsibleContent>
                                                    </div>
                                                </Collapsible>
                                            ) : (
                                                <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                                    <AlertTriangle className="size-4 text-yellow-600 mt-0.5 shrink-0" />
                                                    <p className="text-sm text-yellow-800">{warning.message}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skipped Interpreters - Expandable */}
                            {previewData.skippedInterpreters.length > 0 && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="size-4 text-red-600" />
                                        <p className="text-sm font-medium text-red-800">
                                            Skipped Interpreters ({previewData.skippedInterpreters.length})
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        {previewData.skippedInterpreters.map((skipped, index) => (
                                            <SkippedRow key={index} skipped={skipped} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Per-Interpreter Breakdown - Expandable */}
                            {previewData.interpreters.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Payouts to Generate ({previewData.interpreters.length})
                                    </p>
                                    {previewData.interpreters.map((interp) => (
                                        <InterpreterRow key={interp.interpreterId} interp={interp} />
                                    ))}
                                    {/* Total footer */}
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                        <p className="font-medium">Total</p>
                                        <p className="font-bold text-green-600 text-lg">${previewData.estimatedTotal.toFixed(2)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <p>No payable appointments found for this period.</p>
                                    <p className="text-sm mt-1">Only Closed, No Show, and Late CX appointments are included.</p>
                                </div>
                            )}

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setStep('form')}
                                    disabled={generateMutation.isPending}
                                    className="flex-1"
                                >
                                    <ArrowLeft className="size-4 mr-2" />
                                    Back
                                </Button>
                                <Button 
                                    onClick={onConfirmGenerate}
                                    disabled={generateMutation.isPending || previewData.totalAppointments === 0}
                                    className="flex-1"
                                >
                                    {generateMutation.isPending ? (
                                        <>
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-4 mr-2" />
                                            Confirm & Generate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}