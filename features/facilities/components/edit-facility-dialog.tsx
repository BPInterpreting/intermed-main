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

const formSchema  = insertFacilitySchema.omit({
    id: true,
})

type FormValues = z.input<typeof formSchema>

export const EditFacilityDialog = () => {
    const {isOpen, onClose, id} = useUpdateFacility()
    const editMutation = useEditFacility(id)

    const mutation = useCreateFacility()

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

     return(
         <Dialog open={isOpen} onOpenChange={onClose}>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>Edit Facility Form</DialogTitle>
                     <DialogDescription>
                         Fill out details to edit facility.
                     </DialogDescription>
                 </DialogHeader>
                 <FacilityForm
                     id={id}
                     onSubmit={onSubmit}
                     disabled={mutation.isPending}
                     defaultValues={{name: ''}}
                 />
             </DialogContent>
         </Dialog>
     )
}