import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import {format, parse} from "date-fns";
import {Actions} from "@/app/admin/dashboard/interpreters/[interpreterId]/actions";


export type ResponseType = InferResponseType<typeof client.api.appointments.$get, 200>["data"][0]

// Helper to parse projected duration strings like "5h", "45m", "1h30m", "2.5"
const parseProjectedDuration = (duration: string): number | null => {
    if (!duration) return null

    const trimmed = duration.trim().toLowerCase()

    // Check for "Xh Ym" or "XhYm" format (e.g., "1h30m", "1h 30m")
    const hoursMinutesMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*h\s*(\d+)\s*m?/)
    if (hoursMinutesMatch) {
        const hours = parseFloat(hoursMinutesMatch[1])
        const mins = parseInt(hoursMinutesMatch[2])
        return (hours * 60) + mins
    }

    // Check for "Xh" format (e.g., "5h", "2.5h")
    const hoursMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*h$/)
    if (hoursMatch) {
        return parseFloat(hoursMatch[1]) * 60
    }

    // Check for "Xm" format (e.g., "45m", "30m")
    const minutesMatch = trimmed.match(/^(\d+)\s*m$/)
    if (minutesMatch) {
        return parseInt(minutesMatch[1])
    }

    // Check for plain number (assume hours if >= 1, otherwise could be hours as decimal)
    const plainNumber = parseFloat(trimmed)
    if (!isNaN(plainNumber)) {
        // If it's a small number like 1.5, 2, treat as hours
        // If it's larger like 30, 45, 120, it's ambiguous - assume minutes if > 10
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
                <div className={'capitalize'}>
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
                    {formattedTime}
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
        accessorKey: "facility",
        header: "Facility",
        size: 300,
        cell: ({ row }) => {
            return (
                <div className={'capitalize'}>
                    {row.original.facility}
                </div>
            )
        }

    },

]