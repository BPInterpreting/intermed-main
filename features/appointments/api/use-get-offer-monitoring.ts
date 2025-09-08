import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useGetOfferMonitoring =  () => {
    const query = useQuery({
        queryKey: ['offer-monitoring'],
        queryFn: async () => {
            const response = await client.api.appointments.offers.monitoring.$get()

            if (!response.ok) {
                throw new Error('Failed to get offer monitoring data');
            }

            const { data } = await response.json();
            return data
        },
    })

    return query
}