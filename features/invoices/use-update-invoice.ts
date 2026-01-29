import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.invoices[':id']['$patch']>
type RequestType = InferRequestType<typeof client.api.invoices[':id']['$patch']>["json"]

export const useUpdateInvoice = (id?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.invoices[':id'].$patch({
                param: { id: id! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Invoice updated successfully')
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            queryClient.invalidateQueries({ queryKey: ["invoice", { id }] })
        },
        onError: () => {
            toast.error('Failed to update invoice')
        }
    })

    return mutation
}