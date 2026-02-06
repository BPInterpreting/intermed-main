import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type UpdateResponseType = InferResponseType<typeof client.api['patient-payers'][':id']['$patch']>
type UpdateRequestType = InferRequestType<typeof client.api['patient-payers'][':id']['$patch']>["json"]

export const useUpdatePatientPayer = (id?: string, patientId?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<UpdateResponseType, Error, UpdateRequestType>({
        mutationFn: async (json) => {
            const response = await client.api['patient-payers'][':id'].$patch({
                param: { id: id! },
                json,
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Payer assignment updated')
            queryClient.invalidateQueries({ queryKey: ["patient-payers", { patientId }] })
            queryClient.invalidateQueries({ queryKey: ["patient-payers-active", { patientId }] })
        },
        onError: () => {
            toast.error('Failed to update payer assignment')
        }
    })

    return mutation
}