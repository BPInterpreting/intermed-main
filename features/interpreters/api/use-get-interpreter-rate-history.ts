import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetInterpreterRateHistory = (interpreterId?: string) => {
    const query = useQuery({
        enabled: !!interpreterId,
        queryKey: ['interpreter-rate-history', { interpreterId }],
        queryFn: async () => {
            const response = await client.api.interpreters[':id']['rates']['history'].$get({
                param: { id: interpreterId! }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch interpreter rate history')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}