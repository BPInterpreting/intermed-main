/*
* This notification bell component has
* */

'use client';

import React, { useState } from 'react';
import { useGetNotifications } from "@/features/notifications/use-get-notifications";
import { useMarkNotificationsAsRead } from '@/features/notifications/use-mark-notifications-as-read';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {Bell, Check, XCircle} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define the type for the component's props
interface NotificationBellProps {
    onShowAllClick: () => void;
}

export const NotificationBell = ({ onShowAllClick }: NotificationBellProps) => {
    const notificationsQuery = useGetNotifications()
    const markAsReadMutation = useMarkNotificationsAsRead()
    const [isOpen, setIsOpen] = React.useState(false)

    if (notificationsQuery.isLoading) {
        return (
            <Button variant='outline' size={"icon"}>
                <Bell className="h-[1.2rem] w-[1.2rem] animate-pulse" />
            </Button>
        )
    }
    // Handle the error state
    if (notificationsQuery.error || !notificationsQuery.data || 'error' in notificationsQuery.data) {
        return (
            <Button variant="outline" size="icon" >
                <XCircle className="h-[1.2rem] w-[1.2rem] text-red-500" />
            </Button>
        );
    }

    const { unreadCount, latestNotifications } = notificationsQuery.data;

    const handleMarkAllRead = () => {
        const unreadIds = latestNotifications
            .filter(n => !n.isRead)
            .map(n => n.id);

        if (unreadIds.length > 0) {
            markAsReadMutation.mutate(unreadIds);
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant={'outline'} size={'icon'} className={'relative'}>
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                            {unreadCount}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4">
                    <h4 className="font-medium">Notifications</h4>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {latestNotifications.length === 0 ? (
                        <p className="p-4 text-sm text-center text-gray-500">No new notifications</p>
                    ) : (
                        latestNotifications.map((notification) => (
                            <div key={notification.id} className="flex items-start p-4 border-t hover:bg-gray-50">
                                <div className={`h-2 w-2 rounded-full mt-1.5 mr-3 ${!notification.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                                <div className="flex-1">
                                    <p className="text-sm">{notification.message}</p>
                                    {notification.subtext && (
                                        <p className="text-xs text-gray-500 mt-1">{notification.subtext}</p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-between p-2 border-t bg-gray-50">
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                        <Check className="mr-2 h-4 w-4" /> Mark all as read
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                            onShowAllClick();
                            setIsOpen(false);
                        }}>
                        View All
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )

}