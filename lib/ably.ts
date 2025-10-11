import Ably from 'ably';
import {channel} from "node:diagnostics_channel";

// Log immediately when file loads
console.log('[Ably Module] Loading, API Key exists:', !!process.env.ABLY_API_KEY);

//loads the api key using ably api
const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

//this opens the channel connection on ably for the admin. event and data are published
//
export async function publishAdminNotification(eventType: string, data: any) {
    console.log('[Ably] publishAdminNotification called with:', {
        eventType,
        data,
        keyExists: !!process.env.ABLY_API_KEY,
        keyPrefix: process.env.ABLY_API_KEY?.substring(0, 10) // Show first 10 chars
    });

    try {
        const channel = ably.channels.get('admin:notifications');
        const result = await channel.publish(eventType, data);
        console.log(`[Ably] Published successfully, result:`, result);
        return result;
    } catch (error) {
        console.error('[Ably] Failed to publish:', error);
        // Log the full error details
        if (error instanceof Error) {
            console.error('[Ably] Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
        throw error; // Re-throw to see if caller handles it
    }
}

export async function publishUserNotification(userId: string, eventType: string, data: any) {
    console.log(`[Ably] Publishing to user channel: user:${userId}`)

    try {
        const channel = ably.channels.get(`user:${userId}`)
        const result = await channel.publish(eventType, data)
        console.log(`[Ably] Published successfully to user:${userId}`, result)
        return result
    }catch (error) {
        console.error(`[Ably] Failed to publish to user:${userId}:`, error)
        throw error
    }

}