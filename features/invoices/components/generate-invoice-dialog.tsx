'use client'

import { useState } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { useGetPayers } from "@/features/payers/api/use-get-payers"
import { useGenerateInvoice } from "../use-generate-invoice" 
import { usePreviewInvoice } from "@/features/invoices/api/use-preview-invoice"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
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
    TableFooter,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarIcon, Loader2, AlertTriangle, FileText, CheckCircle2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { useGenerateInvoiceDialog } from "@/features/invoices/hooks/use-generate-invoice-dialog"

const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "$0.00"
    const num = typeof value === "string" ? parseFloat(value) : value
    if (isNaN(num)) return "$0.00"
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(num)
}

const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return 'N/A'
    try {
        const dummyDate = new Date(`1970-01-01T${timeString}`)
        return format(dummyDate, 'h:mm a')
    } catch {
        return timeString
    }
}

export const GenerateInvoiceDialog = () => {
    const { isOpen, onClose } = useGenerateInvoiceDialog()
    const payersQuery = useGetPayers()
    const generateMutation = useGenerateInvoice()
    const previewMutation = usePreviewInvoice()

    const [selectedPayerId, setSelectedPayerId] = useState<string>("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    }))
    const [step, setStep] = useState<"form" | "preview">("form")

    const activePayers = (payersQuery.data || []).filter((p: any) => p.isActive !== false)
    const selectedPayer = activePayers.find((p: any) => p.id === selectedPayerId)
    const canPreview = selectedPayerId && dateRange?.from && dateRange?.to

    const previewData = previewMutation.data && 'data' in previewMutation.data
        ? previewMutation.data.data
        : null

    const handlePreview = () => {
        if (!canPreview) return

        previewMutation.mutate(
            {
                payerId: selectedPayerId,
                periodStart: dateRange!.from!,
                periodEnd: dateRange!.to!,
            },
            {
                onSuccess: () => {
                    setStep("preview")
                },
            }
        )
    }

    const handleGenerate = () => {
        if (!canPreview) return

        generateMutation.mutate(
            {
                payerId: selectedPayerId,
                periodStart: dateRange!.from!,
                periodEnd: dateRange!.to!,
            },
            {
                onSuccess: () => {
                    handleClose()
                },
            }
        )
    }

    const handleClose = () => {
        setSelectedPayerId("")
        setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
        setStep("form")
        previewMutation.reset()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent style={step === "preview" ? { maxWidth: '64rem' } : { maxWidth: '500px' }}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="size-5" />
                        Generate Invoice
                    </DialogTitle>
                    <DialogDescription>
                        {step === "form"
                            ? "Bundle completed appointments into an invoice for a payer"
                            : "Review the invoice details before generating"
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === "form" && (
                    <div className="space-y-4 pt-2">
                        {/* Payer Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payer</label>
                            <Select value={selectedPayerId} onValueChange={setSelectedPayerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a payer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {activePayers.map((payer: any) => (
                                        <SelectItem key={payer.id} value={payer.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{payer.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {payer.type?.replace("_", " ")}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Billing Period</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "MMM d, yyyy")} -{" "}
                                                    {format(dateRange.to, "MMM d, yyyy")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "MMM d, yyyy")
                                            )
                                        ) : (
                                            <span>Select billing period</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Summary Preview */}
                        {selectedPayer && dateRange?.from && dateRange?.to && (
                            <>
                                <Separator />
                                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                                    <p className="text-sm font-medium">Payer Details</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Payer</span>
                                        <span className="font-medium">{selectedPayer.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Default Rate</span>
                                        <span>
                                            {selectedPayer.defaultHourlyRate
                                                ? `${formatCurrency(selectedPayer.defaultHourlyRate)}/hr`
                                                : "Not set"
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Payment Terms</span>
                                        <span>Net {selectedPayer.paymentTermsDays || 30} days</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePreview}
                                disabled={!canPreview || previewMutation.isPending}
                            >
                                {previewMutation.isPending ? (
                                    <>
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                        Loading Preview...
                                    </>
                                ) : (
                                    "Preview Invoice"
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {step === "preview" && previewData && (
                    <div className="space-y-4 pt-2">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg border p-3 text-center">
                                <p className="text-2xl font-bold">{previewData.totalAppointments}</p>
                                <p className="text-xs text-muted-foreground">Appointments</p>
                            </div>
                            <div className="rounded-lg border p-3 text-center">
                                <p className="text-2xl font-bold">{previewData.totalHours.toFixed(1)}h</p>
                                <p className="text-xs text-muted-foreground">Total Hours</p>
                            </div>
                            <div className="rounded-lg border p-3 text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(previewData.estimatedTotal)}
                                </p>
                                <p className="text-xs text-muted-foreground">Estimated Total</p>
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div className="flex items-center gap-2">
                            {previewData.statusBreakdown.closed > 0 && (
                                <Badge variant="default" className="text-xs">
                                    {previewData.statusBreakdown.closed} Closed
                                </Badge>
                            )}
                            {previewData.statusBreakdown.noShow > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {previewData.statusBreakdown.noShow} No Show
                                </Badge>
                            )}
                            {previewData.statusBreakdown.lateCancel > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {previewData.statusBreakdown.lateCancel} Late CX
                                </Badge>
                            )}
                        </div>

                        {/* Warnings */}
                        {previewData.warnings.length > 0 && (
                            <div className="space-y-2">
                                {previewData.warnings.map((warning: any, i: number) => (
                                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-sm">
                                        <AlertTriangle className="size-4 mt-0.5 text-amber-500 shrink-0" />
                                        <span className="text-amber-800 dark:text-amber-200">{warning.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Separator />

                        {/* Line Items Table */}
                        {previewData.lineItems.length > 0 ? (
                            <ScrollArea className="max-h-[350px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Date</TableHead>
                                            <TableHead className="text-xs">Status</TableHead>
                                            <TableHead className="text-xs">Patient</TableHead>
                                            <TableHead className="text-xs">Interpreter</TableHead>
                                            <TableHead className="text-xs">Time</TableHead>
                                            <TableHead className="text-xs text-right">Hours</TableHead>
                                            <TableHead className="text-xs text-right">Rate</TableHead>
                                            <TableHead className="text-xs text-right">Miles</TableHead>
                                            <TableHead className="text-xs text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.lineItems.map((item: any) => (
                                            <TableRow key={item.appointmentId}>
                                                <TableCell className="text-xs py-2">
                                                    {format(new Date(item.date), "MMM d")}
                                                </TableCell>
                                                <TableCell className="text-xs py-2">
                                                    <Badge
                                                        variant={
                                                            item.status === 'Closed' ? 'default' :
                                                            item.status === 'No Show' ? 'destructive' :
                                                            'secondary'
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs py-2 max-w-[100px] truncate" title={item.patientName}>
                                                    {item.patientName}
                                                </TableCell>
                                                <TableCell className="text-xs py-2 max-w-[100px] truncate" title={item.interpreterName}>
                                                    {item.interpreterName}
                                                </TableCell>
                                                <TableCell className="text-xs py-2">
                                                    {formatTime(item.startTime)}
                                                    {item.endTime ? ` - ${formatTime(item.endTime)}` : ''}
                                                </TableCell>
                                                <TableCell className="text-xs py-2 text-right">
                                                    {item.adjustmentType ? '-' : `${item.serviceHours.toFixed(1)}`}
                                                </TableCell>
                                                <TableCell className="text-xs py-2 text-right">
                                                    {item.adjustmentType
                                                        ? (item.adjustmentType === 'no_show' ? 'No Show' : 'Late CX')
                                                        : formatCurrency(item.hourlyRate)
                                                    }
                                                </TableCell>
                                                <TableCell className="text-xs py-2 text-right">
                                                    {item.mileage > 0 ? `${item.mileage.toFixed(1)}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-xs py-2 text-right font-medium">
                                                    {formatCurrency(item.lineTotal)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-right text-sm font-medium">
                                                Invoice Total
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                {formatCurrency(previewData.estimatedTotal)}
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </ScrollArea>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No billable appointments found for this period.</p>
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
                                onClick={handleGenerate}
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
                )}
            </DialogContent>
        </Dialog>
    )
}