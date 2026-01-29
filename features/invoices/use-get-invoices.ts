import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetInvoices = (filters?: {
    payerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}) => {
    const query = useQuery({
        queryKey: ['invoices', filters],
        queryFn: async () => {
            const response = await client.api.invoices.$get({
                query: {
                    payerId: filters?.payerId,
                    status: filters?.status,
                    startDate: filters?.startDate,
                    endDate: filters?.endDate,
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch invoices')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}