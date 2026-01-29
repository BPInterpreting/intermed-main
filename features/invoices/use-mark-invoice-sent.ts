import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.invoices[':id']['mark-sent']['$post']>
type RequestType = InferRequestType<typeof client.api.invoices[':id']['mark-sent']['$post']>["json"]

export const useMarkInvoiceSent = (id?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.invoices[':id']['mark-sent'].$post({
                param: { id: id! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Invoice marked as sent')
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            queryClient.invalidateQueries({ queryKey: ["invoice", { id }] })
            queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] })
        },
        onError: () => {
            toast.error('Failed to mark invoice as sent')
        }
    })

    return mutation
}