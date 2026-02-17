import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetInvoice = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ['invoice', { id }],
        queryFn: async () => {
            const response = await client.api.invoices[':id'].$get({
                param: { id: id! }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch invoice')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}