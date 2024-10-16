import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.interpreters[':id']['$patch']>
type RequestType = InferRequestType<typeof client.api.interpreters[':id']['$patch']>["json"]

export const useEditInterpreter = (id: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            const response = await client.api.interpreters[':id']['$patch']({
                param: { id },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Interpreter updated successfully')
            queryClient.invalidateQueries({ queryKey: ["interpreters"] })
            queryClient.invalidateQueries({ queryKey: ["interpreters", { id }] });
        },
        onError: () => {
            toast.error('Failed to update interpreter')
            console.error('Failed to update interpreter')
        }
    })

    return mutation
}