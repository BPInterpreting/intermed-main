import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.invoices[':id']['$delete']>

export const useDeleteInvoice = (id?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.invoices[':id'].$delete({
                param: { id: id! }
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Invoice deleted successfully')
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            queryClient.invalidateQueries({ queryKey: ["invoice", { id }] })
            queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] })
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
        },
        onError: () => {
            toast.error('Failed to delete invoice')
        }
    })

    return mutation
}