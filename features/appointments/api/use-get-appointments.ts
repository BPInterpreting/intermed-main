//hook is used to fetch multiple facilities from the database that will be used to display the data in the UI

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import {useSearchParams} from "next/navigation";

export const useGetAppointments = () => {
    // const params =  useSearchParams()
    // const from = params.get('from') || ''
    // const to = params.get('to') || ''
    // const patientId = params.get('patientId') || ''

    //define the query
    const query = useQuery({

        //queryKey is the name of the data stored in cache to be reused later again instead or parsing data all over again
        queryKey: ['appointments'],
         //queryFn is function that query will use to request data as promise which resloves data or a throws error if it fails
        queryFn: async () => {
            const response = await client.api.appointments.$get({
                query: {
                    patientId: undefined,
                    endTime: undefined
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch appointments')
            }

            //destructure the data object from the response
            const { data } = await response.json()
            return data;
        }
    })
    return query
}