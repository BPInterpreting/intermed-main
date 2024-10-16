import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useGetInterpreters = () => {
    const query = useQuery({
        queryKey: ['interpreters'],
        queryFn: async () => {
            const response = await client.api.interpreters.$get()

            if (!response.ok) {
                throw new Error('Failed to fetch interpreters')
            }

            const { data } = await response.json()
            return data;
        }
    })
    return query
}