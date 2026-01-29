import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.billing.appointment[':id']['$patch']>
type RequestType = InferRequestType<typeof client.api.billing.appointment[':id']['$patch']>["json"]

export const useUpdateAppointmentBilling = (appointmentId?: string) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.billing.appointment[':id'].$patch({
                param: { id: appointmentId! },
                json
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success('Billing information updated')
            queryClient.invalidateQueries({ queryKey: ["appointment-billing", { appointmentId }] })
            queryClient.invalidateQueries({ queryKey: ["appointment", { id: appointmentId }] })
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] })
        },
        onError: () => {
            toast.error('Failed to update billing information')
        }
    })

    return mutation
}