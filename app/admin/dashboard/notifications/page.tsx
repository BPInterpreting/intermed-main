'use client'

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Check, Plus} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {columns} from "@/app/admin/dashboard/notifications/columns";
import {useGetAllNotifications} from "@/features/notifications/use-get-all-notifications";
import {useMarkNotificationsAsRead} from "@/features/notifications/use-mark-notifications-as-read";

const NotificationsClient = () => {
    const notificationsQuery = useGetAllNotifications();
    const notifications = notificationsQuery.data || []
    const markAsReadMutation = useMarkNotificationsAsRead()

    const handleMarkAllRead = () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length > 0) {
            markAsReadMutation.mutate(unreadIds);
        }
    };

  return(
      <div className='flex-1 px-4 w-full pb-10'>
        <Card className='border-none shadow-none'>
          <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
            <CardTitle className='text-3xl line-clamp-1'>Notifications</CardTitle>
            <Button
                onClick={handleMarkAllRead}
                disabled={markAsReadMutation.isPending || !notifications.some(n => !n.isRead)}
            >
              <Check className='size-4 mr-2'/>
              Mark All As Read
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={notifications}  />
          </CardContent>
        </Card>
      </div>
  )
}

export default NotificationsClient;