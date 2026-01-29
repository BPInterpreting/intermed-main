import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetBillingDashboard = (filters?: {
    startDate?: string;
    endDate?: string;
}) => {
    const query = useQuery({
        queryKey: ['billing-dashboard', filters],
        queryFn: async () => {
            const response = await client.api.billing.dashboard.$get({
                query: {
                    startDate: filters?.startDate,
                    endDate: filters?.endDate,
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch billing dashboard')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}