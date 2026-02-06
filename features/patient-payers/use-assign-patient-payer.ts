import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api['patient-payers']['$post']>
type RequestType = InferRequestType<typeof client.api['patient-payers']['$post']>["json"]

export const useAssignPatientPayer = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api['patient-payers'].$post({ json })
            return await response.json()
        },
        onSuccess: (_, variables) => {
            toast.success('Payer assigned successfully')
            queryClient.invalidateQueries({ queryKey: ["patient-payers", { patientId: variables.patientId }] })
            queryClient.invalidateQueries({ queryKey: ["patient-payers-active", { patientId: variables.patientId }] })
        },
        onError: () => {
            toast.error('Failed to assign payer')
        }
    })

    return mutation
}
