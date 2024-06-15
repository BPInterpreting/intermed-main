import {InferResponseType} from "hono";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import {client} from "@/lib/hono";
import {toast} from "sonner";

// only the ResponseType is needed to delete
type ResponseType = InferResponseType<typeof client.api.appointments[":id"]["$delete"]>;

export const useDeleteAppointment = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
      ResponseType,
      Error
  >({
      mutationFn: async () => {
          //only relying on the param object to pass the idand delete the account
          const response = await client.api.appointments[":id"]["$delete"]({
                param: { id },
          })
          return await response.json();

      },
      onSuccess: () => {
          //refetch all appointments after creating a new account
          toast.success("Appointment deleted successfully");
          //primary update account with id as key and all appointments
          queryClient.invalidateQueries({ queryKey: ["appointment", { id }] });
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
      },
      onError: () => {
          toast.error("Failed to delete appontment");
      }
  });

  return mutation;
};