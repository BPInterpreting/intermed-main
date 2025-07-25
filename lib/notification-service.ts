/*
* reusable notification service to get push token from database, send notification to expo push service
* handle errors and provide debugging logs
* */

import { db } from '@/db/drizzle'
import { interpreter } from "@/db/schema";
import { eq } from 'drizzle-orm'
import axios from 'axios'

//interface for the actual notification
interface NotificationData {
    appointmentId: string
    type: 'appointment_assigned' | 'appointment_updated' | 'appointment_removed'
    title: string
    body: string
    data?: Record<string, any>
}

//data details that appear on the banner based on what data is given
interface AppointmentDetails {
    id: string
    date: string | Date
    startTime: string
    facility?: {
        name: string
        address: string
    }
    patient?: {
        firstName: string
        lastName: string
    }
    appointmentType?: string | null
    notes?: string | null
}

export async function sendNotificationtoInterpreter(
    interpreterId: string,
    notificationData: NotificationData
) {

    console.log(`[Notifications] Sending notification to interpreterId: ${interpreterId}`)

    try {
        const [interpreterData] = await db
            .select({
                id: interpreter.id,
                firstName: interpreter.firstName,
                lastName: interpreter.lastName,
                expoPushToken: interpreter.expoPushToken,
            })
            .from(interpreter)
            .where(eq(interpreter.id, interpreterId))
            .limit(1)

        if (!interpreterData) {
            console.log(`[Notifications] No interpreter found with ID ${interpreterId}]`)
            return { success: false, error: 'No interpreter found'}
        }

        if (!interpreterData.expoPushToken) {
            console.log(`[Notifications] No push token for interpreter: ${interpreterId}`);
            return { success: false, error: 'No push token available' };
        }

        //prepares the notification message
        const message = {
            to:interpreterData.expoPushToken,
            sound: 'default',
            title: notificationData.title,
            body: notificationData.body,
            data: {
                appointmentId: notificationData.appointmentId,
                type: notificationData.type,
                ...notificationData.data
            },
            // iOS specific
            ios: {
                badge: 1,
                sound: 'default',
            },
            // Android specific
            android: {
                channelId: 'default',
                priority: 'high',
            },
        }

        console.log(`[Notifications] Sending to Expo:`, {
            to: interpreterData.expoPushToken.substring(0, 20) + '...',
            title: message.title,
            body: message.body
        });

        //send message to expo push service
        const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
        });
        console.log(`[Notifications] Expo response:`, response.data);

        if (response.status === 200) {
            console.log(`[Notifications] Successfully sent to ${interpreterData.firstName} ${interpreterData.lastName}`);
            return { success: true, data: response.data };
        } else {
            console.error(`[Notifications] Expo API error:`, response.data);
            return { success: false, error: 'Failed to send notification', details: response.data };
        }
    } catch (e) {
        console.error(`[Notifications] Failed to send notification: ${e}`);

        if (axios.isAxiosError(e)) {
            const axiosError = e.response?.data || e.message;
            return { success: false, error: 'Axios error', details: axiosError };
        }

        return { success: false, error: 'Network or server error', details: e };
    }
}

//helper function to create the notification content
export function createAppointmentNotification(
    type: 'assigned' | 'updated' | 'removed',
    appointmentDetails: AppointmentDetails
): Pick<NotificationData, 'title' | 'body' | 'data'> {

    const appointmentDate = appointmentDetails.date instanceof Date
        ? appointmentDetails.date
        : new Date(appointmentDetails.date);

    const date = new Date(appointmentDetails.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const time = new Date(`2000-01-01T${appointmentDetails.startTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const facilityName = appointmentDetails.facility?.name || 'Medical Facility';
    const patientName = appointmentDetails.patient
        ? `${appointmentDetails.patient.firstName} ${appointmentDetails.patient.lastName}`
        : 'Patient';

    const appointmentType = appointmentDetails.appointmentType || 'medical'

    switch (type) {
        case 'assigned':
            return {
                title: 'New Appointment Assigned! 📅',
                body: `You have been assigned a ${appointmentDetails.appointmentType || 'medical'} interpretation appointment at ${facilityName} on ${date} at ${time}`,
                data: {
                    date: appointmentDetails.date,
                    startTime: appointmentDetails.startTime,
                    facility: facilityName,
                    facilityAddress: appointmentDetails.facility?.address,
                    appointmentType: appointmentType,
                    patientName: patientName
                }
            };

        case 'updated':
            return {
                title: 'Appointment Updated ✏️',
                body: `Your appointment at ${facilityName} has been updated. New time: ${date} at ${time}`,
                data: {
                    date: appointmentDetails.date,
                    startTime: appointmentDetails.startTime,
                    facility: facilityName,
                    facilityAddress: appointmentDetails.facility?.address,
                    appointmentType: appointmentType,
                    patientName: patientName
                }
            };

        case 'removed':
            return {
                title: 'Appointment Removed ❌',
                body: `Your appointment at ${facilityName} on ${date} has been removed.`,
                data: {
                    date: appointmentDetails.date,
                    facility: facilityName,
                    originalStartTime: appointmentDetails.startTime
                }
            };

        default:
            return {
                title: 'Appointment Notification',
                body: `You have an appointment notification.`,
                data: {}
            };
    }
}
