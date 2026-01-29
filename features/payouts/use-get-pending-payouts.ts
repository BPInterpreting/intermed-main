import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetPendingPayouts = () => {
    const query = useQuery({
        queryKey: ['pending-payouts'],
        queryFn: async () => {
            const response = await client.api.payouts.pending.$get()

            if (!response.ok) {
                throw new Error('Failed to fetch pending payouts')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}