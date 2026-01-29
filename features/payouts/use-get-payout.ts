import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetPayout = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ['payout', { id }],
        queryFn: async () => {
            const response = await client.api.payouts[':id'].$get({
                param: { id: id! }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch payout')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}