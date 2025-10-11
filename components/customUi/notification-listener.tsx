'use client';

import { useAbly } from 'ably/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationListener() {
    const ably = useAbly();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!ably) return;

        const channel = ably.channels.get('admin:notifications');

        const messageHandler = (message: any) => {
            console.log('🔔 MESSAGE RECEIVED - START');
            console.log('Message name:', message.name);
            console.log('Message data:', message.data);

            // Try toast with simpler approach first
            try {
                console.log('Attempting to show toast...');
                toast.success('Status Updated!');
                console.log('Toast command executed');
            } catch (error) {
                console.error('Toast error:', error);
            }

            // Then try invalidating queries
            try {
                console.log('Invalidating queries...');
                queryClient.invalidateQueries({ queryKey: ['appointments'] });
                console.log('Queries invalidated');
            } catch (error) {
                console.error('Query invalidation error:', error);
            }

            console.log('🔔 MESSAGE RECEIVED - END');
        };

        channel.subscribe(messageHandler);
        console.log('Subscribed to channel');

        return () => {
            channel.unsubscribe(messageHandler);
        };
    }, [ably, queryClient]);

    return (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-2 text-xs">

        </div>
    );
}