'use client'

import { useState } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { useGetPayers } from "@/features/payers/api/use-get-payers"
import { useGenerateInvoice } from "../use-generate-invoice" 
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
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Loader2, AlertTriangle, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { useGenerateInvoiceDialog } from "@/features/invoices/hooks/use-generate-invoice-dialog"

const formatCurrency = (value: string | number | null) => {
    if (value === null || value === undefined) return "$0.00"
    const num = typeof value === "string" ? parseFloat(value) : value
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(num)
}

export const GenerateInvoiceDialog = () => {
    const { isOpen, onClose } = useGenerateInvoiceDialog()
    const payersQuery = useGetPayers()
    const generateMutation = useGenerateInvoice()

    const [selectedPayerId, setSelectedPayerId] = useState<string>("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    }))
    const [step, setStep] = useState<"select" | "confirm">("select")

    const activePayers = (payersQuery.data || []).filter((p: any) => p.isActive !== false)

    const handleGenerate = () => {
        if (!selectedPayerId || !dateRange?.from || !dateRange?.to) return

        generateMutation.mutate(
            {
                payerId: selectedPayerId,
                periodStart: dateRange.from,
                periodEnd: dateRange.to,
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
        setStep("select")
        onClose()
    }

    const selectedPayer = activePayers.find((p: any) => p.id === selectedPayerId)
    const canGenerate = selectedPayerId && dateRange?.from && dateRange?.to

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="size-5" />
                        Generate Invoice
                    </DialogTitle>
                    <DialogDescription>
                        Bundle completed appointments into an invoice for a payer
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Step 1: Select Payer */}
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

                    {/* Step 2: Date Range */}
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
                                <p className="text-sm font-medium">Invoice Preview</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Payer</span>
                                    <span className="font-medium">{selectedPayer.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Period</span>
                                    <span>
                                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                                    </span>
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

                    {/* Info Notice */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-sm">
                        <AlertTriangle className="size-4 mt-0.5 text-blue-500 shrink-0" />
                        <p className="text-muted-foreground">
                            This will bundle all completed appointments for this payer within the 
                            selected period that haven&apos;t been invoiced yet. Appointments with 
                            status Closed, No Show, or Late CX will be included.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGenerate}
                            disabled={!canGenerate || generateMutation.isPending}
                        >
                            {generateMutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="size-4 mr-2" />
                                    Generate Invoice
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}