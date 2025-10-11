/*
* The point of this ably provider is to use clerk inside this component which is then used to wrap the layout using the ably provider.
* ably has their own provider but in order to use clerk this custom component is necessary. clerkId is used to send custom notifications
* to certain admins.
* */

'use client';

import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function AblyClientProvider({ children }: { children: React.ReactNode }) {
    console.log('🟦 AblyClientProvider rendering');

    //get the clerk user.
    const { user, isLoaded } = useUser();
    const [client, setClient] = useState<Ably.Realtime | null>(null);

    // Log immediately
    console.log('🟦 Initial state:', {
        isLoaded,
        hasUser: !!user,
        userId: user?.id,
        publicMetadata: user?.publicMetadata,
        role: (user?.publicMetadata as { role?: string })?.role,
        envVar: !!process.env.NEXT_PUBLIC_ABLY_API_KEY
    });

    useEffect(() => {
        console.log('🟦 useEffect running');

        if (!isLoaded) {
            console.log('🟦 Waiting for Clerk to load...');
            return;
        }

        if (!user) {
            console.log('🟦 No user found');
            return;
        }

        //finds the user role on clerk metadata and checks to make sure it is admin
        const userRole = (user.publicMetadata as { role?: string })?.role;
        console.log('🟦 User role extracted:', userRole);

        if (userRole !== 'admin') {
            console.log('🟦 User is not admin. Role is:', userRole);
            return;
        }

        if (!process.env.NEXT_PUBLIC_ABLY_API_KEY) {
            console.error('🔴 NEXT_PUBLIC_ABLY_API_KEY is undefined!');
            console.log('🔴 All env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));
            return;
        }

        console.log('🟦 Creating Ably client...');

        try {
            //using the ably api the key and the client id are set which includes the clerkId
            const ablyClient = new Ably.Realtime({
                key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
                clientId: user.id,
            });

            console.log('🟦 Ably client created');

            //opens connection to ably and then sets the cleint to the previously created clientId
            ablyClient.connection.on('connected', () => {
                console.log('✅ Connected to Ably!');
            });

            ablyClient.connection.on('failed', (err) => {
                console.error('❌ Ably connection failed:', err);
            });

            setClient(ablyClient);
            console.log('🟦 Client set in state');
        } catch (error) {
            console.error('🔴 Error creating Ably client:', error);
        }
    }, [user, isLoaded]);

    console.log('🟦 Rendering with client:', !!client);

    if (!client) {
        // You could return a full-page loader here if you wanted.
        return null;
    }


    return (
        //wrapper that is later used in the main layout file.
        <AblyProvider client={client}>
            {children}
        </AblyProvider>
    );
}