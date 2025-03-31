import { InferRequestType, InferResponseType } from "hono";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import { client } from "@/lib/hono";
import {toast} from "sonner";

// these types help to know the type of object that will be requested and returned
type ResponseType = InferResponseType<typeof client.api.followUpRequests.$post>
//what the endpoint is expecting to be sent which needs the zValidator from the api accessed by json
type RequestType = InferRequestType<typeof client.api.followUpRequests.$post>["json"]

export const useCreateFollowUpRequest = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    > ({
        //the mutation function is what is used to pass json
        mutationFn: async (json) => {
            const response = await client.api.followUpRequests.$post({ json })
            return await response.json()
        },
        onSuccess: () => {
             //refetch all patients when a new patient is created to update the cache through the queryKey
            toast.success('Follow up request created successfully')
            queryClient.invalidateQueries({ queryKey: ["followUpRequests"] })
        },
        onError: () => {
            toast.error('Failed to create follow up request')
        }
    })

    return mutation
}