import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferResponseType } from "hono"
import { client } from "@/lib/hono"
import { toast } from "sonner"

type ResponseType = InferResponseType<typeof client.api.interpreters[":id"]["rates"][":rateId"]["$delete"]>

export const useDeleteInterpreterRate = (interpreterId?: string, rateId?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.interpreters[":id"]["rates"][":rateId"]["$delete"]({
                param: { id: interpreterId!, rateId: rateId! }
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Interpreter rate deleted")
            queryClient.invalidateQueries({ queryKey: ["interpreter-rate", { interpreterId }] })
        },
        onError: () => {
            toast.error("Failed to delete rate")
        }
    })

    return mutation
}