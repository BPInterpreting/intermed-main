import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.payers[':id']['rates']['$post']>
type RequestType = InferRequestType<typeof client.api.payers[':id']['rates']['$post']>["json"]

export const useCreatePayerRate = (payerId?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.payers[':id']['rates'].$post({
                param: { id: payerId! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Language rate added successfully')
            queryClient.invalidateQueries({ queryKey: ["payer", { id: payerId }] })
        },
        onError: () => {
            toast.error('Failed to add language rate')
        }
    })

    return mutation
}