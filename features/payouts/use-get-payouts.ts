import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetPayouts = (filters?: {
    interpreterId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}) => {
    const query = useQuery({
        queryKey: ['payouts', filters],
        queryFn: async () => {
            const response = await client.api.payouts.$get({
                query: {
                    interpreterId: filters?.interpreterId,
                    status: filters?.status,
                    startDate: filters?.startDate,
                    endDate: filters?.endDate,
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch payouts')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}