"use client"

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMarkNotificationsAsRead } from "@/features/notifications/use-mark-notifications-as-read";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { type ResponseType } from "./columns"; // Import the shared type from columns.ts

// Define the props to expect a single 'notification' object.
interface ActionsProps {
    notification: ResponseType;
}

export const Actions = ({ notification }: ActionsProps) => {
    const { mutate: markAsRead } = useMarkNotificationsAsRead();

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

