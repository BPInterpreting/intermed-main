"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Actions } from "@/app/admin/dashboard/payers/actions";
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type ResponseType = InferResponseType<typeof client.api.payers.$get, 200>["data"][0]

export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => {
            return <Actions id={row.original.id} isActive={row.original.isActive} />
        }
    },
    {
        accessorKey: "name",
        header: "Payer Name",
        size: 250,
    },
    {
        accessorKey: "type",
        header: "Type",
        size: 150,
        cell: ({ row }) => {
            const type = row.original.type

            const typeLabels: Record<string, string> = {
                workers_comp: "Workers Comp",
                medi_cal: "Medi-Cal",
            }

            return (
                <Badge variant={type === "workers_comp" ? "default" : "secondary"}>
                    {typeLabels[type] || type}
                </Badge>
            )
        }
    },
    {
        accessorKey: "defaultHourlyRate",
        header: "Hourly Rate",
        size: 120,
        cell: ({ row }) => {
            const rate = row.original.defaultHourlyRate
            if (!rate) return <span className="text-muted-foreground">-</span>
            return <span>${parseFloat(rate).toFixed(2)}/hr</span>
        }
    },
    {
        accessorKey: "minimumHours",
        header: "Min Hours",
        size: 100,
        cell: ({ row }) => {
            const hours = row.original.minimumHours
            if (!hours) return <span className="text-muted-foreground">-</span>
            return <span>{parseFloat(hours)} hrs</span>
        }
    },
    {
        accessorKey: "lateCancelFee",
        header: "Late Cancel",
        size: 120,
        cell: ({ row }) => {
            const fee = row.original.lateCancelFee
            if (!fee) return <span className="text-muted-foreground">-</span>
            return <span>${parseFloat(fee).toFixed(2)}</span>
        }
    },
    {
        accessorKey: "noShowFee",
        header: "No Show",
        size: 120,
        cell: ({ row }) => {
            const fee = row.original.noShowFee
            if (!fee) return <span className="text-muted-foreground">-</span>
            return <span>${parseFloat(fee).toFixed(2)}</span>
        }
    },
    {
        accessorKey: "billingCode",
        header: "Billing Code",
        size: 130,
        cell: ({ row }) => {
            const code = row.original.billingCode
            if (!code) return <span className="text-muted-foreground">-</span>
            return <span className="font-mono text-sm">{code}</span>
        }
    },
    {
        accessorKey: "isActive",
        header: "Status",
        size: 100,
        cell: ({ row }) => {
            const isActive = row.original.isActive
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        size: 150,
        cell: ({ row }) => {
            const date = row.original.createdAt
            if (!date) return <span>-</span>
            return <span>{format(new Date(date), "PP")}</span>
        }
    },
]