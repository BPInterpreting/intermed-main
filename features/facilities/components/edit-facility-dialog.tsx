'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"

import {useNewFacility} from "@/features/facilities/hooks/use-new-facility";
import {PatientForm} from "@/features/patients/components/patientForm";
import {insertFacilitySchema} from "@/db/schema";
import {useCreateFacility} from "@/features/facilities/api/use-create-facility";
import {FacilityForm} from "@/features/facilities/components/facilityForm";
import {useUpdateFacility} from "@/features/facilities/hooks/use-update-facility";
import {useEditFacility} from "@/features/facilities/api/use-edit-facility";
import {useGetIndividualFacility} from "@/features/facilities/api/use-get-individual-facility";
import {useDeleteFacility} from "@/features/facilities/api/use-delete-facility";
import {useConfirm} from "@/hooks/use-confirm";
import {Loader2} from "lucide-react";

const formSchema  = insertFacilitySchema.omit({
    id: true,
    // name: true,
    // address: true,
    // longitude: true,
    // latitude: true,
    // email: true,
    // phoneNumber: true,
    // facilityType: true,
    // operatingHours: true,
    // averageWaitTime: true,
})

type FormValues = z.input<typeof formSchema>

export const EditFacilityDialog = () => {
    const {isOpen, onClose, id} = useUpdateFacility()
    const editMutation = useEditFacility(id ?? '')
    const facilityQuery = useGetIndividualFacility(id)
    const deleteMutation = useDeleteFacility(id ?? '')


    const isPending = editMutation.isPending || deleteMutation.isPending

    const isLoading = facilityQuery.isLoading

    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure you want to delete this facility?',
        "You are about to delete a facility. This action cannot be undone."
    )

    const defaultValues = facilityQuery.data ? {
        name: facilityQuery.data.name,
        address: facilityQuery.data.address,
        longitude: facilityQuery.data.longitude ? parseFloat(facilityQuery.data.longitude) : 0,
        latitude: facilityQuery.data.latitude ? parseFloat(facilityQuery.data.latitude) : 0,
        email: facilityQuery.data.email ?? undefined,
        phoneNumber: facilityQuery.data.phoneNumber ?? undefined,
        facilityType: facilityQuery.data.facilityType,
        operatingHours: facilityQuery.data.operatingHours,
        averageWaitTime: facilityQuery.data.averageWaitTime,
    } : {
        name: '',
        address: '',
        longitude: 0,
        latitude: 0,
        email: '',
        phoneNumber: '',
        facilityType: '',
        operatingHours: '',
        averageWaitTime: '',
    }

    const onDelete = async () => {
        const ok = await confirm()

        if(ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose()
                }
            })
        }
    }

    const onSubmit = (values: FormValues) => {
        editMutation.mutate({
            ...values,
            longitude: values.longitude.toString(),
            latitude: values.latitude.toString(),
        }, {
            onSuccess: () => {
                onClose()
            }
        })
    }

     return (
         <>
             <ConfirmDialog />
             <Dialog open={isOpen} onOpenChange={onClose}>
                 <DialogContent>
                     <DialogHeader>
                         <DialogTitle>Edit Facility Form</DialogTitle>
                         <DialogDescription>
                             Fill out details to edit facility.
                         </DialogDescription>
                     </DialogHeader>
                     {
                         isLoading ? (
                             <div className='absolute inset-0 flex items-center justify-center'>
                                 <Loader2 className='size-4 text-muted-foreground animate-spin' />
                             </div>
                         ) : (
                             <div className='flex-col'>
                                     <FacilityForm
                                         id={id}
                                         onSubmit={onSubmit}
                                         disabled={isPending}
                                         defaultValues={defaultValues}
                                         onDelete={onDelete}
                                     />
                             </div>

                         )
                     }
                 </DialogContent>
             </Dialog>
         </>
     )
}