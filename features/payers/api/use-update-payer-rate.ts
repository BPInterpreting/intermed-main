import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.payers[':id']['rates'][':rateId']['$patch']>
type RequestType = InferRequestType<typeof client.api.payers[':id']['rates'][':rateId']['$patch']>["json"]

export const useUpdatePayerRate = (payerId?: string, rateId?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.payers[':id']['rates'][':rateId'].$patch({
                param: { id: payerId!, rateId: rateId! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Language rate updated successfully')
            queryClient.invalidateQueries({ queryKey: ["payer", { id: payerId }] })
        },
        onError: () => {
            toast.error('Failed to update language rate')
        }
    })

    return mutation
}