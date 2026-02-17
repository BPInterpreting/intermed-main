'use client'

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useGetInvoice } from "@/features/invoices/api/use-get-invoice"
import { useMarkInvoiceSent } from "@/features/invoices/api/use-mark-invoice-sent"
import { useRecordInvoicePayment } from "@/features/invoices/api/use-record-invoice-payment"
import { useDeleteInvoice } from "@/features/invoices/api/use-delete-invoice"
import { format, parseISO } from "date-fns"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    FileText,
    MoreHorizontal,
    Send,
    CheckCircle,
    DollarSign,
    Trash2,
    Loader2,
    AlertTriangle,
    ArrowLeft,
    Building,
    Calendar,
    Clock,
    Hash,
} from "lucide-react"

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

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A"
    try {
        return format(parseISO(dateStr), "MMM d, yyyy")
    } catch {
        try {
            return format(new Date(dateStr), "MMM d, yyyy")
        } catch {
            return "N/A"
        }
    }
}

const statusVariant = (status: string | null) => {
    switch (status) {
        case "draft": return "secondary"
        case "sent": return "default"
        case "paid": return "default"
        case "partial": return "outline"
        case "overdue": return "destructive"
        default: return "secondary"
    }
}

const InvoicePage = () => {
    const params = useParams()
    const router = useRouter()
    const invoiceId = params.invoiceId as string

    const { data: invoice, isLoading } = useGetInvoice(invoiceId)
    const markSent = useMarkInvoiceSent(invoiceId)
    const recordPayment = useRecordInvoicePayment(invoiceId)
    const deleteInvoice = useDeleteInvoice(invoiceId)

    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState("")
    const [paymentNotes, setPaymentNotes] = useState("")

    const lineItems = invoice?.lineItems || []
    const outstanding = parseFloat(invoice?.total || "0") - parseFloat(invoice?.paidAmount || "0")

    const handleMarkSent = () => {
        markSent.mutate({})
    }

    const handleRecordPayment = () => {
        if (!paymentAmount) return
        recordPayment.mutate(
            {
                amount: paymentAmount,
                notes: paymentNotes || undefined,
            },
            {
                onSuccess: () => {
                    setPaymentDialogOpen(false)
                    setPaymentAmount("")
                    setPaymentNotes("")
                },
            }
        )
    }

    const handleDelete = () => {
        deleteInvoice.mutate(
            undefined,
            {
                onSuccess: () => {
                    router.push("/admin/dashboard/billing/invoices")
                },
            }
        )
    }

    if (isLoading) {
        return <InvoicePageSkeleton />
    }

    if (!invoice) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-2">
                    <p className="text-lg font-medium">Invoice not found</p>
                    <Button variant="outline" onClick={() => router.push("/admin/dashboard/billing/invoices")}>
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Invoices
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DollarSign className="size-5" />
                            Record Payment
                        </DialogTitle>
                        <DialogDescription>
                            Record a payment received for {invoice.invoiceNumber}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Invoice Total</span>
                                <span className="font-medium">{formatCurrency(invoice.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Previously Paid</span>
                                <span>{formatCurrency(invoice.paidAmount)}</span>
                            </div>
                            <Separator className="my-1" />
                            <div className="flex justify-between text-sm font-medium">
                                <span>Outstanding</span>
                                <span className="text-amber-600">{formatCurrency(outstanding)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Amount *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder={outstanding.toFixed(2)}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                            />
                            <div className="flex gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => setPaymentAmount(outstanding.toFixed(2))}
                                >
                                    Pay in Full
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                                placeholder="e.g., ACH payment, Check #1234"
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleRecordPayment}
                            disabled={!paymentAmount || recordPayment.isPending}
                        >
                            {recordPayment.isPending ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="size-4 mr-2" />
                                    Record Payment
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {invoice.invoiceNumber} and restore all linked
                            appointments to pending billing status. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteInvoice.isPending ? (
                                <Loader2 className="size-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="size-4 mr-2" />
                            )}
                            Delete Invoice
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Main Content */}
            <div className="flex-1 space-y-4 p-8 pt-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/dashboard/billing">Billing</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/dashboard/billing/invoices">Invoices</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{invoice.invoiceNumber}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="flex items-center gap-3 mt-1">
                            <h2 className="text-3xl font-bold tracking-tight">{invoice.invoiceNumber}</h2>
                            <Badge variant={statusVariant(invoice.status) as any} className="text-sm">
                                {invoice.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {invoice.status === "draft" && (
                            <Button onClick={handleMarkSent} disabled={markSent.isPending}>
                                <Send className="size-4 mr-2" />
                                Mark as Sent
                            </Button>
                        )}
                        {(invoice.status === "sent" || invoice.status === "partial" || invoice.status === "overdue") && (
                            <Button onClick={() => setPaymentDialogOpen(true)}>
                                <DollarSign className="size-4 mr-2" />
                                Record Payment
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                                {invoice.status === "draft" && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => setDeleteDialogOpen(true)}
                                        >
                                            <Trash2 className="size-4 mr-2" />
                                            Delete Invoice
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Invoice Info Grid */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                    {/* Left Column - Invoice Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-row items-center space-x-4">
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Building className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">Payer</span>
                                    <span className="font-medium">{invoice.payerName || "N/A"}</span>
                                    {invoice.payerType && (
                                        <Badge variant="outline" className="w-fit text-xs mt-0.5">
                                            {(invoice.payerType as string).replace("_", " ")}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-row items-center space-x-4">
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">Billing Period</span>
                                    <span className="font-medium">
                                        {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-row items-center space-x-4">
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">Due Date</span>
                                    <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                                </div>
                            </div>

                            <div className="flex flex-row items-center space-x-4">
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Hash className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="font-medium">{formatDate(invoice.createdAt)}</span>
                                </div>
                            </div>

                            {invoice.sentAt && (
                                <div className="flex flex-row items-center space-x-4">
                                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Send className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-muted-foreground">Sent</span>
                                        <span className="font-medium">{formatDate(invoice.sentAt)}</span>
                                    </div>
                                </div>
                            )}

                            {invoice.paidAt && (
                                <div className="flex flex-row items-center space-x-4">
                                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-muted-foreground">Paid</span>
                                        <span className="font-medium">{formatDate(invoice.paidAt)}</span>
                                    </div>
                                </div>
                            )}

                            {invoice.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <span className="text-sm text-muted-foreground">Notes</span>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{invoice.notes}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column - Financial Summary + Line Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Financial Summary */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{formatCurrency(invoice.subtotal)}</p>
                                        <p className="text-xs text-muted-foreground">Subtotal</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(invoice.paidAmount)}</p>
                                        <p className="text-xs text-muted-foreground">Paid</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-2xl font-bold ${outstanding > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                            {formatCurrency(outstanding)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Outstanding</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Line Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="size-5" />
                                    Line Items
                                </CardTitle>
                                <CardDescription>
                                    {lineItems.length} appointment{lineItems.length !== 1 ? "s" : ""} in this invoice
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {lineItems.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Booking</TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Interpreter</TableHead>
                                                <TableHead>Facility</TableHead>
                                                <TableHead className="text-right">Hours</TableHead>
                                                <TableHead className="text-right">Rate</TableHead>
                                                <TableHead className="text-right">Service</TableHead>
                                                <TableHead className="text-right">Miles</TableHead>
                                                <TableHead className="text-right">Mileage</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lineItems.map((item: any) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="text-sm">
                                                        {formatDate(item.serviceDate)}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        #{item.bookingId}
                                                    </TableCell>
                                                    <TableCell className="text-sm max-w-[120px] truncate" title={item.patientName}>
                                                        {item.patientName || "—"}
                                                    </TableCell>
                                                    <TableCell className="text-sm max-w-[120px] truncate" title={item.interpreterName}>
                                                        {item.interpreterName || "—"}
                                                    </TableCell>
                                                    <TableCell className="text-sm max-w-[120px] truncate" title={item.facilityName}>
                                                        {item.facilityName || "—"}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-right">
                                                        {item.adjustmentType
                                                            ? "—"
                                                            : parseFloat(item.serviceHours || "0").toFixed(1)
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-sm text-right">
                                                        {item.adjustmentType ? (
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                {item.adjustmentType === "no_show" ? "No Show" : "Late CX"}
                                                            </Badge>
                                                        ) : (
                                                            formatCurrency(item.serviceRate)
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-right">
                                                        {item.adjustmentType
                                                            ? formatCurrency(item.adjustmentAmount)
                                                            : formatCurrency(item.serviceAmount)
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-sm text-right">
                                                        {parseFloat(item.mileage || "0") > 0
                                                            ? parseFloat(item.mileage).toFixed(1)
                                                            : "—"
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-sm text-right">
                                                        {parseFloat(item.mileageAmount || "0") > 0
                                                            ? formatCurrency(item.mileageAmount)
                                                            : "—"
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-sm text-right font-medium">
                                                        {formatCurrency(item.lineTotal)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-right font-medium">
                                                    Invoice Total
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-green-600">
                                                    {formatCurrency(invoice.total)}
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No line items found.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InvoicePage

const InvoicePageSkeleton = () => {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-10 w-72" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                <Card>
                    <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                        <CardContent>
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}