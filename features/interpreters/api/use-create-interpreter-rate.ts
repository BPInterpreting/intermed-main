import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"
import { client } from "@/lib/hono"
import { toast } from "sonner"

type ResponseType = InferResponseType<typeof client.api.interpreters[":id"]["rates"]["$post"]>
type RequestType = InferRequestType<typeof client.api.interpreters[":id"]["rates"]["$post"]>["json"]

export const useCreateInterpreterRate = (interpreterId?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.interpreters[":id"]["rates"]["$post"]({
                param: { id: interpreterId! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Interpreter rate created")
            queryClient.invalidateQueries({ queryKey: ["interpreter-rate", { interpreterId }] })
        },
        onError: () => {
            toast.error("Failed to create rate")
        }
    })

    return mutation
}