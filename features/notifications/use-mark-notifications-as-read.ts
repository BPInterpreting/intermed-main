'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { InferRequestType } from 'hono/client';

// We can infer the type directly from the API route for perfect type safety
type RequestType = InferRequestType<typeof client.api.notifications['mark-read']['$post']>['json'];

export const useMarkNotificationsAsRead = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        // By adding the type here, we fix the error
        mutationFn: async (ids: RequestType['ids']) => {
            const response = await client.api.notifications['mark-read'].$post({
                json: { ids },
            });

            if (!response.ok) {
                throw new Error('Failed to mark notifications as read');
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notificationSummary'] });
            queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
        },
    });

    return mutation;
};