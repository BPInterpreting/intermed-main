import {InferRequestType, InferResponseType} from "hono";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import {client} from "@/lib/hono";
import {toast} from "sonner";


// only response type is needed to delete a patient
type ResponseType = InferResponseType<typeof client.api.patients[':id']['$delete']>



export const useDeletePatient = (id:string ) => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error
    > ({
        //the mutation function is what is used to pass json and id
        mutationFn: async () => {
            const response = await client.api.patients[':id']['$delete']({
                param: { id },
            })
            return await response.json()
        },
        onSuccess: () => {
             //refetch all patients when a new patient is created to update the cache through the queryKey
            toast.success('Patient deleted successfully')
            queryClient.invalidateQueries({ queryKey: ["patients"] })
            queryClient.invalidateQueries({ queryKey: ["patients", { id }] });
        },
        onError: () => {
            toast.error('Failed to delete patient')
        }
    })

    return mutation
}