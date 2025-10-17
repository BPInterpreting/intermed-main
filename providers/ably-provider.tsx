'use client';

import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

// A simple full-page loader component
const FullPageLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
    </div>
);

export function AblyClientProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const [client, setClient] = useState<Ably.Realtime | null>(null);

    useEffect(() => {
        // Don't run the effect until Clerk is fully loaded and we have an admin user
        if (!isLoaded || !user || (user.publicMetadata as { role?: string })?.role !== 'admin') {
            return;
        }

        if (!process.env.NEXT_PUBLIC_ABLY_API_KEY) {
            console.error('🔴 NEXT_PUBLIC_ABLY_API_KEY is undefined!');
            return;
        }

        // Create the client as a local variable within the effect
        let ablyClient: Ably.Realtime;
        try {
            ablyClient = new Ably.Realtime({
                key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
                clientId: user.id,
            });

            ablyClient.connection.on('connected', () => {
                console.log('✅ Connected to Ably!');
            });

            setClient(ablyClient);
        } catch (error) {
            console.error('🔴 Error creating Ably client:', error);
            return; // Exit if client creation fails
        }

        // This cleanup function will run when the component unmounts or the user changes.
        // It correctly closes the client that was created in this specific effect run.
        return () => {
            ablyClient?.connection.close();
        };

        // The effect should only re-run if the user changes.
    }, [user, isLoaded]);

    // --- RENDER LOGIC ---

    if (!isLoaded) {
        return <FullPageLoader />;
    }

    const userRole = (user?.publicMetadata as { role?: string })?.role;
    if (!user || userRole !== 'admin') {
        return <>{children}</>;
    }

    if (!client) {
        return <FullPageLoader />;
    }

    return (
        <AblyProvider client={client}>
            {children}
        </AblyProvider>
    );
}

