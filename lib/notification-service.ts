/*
* reusable notification service to get push token from database, send notification to expo push service
* handle errors and provide debugging logs
* FIXED: Replaced axios with fetch for Cloudflare Workers compatibility
* */

import { db } from '@/db/drizzle'
import {appointmentOffers, interpreter} from "@/db/schema";
import {and, eq, isNull, sql} from 'drizzle-orm'

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
            to: interpreterData.expoPushToken,
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

        // FIXED: Replace axios with fetch - COMPLETE IMPLEMENTATION
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const responseData = await response.json();
        console.log(`[Notifications] Expo response:`, responseData);

        if (response.ok) {
            console.log(`[Notifications] Successfully sent to ${interpreterData.firstName} ${interpreterData.lastName}`);
            return { success: true, data: responseData };
        } else {
            console.error(`[Notifications] Expo API error:`, responseData);
            return { success: false, error: 'Failed to send notification', details: responseData };
        }

    } catch (e) {
        console.error(`[Notifications] Failed to send notification: ${e}`);
        return { success: false, error: 'Network or server error', details: e };
    }
}

//helper function to create the notification content
export function createAppointmentNotification(
    type: 'assigned' | 'updated' | 'removed',
    appointmentDetails: AppointmentDetails
): Pick<NotificationData, 'title' | 'body' | 'data'> {

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

// this function is to send the notification offer to the interpreter
export async function sendOfferNotification(
    appointment: any,
    interpreters: any[]
) {
    console.log(`[Notifications] Sending offer notifications for appointment ${appointment.id} to ${interpreters.length} interpreters`)

    const results = []

    for (const interpreter of interpreters) {
        if (!interpreter.expoPushToken) {
            console.log(`[Notifications] Skipping interpreter ${interpreter.id} - no push token`)
            continue
        }

        try {
            const message = {
                to: interpreter.expoPushToken,
                sound: 'default',
                title: '🆕 New Appointment Available!',
                body: `${appointment.appointmentType || 'Medical'} interpretation needed on ${new Date(appointment.date).toLocaleDateString()}`,
                data: {
                    appointmentId: appointment.id,
                    type: 'new_offer',
                    isRushAppointment: appointment.isRushAppointment,
                    distance: interpreter.distance
                },
                ios: {
                    badge: 1,
                    sound: 'default',
                },
                android: {
                    channelId: 'default',
                    priority: 'high',
                },
            }

            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            })

            const responseData = await response.json()

            if (response.ok) {
                console.log(`[Notifications] Sent to interpreter ${interpreter.id}`)
                results.push({ interpreterId: interpreter.id, success: true })
            } else {
                console.error(`[Notifications] Failed for interpreter ${interpreter.id}:`, responseData)
                results.push({ interpreterId: interpreter.id, success: false, error: responseData })
            }

        } catch (error) {
            console.error(`[Notifications] Error sending to interpreter ${interpreter.id}:`, error)
            results.push({ interpreterId: interpreter.id, success: false, error })
        }
    }

    console.log(`[Notifications] Sent ${results.filter(r => r.success).length}/${interpreters.length} notifications successfully`)
    return results
}

// Optional: Add function to notify when offer is taken
export async function notifyOfferTaken(appointmentId: string, acceptedByInterpreterId: string) {
    // Query all other interpreters who were offered this appointment
    const offeredInterpreters = await db
        .select({
            interpreterId: appointmentOffers.interpreterId,
            token: interpreter.expoPushToken
        })
        .from(appointmentOffers)
        .innerJoin(interpreter, eq(appointmentOffers.interpreterId, interpreter.id))
        .where(
            and(
                eq(appointmentOffers.appointmentId, appointmentId),
                sql`${appointmentOffers.interpreterId} != ${acceptedByInterpreterId}`,
                isNull(appointmentOffers.response)
            )
        )

    // Send "no longer available" notification to each
    for (const interp of offeredInterpreters) {
        if (interp.token) {
            // Send notification that appointment is no longer available
            // You can implement this similar to above
                    const message = {
                        to: interp.token,
                        sound: 'default',
                        title: 'Appointment No Longer Available',
                        body: 'Appointment Accepted By Another Interpreter',
                        data: {
                            appointmentId: appointmentId,
                            type: 'offer_taken'
                        },
                        ios: {
                            badge: 1,
                            sound: 'default',
                        },
                        android: {
                            channelId: 'default',
                            priority: 'high',
                        }
                    }
                    try {
                        await fetch('https://exp.host/--/api/v2/push/send', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Accept-encoding': 'gzip, deflate',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(message),
                        })

                        console.log(`[Notifications] Notified ${interp.interpreterId} that offer was taken`)
                    } catch (error) {
                        console.error(`[Notifications] Failed to notify interpreter ${interp.interpreterId}:`, error)
                    }
        }
    }
}

