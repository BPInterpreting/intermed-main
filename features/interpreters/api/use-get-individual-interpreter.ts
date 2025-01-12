import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useGetIndividualInterpreter = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ['interpreter', {id}],
        queryFn: async () => {
            const response = await client.api.interpreters[':id'].$get({
                param: { id }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch interpreter')
            }

            const { data } = await response.json()
            return data;
        }
    })
    return query
}