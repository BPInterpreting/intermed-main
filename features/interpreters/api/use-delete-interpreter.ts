import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {client} from "@/lib/hono";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.interpreters[':id']['$delete']>

export const useDeleteInterpreter = (id: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error
    > ({
        mutationFn: async () => {
            const response = await client.api.interpreters[':id']['$delete']({
                param: { id },
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Interpreter deleted successfully')
            queryClient.invalidateQueries({ queryKey: ["interpreters"] })
            queryClient.invalidateQueries({ queryKey: ["interpreter", { id }] });
        },
        onError: () => {
            toast.error('Failed to delete interpreter')
        }
    })
    return mutation
}
