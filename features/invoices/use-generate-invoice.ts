import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.invoices.generate.$post>
type RequestType = InferRequestType<typeof client.api.invoices.generate.$post>["json"]

export const useGenerateInvoice = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.invoices.generate.$post({ json })
            return await response.json()
        },
        onSuccess: (data) => {
            toast.success('Invoice generated successfully')
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] })
        },
        onError: () => {
            toast.error('Failed to generate invoice')
        }
    })

    return mutation
}