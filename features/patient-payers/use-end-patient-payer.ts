import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type EndResponseType = InferResponseType<typeof client.api['patient-payers'][':id']['end']['$post']>
type EndRequestType = InferRequestType<typeof client.api['patient-payers'][':id']['end']['$post']>["json"]

export const useEndPatientPayer = (id?: string, patientId?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<EndResponseType, Error, EndRequestType>({
        mutationFn: async (json) => {
            const response = await client.api['patient-payers'][':id'].end.$post({
                param: { id: id! },
                json,
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Payer assignment ended')
            queryClient.invalidateQueries({ queryKey: ["patient-payers", { patientId }] })
            queryClient.invalidateQueries({ queryKey: ["patient-payers-active", { patientId }] })
        },
        onError: () => {
            toast.error('Failed to end payer assignment')
        }
    })

    return mutation
}












