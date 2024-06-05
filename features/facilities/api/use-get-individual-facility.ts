//hook is used to fetch multiple facilities from the database that will be used to display the data in the UI

import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';



export const useGetIndividualFacility = (id?: string) => {

    //define the query
    const query = useQuery({
        //query is only fetched if we have the id so automatic refetching is disabled meaning that if dialog is closed the data will not be refetched
        enabled: !!id,
        //queryKey is the name of the data stored in cache to be reused later again instead or parsing data all over again
        queryKey: ['facility', {id}],
         //queryFn is function that query will use to request data as promise which resloves data or a throws error if it fails
        queryFn: async () => {
            const response = await client.api.facilities[':id'].$get({
                param: { id }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch facility')
            }

            //destructure the data object from the response
            const { data } = await response.json()
            return data;
        }
    })
    return query
}