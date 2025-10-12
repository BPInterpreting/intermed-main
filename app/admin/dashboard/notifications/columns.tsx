"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useMarkNotificationsAsRead } from "@/features/notifications/use-mark-notifications-as-read";

export type ResponseType = InferResponseType<typeof client.api.notifications.$get, 200>["data"][0];

// Actions Cell Component
const ActionsCell = ({ row }: { row: { original: ResponseType } }) => {
    const { mutate: markAsRead } = useMarkNotificationsAsRead();
    const notification = row.original;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => markAsRead([notification.id])}
                    disabled={notification.isRead}
                >
                    Mark as Read
                </DropdownMenuItem>
                {notification.link && (
                    <DropdownMenuItem asChild>
                        <Link href={notification.link}>View Appointment</Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export const columns: ColumnDef<ResponseType>[] = [
    {
        id: 'status',
        header: '',
        // This cell now renders the simple dot for "Unread" notifications
        cell: ({ row }) => {
            const isRead = row.original.isRead;
            return (
                <div className="flex items-center justify-center">
                    {!isRead && (
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500" title="Unread" />
                    )}
                </div>
            )
        },
        size: 15, // A smaller size for the status column
    },
    {
        accessorKey: 'message',
        header: 'Message',
    },
    {
        accessorKey: 'createdAt',
        header: 'Notification Date',
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <span>{format(date, "PPP p")}</span>;
        }
    },
    {
        id: 'actions',
        cell: ActionsCell,
    },
];

