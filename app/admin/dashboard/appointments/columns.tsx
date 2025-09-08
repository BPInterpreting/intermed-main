"use client"

import {ColumnDef} from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Actions} from "./actions";
import {format, parse} from "date-fns"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";

// This is a type definition for the data that will be returned from the API part of the GitHub v4.3 doc
export type ResponseType = InferResponseType<typeof client.api.appointments.$get, 200>["data"][0]

export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "actions",
        header: "Actions",
        size:80,
        cell: ({ row }) => {
            return(
                <Actions id={row.original.id} />
            )
        }
    },
    {
        accessorKey: 'bookingId',
        header: 'Booking ID',
        size: 120,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        size: 200,
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
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Appointment Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        size: 200,
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
        size: 300
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
    },
    {
        accessorKey: "notes",
        header: "Notes",
        size: 350,
        cell: ({ row }) => {
            const notes = row.getValue("notes") as string;

            if (!notes) return <span>-</span>;

            // Your new facility address handling
            if (notes.includes('New Facility Address:')) {
                const parts = notes.split('New Facility Address:');
                const regularNotes = parts[0].trim();
                const newAddress = parts[1].trim();

                return (
                    <div className="space-y-2 whitespace-normal break-words">
                        {regularNotes && <p>{regularNotes}</p>}
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-600">⚠️</span>
                                <span className="font-semibold text-yellow-800 text-sm">
                                New Facility Address:
                            </span>
                            </div>
                            <p className="text-yellow-700 text-sm mt-1 break-all">
                                {newAddress}
                            </p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="whitespace-normal break-words">
                    {notes}
                </div>
            );
        }
    },

]

