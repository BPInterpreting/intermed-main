import { ColumnDef } from "@tanstack/react-table"
import { InferResponseType } from "hono"
import { client } from "@/lib/hono"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { Actions } from "./actions" 

export type InvoiceResponseType = InferResponseType<typeof client.api.invoices.$get, 200>["data"][0]

const formatCurrency = (value: string | number | null) => {
    if (value === null || value === undefined) return "$0.00"
    const num = typeof value === "string" ? parseFloat(value) : value
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(num)
}

const statusVariant = (status: string | null) => {
    switch (status) {
        case "draft":
            return "secondary"
        case "sent":
            return "default"
        case "partial":
            return "outline"
        case "paid":
            return "default" // will style green below
        case "overdue":
            return "destructive"
        case "disputed":
            return "destructive"
        default:
            return "secondary"
    }
}

export const columns: ColumnDef<InvoiceResponseType>[] = [
    {
        accessorKey: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => {
            return <Actions id={row.original.id} />
        },
    },
    {
        accessorKey: "invoiceNumber",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Invoice #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        size: 160,
        cell: ({ row }) => {
            return <span className="font-mono font-medium">{row.original.invoiceNumber}</span>
        },
    },
    {
        accessorKey: "payerName",
        header: "Payer",
        size: 200,
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {row.original.payerName || <span className="text-muted-foreground italic">No payer</span>}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <Badge
                    variant={statusVariant(status)}
                    className={
                        status === "paid"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                    }
                >
                    {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "periodStart",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Period
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        size: 220,
        cell: ({ row }) => {
            const start = row.original.periodStart
            const end = row.original.periodEnd
            return (
                <span className="text-sm">
                    {start ? format(new Date(start), "MMM d") : "?"} -{" "}
                    {end ? format(new Date(end), "MMM d, yyyy") : "?"}
                </span>
            )
        },
    },
    {
        accessorKey: "total",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        size: 140,
        cell: ({ row }) => {
            return <span className="font-bold">{formatCurrency(row.original.total)}</span>
        },
    },
    {
        accessorKey: "paidAmount",
        header: "Paid",
        size: 140,
        cell: ({ row }) => {
            const paid = parseFloat(row.original.paidAmount || "0")
            const total = parseFloat(row.original.total || "0")
            const isFullyPaid = paid >= total && total > 0
            return (
                <span className={isFullyPaid ? "text-green-600 font-medium" : ""}>
                    {formatCurrency(paid)}
                </span>
            )
        },
    },
    {
        accessorKey: "dueDate",
        header: "Due Date",
        size: 140,
        cell: ({ row }) => {
            const dueDate = row.original.dueDate
            if (!dueDate) return <span className="text-muted-foreground">-</span>

            const isOverdue = new Date(dueDate) < new Date() && row.original.status !== "paid"
            return (
                <span className={isOverdue ? "text-destructive font-medium" : ""}>
                    {format(new Date(dueDate), "MMM d, yyyy")}
                </span>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        size: 140,
        cell: ({ row }) => {
            return (
                <span className="text-sm text-muted-foreground">
                    {row.original.createdAt ? format(new Date(row.original.createdAt), "MMM d, yyyy") : "-"}
                </span>
            )
        },
    },
]