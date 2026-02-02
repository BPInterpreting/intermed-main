import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.payers[':id']['$patch']>
type RequestType = InferRequestType<typeof client.api.payers[':id']['$patch']>["json"]

export const useUpdatePayer = (id?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.payers[':id'].$patch({
                param: { id: id! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Payer updated successfully')
            queryClient.invalidateQueries({ queryKey: ["payers"] })
            queryClient.invalidateQueries({ queryKey: ["payer", { id }] })
        },
        onError: () => {
            toast.error('Failed to update payer')
        }
    })

    return mutation
}