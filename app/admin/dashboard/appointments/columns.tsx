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

// Helper to parse projected duration strings like "5h", "45m", "1h30m"
const parseProjectedDuration = (duration: string): number | null => {
    if (!duration) return null

    const trimmed = duration.trim().toLowerCase()

    // Check for "Xh Ym" or "XhYm" format
    const hoursMinutesMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*h\s*(\d+)\s*m?/)
    if (hoursMinutesMatch) {
        const hours = parseFloat(hoursMinutesMatch[1])
        const mins = parseInt(hoursMinutesMatch[2])
        return (hours * 60) + mins
    }

    // Check for "Xh" format
    const hoursMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*h$/)
    if (hoursMatch) {
        return parseFloat(hoursMatch[1]) * 60
    }

    // Check for "Xm" format
    const minutesMatch = trimmed.match(/^(\d+)\s*m$/)
    if (minutesMatch) {
        return parseInt(minutesMatch[1])
    }

    // Plain number - assume hours if small, minutes if large
    const plainNumber = parseFloat(trimmed)
    if (!isNaN(plainNumber)) {
        if (plainNumber > 10) {
            return plainNumber // Assume minutes
        } else {
            return plainNumber * 60 // Assume hours
        }
    }

    return null
}

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
        accessorKey: "actualDurationMinutes",
        header: "Duration",
        size: 100,
        cell: ({ row }) => {
            const actualDuration = row.original.actualDurationMinutes as number | null
            const projectedDuration = row.original.projectedDuration as string | null

            let minutes: number | null = null

            // Prefer actual duration if available and valid (positive)
            if (actualDuration && actualDuration > 0) {
                minutes = actualDuration
            } else if (projectedDuration) {
                // Parse projected duration strings like "5h", "45m", "1h30m"
                minutes = parseProjectedDuration(projectedDuration)
            }

            if (minutes === null || minutes <= 0) {
                return <span className="text-muted-foreground">-</span>
            }

            const hours = Math.floor(minutes / 60)
            const mins = Math.round(minutes % 60)

            let display: string
            if (hours === 0) {
                display = `${mins}m`
            } else if (mins === 0) {
                display = `${hours}h`
            } else {
                display = `${hours}h ${mins}m`
            }

            return <span>{display}</span>
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