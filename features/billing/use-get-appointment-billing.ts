import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetAppointmentBilling = (appointmentId?: string) => {
    const query = useQuery({
        enabled: !!appointmentId,
        queryKey: ['appointment-billing', { appointmentId }],
        queryFn: async () => {
            const response = await client.api.billing.appointment[':id'].$get({
                param: { id: appointmentId! }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch appointment billing')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}