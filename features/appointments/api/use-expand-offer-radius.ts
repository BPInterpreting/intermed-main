// use-expand-offer-radius.ts
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.appointments.offers[':appointmentId']['expand']['$post']>
// No request body needed for this endpoint, just the param
type ParamType = { appointmentId: string }

export const useExpandOfferRadius = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
    ResponseType,
        Error,
    ParamType
    >({
        mutationFn: async ({ appointmentId } ) => {
            const response = await client.api.appointments.offers[':appointmentId']['expand']['$post']({
                param: { appointmentId }
            });

            if (!response.ok) {
                throw new Error('Failed to expand radius');
            }

            return await response.json();
        },
        onSuccess: (data, { appointmentId }) => {
            queryClient.invalidateQueries({ queryKey: ['offer', { id: appointmentId }] });
            queryClient.invalidateQueries({ queryKey: ['offers'] });

            if ('newInterpretersNotified' in data && typeof data.newInterpretersNotified === 'number') {
                if (data.newInterpretersNotified > 0) {
                    toast.success(`Notified ${data.newInterpretersNotified} additional interpreters within 50 miles`);
                } else {
                    toast.info('Radius expanded, but no additional interpreters found');
                }
            }
        },
        onError: () => {
            toast.error('Failed to expand offer radius');
        }
    });

    return mutation;
};