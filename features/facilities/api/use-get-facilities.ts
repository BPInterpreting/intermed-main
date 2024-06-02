//hook is used to fetch multiple facilities from the database that will be used to display the data in the UI

import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetFacilities = () => {
    //define the query
    const query = useQuery({
        //queryKey is the name of the data stored in cache to be reused later again instead or parsing data all over again
        queryKey: ['facilities'],
         //queryFn is function that query will use to request data as promise which resloves data or a throws error if it fails
        queryFn: async () => {
            const response = await client.api.facilities.$get()

            if (!response.ok) {
                throw new Error('Failed to fetch facilities')
            }

            //destructure the data object from the response
            const { data } = await response.json()
            return data;
        }
    })
    return query
}