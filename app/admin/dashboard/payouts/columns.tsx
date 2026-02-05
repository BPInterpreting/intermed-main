"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Actions } from "./actions";
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type ResponseType = InferResponseType<typeof client.api.payouts.$get, 200>["data"][0]

export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => {
            return <Actions 
                id={row.original.id} 
                status={row.original.status} 
            />
        }
    },
    {
        accessorKey: "payoutNumber",
        header: "Payout #",
        size: 140,
        cell: ({ row }) => {
            return (
                <span className="font-mono font-medium">
                    {row.original.payoutNumber}
                </span>
            )
        }
    },
    {
        accessorKey: "interpreterName",
        header: "Interpreter",
        size: 180,
    },
    {
        accessorKey: "periodStart",
        header: "Period",
        size: 160,
        cell: ({ row }) => {
            const start = row.original.periodStart
            const end = row.original.periodEnd
            
            if (!start || !end) return <span>-</span>
            
            return (
                <span>
                    {format(new Date(start), "MMM d")} - {format(new Date(end), "MMM d")}
                </span>
            )
        }
    },
    {
        accessorKey: "total",
        header: "Total",
        size: 120,
        cell: ({ row }) => {
            const total = row.original.total
            if (!total) return <span>$0.00</span>
            return <span className="font-medium">${parseFloat(total).toFixed(2)}</span>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => {
            const status = row.original.status

            const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "closed" | "destructive" | "pendingConfirmation"  }> = {
                pending: { label: "Pending", variant: "default" },
                processing: { label: "Processing", variant: "pendingConfirmation" },
                paid: { label: "Paid", variant: "closed" },
                cancelled: { label: "Cancelled", variant: "destructive" },
            }

            const config = statusConfig[status] || { label: status, variant: "outline" }

            return (
                <Badge variant={config.variant}>
                    {config.label}
                </Badge>
            )
        }
    },
    {
        accessorKey: "paidAt",
        header: "Paid Date",
        size: 120,
        cell: ({ row }) => {
            const paidAt = row.original.paidAt
            if (!paidAt) return <span className="text-muted-foreground">-</span>
            return <span>{format(new Date(paidAt), "MMM d, yyyy")}</span>
        }
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        size: 120,
        cell: ({ row }) => {
            const date = row.original.createdAt
            if (!date) return <span>-</span>
            return <span>{format(new Date(date), "PP")}</span>
        }
    },
]