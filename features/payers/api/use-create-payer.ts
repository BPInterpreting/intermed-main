import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.payers.$post>
type RequestType = InferRequestType<typeof client.api.payers.$post>["json"]

export const useCreatePayer = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.payers.$post({ json })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Payer created successfully')
            queryClient.invalidateQueries({ queryKey: ["payers"] })
        },
        onError: () => {
            toast.error('Failed to create payer')
        }
    })

    return mutation
}