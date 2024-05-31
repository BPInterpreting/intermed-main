import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetSinglePatient = (id?: string) => {
    //define the query
    const query = useQuery({
        enabled: !!id,
        //queryKey is the name of the data stored in cache to be reused later again instead or parsing data all over again
        queryKey: ['patient', { id }],
         //queryFn is function that query will use to request data as promise which resloves data or a throws error if it fails
        queryFn: async () => {
            const response = await client.api.patients[":id"].$get({
                param: { id }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch patient')
            }

            //destructure the data object from the response
            const { data } = await response.json()
            return data;
        }
    })
    return query
}