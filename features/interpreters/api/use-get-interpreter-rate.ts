import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetInterpreterRate = (interpreterId?: string) => {
    const query = useQuery({
        enabled: !!interpreterId,
        queryKey: ['interpreter-rate', { interpreterId }],
        queryFn: async () => {
            const response = await client.api.interpreters[':id']['rates'].$get({
                param: { id: interpreterId! }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch interpreter rate')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}