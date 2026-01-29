import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.invoices[':id']['record-payment']['$post']>
type RequestType = InferRequestType<typeof client.api.invoices[':id']['record-payment']['$post']>["json"]

export const useRecordInvoicePayment = (id?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.invoices[':id']['record-payment'].$post({
                param: { id: id! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Payment recorded successfully')
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            queryClient.invalidateQueries({ queryKey: ["invoice", { id }] })
            queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] })
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
        },
        onError: () => {
            toast.error('Failed to record payment')
        }
    })

    return mutation
}