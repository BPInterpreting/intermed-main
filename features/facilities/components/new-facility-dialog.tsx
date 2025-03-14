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

const formSchema  = insertFacilitySchema.pick({
    name: true,
    address: true,
    longitude: true,
    latitude: true,
    email: true,
    phoneNumber: true,
    facilityType: true,
    operatingHours: true,
    averageWaitTime: true,
})

type FormValues = z.input<typeof formSchema>

export const NewFacilityDialog = () => {
    const {isOpen, onClose} = useNewFacility()
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
                     <DialogTitle>New Facility Form</DialogTitle>
                     <DialogDescription>
                         Fill out the form below to add a new facility to the system.
                     </DialogDescription>
                 </DialogHeader>
                 <FacilityForm
                     onSubmit={onSubmit}
                     disabled={mutation.isPending}
                     defaultValues={{
                            name: '',
                            address: '',
                            longitude: 0,
                            latitude: 0,
                            email: '',
                            phoneNumber: '',
                            facilityType: '',
                            operatingHours: '',
                            averageWaitTime: '',
                    }}
                 />
             </DialogContent>
         </Dialog>
     )
}