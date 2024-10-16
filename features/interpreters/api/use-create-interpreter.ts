import {InferRequestType, InferResponseType} from "hono";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import {client} from "@/lib/hono";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.interpreters.$post>
type RequestType = InferRequestType<typeof client.api.interpreters.$post>["json"]

export const useCreateInterpreter = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    > ({
        mutationFn: async (json) => {
            const response = await client.api.interpreters.$post({ json })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Interpreter created successfully')
            queryClient.invalidateQueries({ queryKey: ["interpreters"] })
        },
        onError: () => {
            toast.error('Failed to create interpreter')
            console.error('Failed to create interpreter')
        }
    })

    return mutation
}