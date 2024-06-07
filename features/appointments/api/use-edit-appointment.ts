import {InferRequestType, InferResponseType} from "hono";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import {client} from "@/lib/hono";
import {toast} from "sonner";

// these types help to know the type of object that will be requested and returned
type ResponseType = InferResponseType<typeof client.api.appointments[':id']['$patch']>
//what the endpoint is expecting to be sent which needs the zValidator from the api accessed by json
type RequestType = InferRequestType<typeof client.api.appointments[':id']['$patch']>["json"]

export const useEditAppointment = (id?:string ) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    > ({
        //the mutation function is what is used to pass json and id
        mutationFn: async (json) => {
            const response = await client.api.appointments[':id']['$patch']({
                param: { id },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
             //refetch all patients when a new patient is created to update the cache through the queryKey
            toast.success('Appointment updated successfully')
            queryClient.invalidateQueries({ queryKey: ["apppointments"] })
            queryClient.invalidateQueries({ queryKey: ["appointment", { id }] });
        },
        onError: () => {
            toast.error('Failed to update appointment')
        }
    })

    return mutation
}