import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export const useGetPatientPayers = (patientId?: string) => {
    const query = useQuery({
        enabled: !!patientId,
        queryKey: ['patient-payers', { patientId }],
        queryFn: async () => {
            const response = await client.api['patient-payers'].patient[':patientId'].$get({
                param: { patientId: patientId! }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch patient payers')
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}