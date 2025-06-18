"use client"

import {ColumnDef} from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Actions} from "./actions";
import {format, parse} from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {DataTableColumnHeader} from "@/components/ui/data-table-column-header";


// This is a type definition for the data that will be returned from the API part of the GitHub v4.3 doc
export type ResponseType = InferResponseType<typeof client.api.appointments.$get, 200>["data"][0]

export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return(
                <Actions id={row.original.id} />
            )
        }
    },
    {
        accessorKey: 'bookingId',
        header: 'Booking ID',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            switch (row.original.status) {
                case "Interpreter Requested":
                    return (
                        <div>
                            <Badge variant={'interpreterRequested'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Cancelled":
                    return (
                        <div>
                            <Badge variant={'cancelled'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Closed":
                    return (
                        <div>
                            <Badge variant={'closed'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Pending Confirmation":
                    return (
                        <div>
                            <Badge variant={'pendingConfirmation'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Pending Authorization":
                    return (
                        <div>
                            <Badge variant={'pendingAuthorization'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Confirmed":
                    return (
                        <div>
                            <Badge variant={'confirmed'}>
                                {row.original.status}
                            </Badge>
                        </div>

                    )
                case "Late CX":
                    return (
                        <div>
                            <Badge variant={'cancelled'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "No Show":
                    return (
                        <div>
                            <Badge variant={'cancelled'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
            }
        }
    },
    {
        accessorKey: "patient",
        header: "Patient",
        cell: ({ row }) => {
            return (
                <div>
                    {row.original.patient} {row.original.patientLastName}
                </div>
            )
        }

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
            const timeString = row.getValue("endTime") as string | null
            if (!timeString) {
                return <span>N/A</span>;
            }
            const parsedTime = parse(timeString, "HH:mm:ss", new Date())
            const formattedTime = format(parsedTime, "hh:mm a")


            return(
                <span>
                    {formattedTime }
                </span>
            )
        }
    },
    {
        // This combines first and last name for display and allows filtering on the full name
        accessorFn: (row) => `${row.interpreterFirstName || ''} ${row.interpreterLastName || ''}`.trim(),
        id: "interpreter", // This ID MUST match the filter key in the toolbar
        header: "Interpreter",
        filterFn: (row, id, value) => { // This filter function allows selecting multiple interpreters
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "facility",
        header: "Facility",
    },
    {
        accessorKey: 'isCertified',
        header: 'isCertified',
    },
    {
        accessorKey: "appointmentType",
        header: "Appointment Type",
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as Date

            return(
                <span>
                    {format(date, "cccccc, PPP")}
                </span>
            )
        }
    }
    // {
    //     accessorKey: "notes",
    //     header: "Notes"
    // },

]

