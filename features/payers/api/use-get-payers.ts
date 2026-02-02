import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetPayers = (activeOnly?: boolean) => {
    const query = useQuery({
        queryKey: ['payers', { activeOnly }],
        queryFn: async () => {
            const response = await client.api.payers.$get({
                query: { 
                    activeOnly: activeOnly ? 'true' : undefined 
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch payers')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}