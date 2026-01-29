import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useCalculateBilling = (appointmentId?: string) => {
    const query = useQuery({
        enabled: !!appointmentId,
        queryKey: ['calculate-billing', { appointmentId }],
        queryFn: async () => {
            const response = await client.api.billing.calculate[':id'].$get({
                param: { id: appointmentId! }
            })

            if (!response.ok) {
                throw new Error('Failed to calculate billing')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}

