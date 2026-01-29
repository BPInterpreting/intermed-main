import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.payouts[':id']['$patch']>
type RequestType = InferRequestType<typeof client.api.payouts[':id']['$patch']>["json"]

export const useUpdatePayout = (id?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.payouts[':id'].$patch({
                param: { id: id! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Payout updated successfully')
            queryClient.invalidateQueries({ queryKey: ["payouts"] })
            queryClient.invalidateQueries({ queryKey: ["payout", { id }] })
            queryClient.invalidateQueries({ queryKey: ["pending-payouts"] })
        },
        onError: () => {
            toast.error('Failed to update payout')
        }
    })

    return mutation
}