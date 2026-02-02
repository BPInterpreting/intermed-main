import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.payers[':id']['$delete']>

export const useDeletePayer = (id?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.payers[':id'].$delete({
                param: { id: id! }
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Payer deactivated successfully')
            queryClient.invalidateQueries({ queryKey: ["payers"] })
            queryClient.invalidateQueries({ queryKey: ["payer", { id }] })
        },
        onError: () => {
            toast.error('Failed to deactivate payer')
        }
    })

    return mutation
}