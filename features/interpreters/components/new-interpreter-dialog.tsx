'use client'

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {z} from "zod"

import {useNewInterpreter} from "@/features/interpreters/hooks/use-new-interpreter";
import {InterpreterForm} from "@/features/interpreters/components/interpreterForm";
import {insertInterpreterSchema} from "@/db/schema";
import {useCreateInterpreter} from "@/features/interpreters/api/use-create-interpreter";

const formSchema  = insertInterpreterSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phoneNumber: true,
    targetLanguages: true,
    isCertified: true,
    specialty: true,
    coverageArea: true
})

type FormValues = z.input<typeof formSchema>

export const NewInterpreterDialog = () => {
    const {isOpen, onClose} = useNewInterpreter()
    const mutation = useCreateInterpreter()

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose()
            }
        })
    }

     return(
         <Dialog open={isOpen} onOpenChange={onClose} >
             <DialogContent >
                 <DialogHeader>
                     <DialogTitle>New Interpreter Form</DialogTitle>
                     <DialogDescription>
                         Fill out the form below to add a new interpreter to the system.
                     </DialogDescription>
                 </DialogHeader>
                    <InterpreterForm
                        onSubmit={onSubmit}
                        disabled={mutation.isPending}
                        defaultValues={{
                            firstName: '',
                            lastName: '',
                            email: '',
                            phoneNumber: '',
                            targetLanguages: '',
                            isCertified: false,
                            specialty: '',
                            coverageArea: ''
                    }}
                 />
             </DialogContent>
         </Dialog>
     )
}