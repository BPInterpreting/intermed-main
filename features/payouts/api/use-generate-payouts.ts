import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.payouts.generate.$post>
type RequestType = InferRequestType<typeof client.api.payouts.generate.$post>["json"]

export const useGeneratePayouts = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.payouts.generate.$post({ json })
            return await response.json()
        },
        onSuccess: (data) => {
            toast.success('Payouts generated successfully')
            queryClient.invalidateQueries({ queryKey: ["payouts"] })
            queryClient.invalidateQueries({ queryKey: ["pending-payouts"] })
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] })
        },
        onError: () => {
            toast.error('Failed to generate payouts')
        }
    })

    return mutation
}