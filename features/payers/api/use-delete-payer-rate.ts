import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.payers[':id']['rates'][':rateId']['$delete']>

export const useDeletePayerRate = (payerId?: string, rateId?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.payers[':id']['rates'][':rateId'].$delete({
                param: { id: payerId!, rateId: rateId! }
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Language rate deleted successfully')
            queryClient.invalidateQueries({ queryKey: ["payer", { id: payerId }] })
        },
        onError: () => {
            toast.error('Failed to delete language rate')
        }
    })

    return mutation
}
