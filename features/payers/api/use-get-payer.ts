import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetPayer = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ['payer', { id }],
        queryFn: async () => {
            const response = await client.api.payers[':id'].$get({
                param: { id: id! }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch payer')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}