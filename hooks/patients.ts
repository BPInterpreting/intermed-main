import { InferRequestType, InferResponseType } from "hono";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

import { client } from "@/lib/hono";

//this is the RPC call to the server which is specificially for the form
const $post = client.api.patients.$post
type ResponseType = InferResponseType<typeof $post>
type RequestType = InferRequestType<typeof $post>["form"]

export const usePatients = () => {
    const queryClient= useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (form) => {
            const response = await $post({ form })
            return await response.json()
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["patients"] })
        },
        onError: (error) => {
            console.error(error)
        }
    })

    //another RPC call to get all of the patients
    const query = useQuery({
        queryKey: ["patients"],
        queryFn: async () => {
            const response = await client.api.patients.$get()
            return await response.json()
        }
    })

    return { mutation, query }
}