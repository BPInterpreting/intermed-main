'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetAllNotifications = () => {
    const query = useQuery({
        queryKey: ['allNotifications'],
        queryFn: async () => {
            const response = await client.api.notifications.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const { data } = await response.json();
            return data;
        },
    });
    return query;
};
