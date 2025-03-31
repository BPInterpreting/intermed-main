"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Actions } from "@/app/admin/(dashboard)/followUpRequests/actions";
import { formatPhoneNumber } from "@/lib/utils";
import {format, parse} from "date-fns";

export type ResponseType = InferResponseType<typeof client.api.followUpRequests.$get, 200>["data"][0]

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "date",
        header: "Date",
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
        accessorKey: "projectedDuration",
        header: "Projected Duration",
    },
    {
        accessorKey: "appointmentType",
        header: "Appointment Type",

    },
    {
        accessorKey: "status",
        header: "Status",

    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />
    }

]
