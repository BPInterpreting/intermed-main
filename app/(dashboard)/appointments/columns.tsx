"use client"

import {ColumnDef} from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Actions} from "./actions";
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import {format, parse} from "date-fns"
import {time} from "drizzle-orm/pg-core";


// This is a type definition for the data that will be returned from the API part of the github v4.3 doc
export type ResponseType = InferResponseType<typeof client.api.appointments.$get, 200>["data"][0]


export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "patient",
        header: "Patient",

    },
    {
        accessorKey: "date",
        header: "Appointment Date",
        cell: ({ row }) => {
            const date = row.getValue("date") as Date

            return(
                <span>
                    {format(date, "cccccc, PPP")}
                </span>
            )
        }
    },
    {
        accessorKey: "startTime",
        header: "Start Time",
        cell: ({ row }) => {
            const timeString = row.getValue("startTime") as string
            const parsedTime = parse(timeString, "HH:mm:ss", new Date())
            const formattedTime = format(parsedTime, "hh:mm a")

            return(
                <span>
                    {formattedTime}
                </span>
            )
        }

    },
    {
        accessorKey: "endTime",
        header: "End Time",
        cell: ({ row }) => {
            const timeString = row.getValue("endTime") as string
            const parsedTime = parse(timeString, "HH:mm:ss", new Date())
            const formattedTime = format(parsedTime, "hh:mm a")

            return(
                <span>
                    {formattedTime}
                </span>
            )
        }
    },
    {
        accessorKey: "facility",
        header: "Facility",
    },
    {
        accessorKey: "appointmentType",
        header: "Appointment Type",
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
