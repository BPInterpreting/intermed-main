import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.invoices.preview.$post>
type RequestType = InferRequestType<typeof client.api.invoices.preview.$post>["json"]

export const usePreviewInvoice = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.invoices.preview.$post({ json })
            return await response.json()
        },
        onError: () => {
            toast.error('Failed to preview invoice')
        }
    })

    return mutation
}