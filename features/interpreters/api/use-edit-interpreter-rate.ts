import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"
import { client } from "@/lib/hono"
import { toast } from "sonner"

type ResponseType = InferResponseType<typeof client.api.interpreters[":id"]["rates"][":rateId"]["$patch"]>
type RequestType = InferRequestType<typeof client.api.interpreters[":id"]["rates"][":rateId"]["$patch"]>["json"]

export const useEditInterpreterRate = (interpreterId?: string, rateId?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.interpreters[":id"]["rates"][":rateId"]["$patch"]({
                param: { id: interpreterId!, rateId: rateId! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Interpreter rate updated")
            queryClient.invalidateQueries({ queryKey: ["interpreter-rate", { interpreterId }] })
        },
        onError: () => {
            toast.error("Failed to update rate")
        }
    })

    return mutation
}