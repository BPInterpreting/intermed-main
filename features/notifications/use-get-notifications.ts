import {useQuery, useQueryClient} from "@tanstack/react-query"
import { client } from '@/lib/hono'
import {useAbly} from "ably/react";
import {useUser} from "@clerk/nextjs";
import {useEffect} from "react";
import {toast} from "sonner";

export const useGetNotifications = () => {
    const ably = useAbly()
    const { user } = useUser()
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['notificationSummary'],
        queryFn: async () => {
            const response = await client.api.notifications.summary.$get()

            if (!response.ok) {
                throw new Error('Failed to get notification summary from server')
            }

            const data = await response.json()
            return data
        }
    })

    //listener for ably that keeps the data up to date
    useEffect(() => {
        if (!user || !ably) return

        //listen to broadcast message for all admins
        const adminChannel = ably.channels.get('admin:notifications')
        const adminMessageHandler = (message: any) => {
            toast.info(message.data.message || `Appointment #${message.data.bookingId} is now ${message.data.newStatus}.`)
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['notificationSummary'] });
            queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
        }
        adminChannel.subscribe('appointment-status-changed', adminMessageHandler)
        // Listens for private messages sent directly to this user
        const userChannel = ably.channels.get(`user:${user.id}`);
        const userMessageHandler = () => {
            toast.success("You have a new notification.");
            queryClient.invalidateQueries({ queryKey: ['notificationSummary'] });
            queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
        };
        userChannel.subscribe('new-notification', userMessageHandler);

        return () => {
            adminChannel.unsubscribe('appointment-status-changed', adminMessageHandler);
            userChannel.unsubscribe('new-notification', userMessageHandler);
        }
    }, [ably, user, queryClient])

    return query
}