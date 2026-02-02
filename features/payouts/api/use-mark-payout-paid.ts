import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.payouts[':id']['mark-paid']['$post']>
type RequestType = InferRequestType<typeof client.api.payouts[':id']['mark-paid']['$post']>["json"]

export const useMarkPayoutPaid = (id?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.payouts[':id']['mark-paid'].$post({
                param: { id: id! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Payout marked as paid')
            queryClient.invalidateQueries({ queryKey: ["payouts"] })
            queryClient.invalidateQueries({ queryKey: ["payout", { id }] })
            queryClient.invalidateQueries({ queryKey: ["pending-payouts"] })
            queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] })
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
        },
        onError: () => {
            toast.error('Failed to mark payout as paid')
        }
    })

    return mutation
}