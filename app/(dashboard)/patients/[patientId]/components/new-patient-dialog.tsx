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
import {useNewPatient} from "@/app/(dashboard)/patients/hooks/use-new-patient";


export const NewPatientDialog = () => {
    const {isOpen, onClose}  = useNewPatient()

     return(
         <Dialog open={isOpen} onOpenChange={onClose}>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>New Patient Form</DialogTitle>
                     <DialogDescription>
                         
                     </DialogDescription>
                 </DialogHeader>
             </DialogContent>
         </Dialog>
     )
}