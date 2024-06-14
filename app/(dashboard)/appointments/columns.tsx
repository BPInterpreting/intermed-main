"use client"

import {ColumnDef} from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Actions} from "./actions";
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import {format} from "date-fns";


// This is a type definition for the data that will be returned from the API part of the github v4.3 doc
export type ResponseType = InferResponseType<typeof client.api.appointments.$get, 200>["data"][0]


export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("date") as Date

            return(
                <span>
                    {format(date, "dd MMM, yyyy")}
                </span>
            )
        }
    },
    {
        accessorKey: "patient",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Patient
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {

            return(
                <span>
                    {row.original.patient}
                </span>
            )
        }
    },
    {
        accessorKey: "facility",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Facility
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {

            return(
                <span>
                    {row.original.facility}
                </span>
            )
        }
    },
    {
        accessorKey: "notes",
        header: "Notes"
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return(
                <Actions id={row.original.id} />
            )
        }
    }
]
