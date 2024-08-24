'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Trash} from "lucide-react";
import {insertFacilitySchema} from "@/db/schema";
import {PhoneInput} from "@/components/customUi/phone-input";

// modified formSchema to only include firstName based on drizzle insertPatientSchema
const formSchema = insertFacilitySchema.pick({
    name: true,
    address: true,
    city: true,
    state: true,
    county: true,
    zipCode: true,
    email: true,
    phoneNumber: true,
    facilityType: true,
    operatingHours: true,
    averageWaitTime: true,
})

type FormValues = z.input<typeof formSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
}

export const FacilityForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
}: Props) => {

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    function handleSubmit(values: FormValues) {
        onSubmit(values)
    }

    const handleDelete = () => {
        onDelete?.()
    }

   return(
               <Form {...form}>
                   <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 w-full">
                       <div className='grid grid-cols-2 '>
                               <FormField
                                   control={form.control}
                                   name="name"
                                   render={({field}) => (
                                       <FormItem>
                                           <FormLabel>Name</FormLabel>
                                           <FormControl>
                                               <Input
                                                   className='capitalize'
                                                   placeholder="Clinic Name"
                                                   {...field}
                                               />
                                           </FormControl>
                                       </FormItem>
                                   )}
                               />
                           <FormField
                               control={form.control}
                               name="phoneNumber"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Phone Number</FormLabel>
                                       <FormControl>
                                           <PhoneInput
                                               {...field}
                                               format='(###) ###-####'
                                               allowEmptyFormatting={true}
                                               mask="_"
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="email"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Email</FormLabel>
                                       <FormControl>
                                           <Input
                                               type={"email"}
                                               placeholder="example@email.com"
                                               {...field}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="facilityType"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Facility Type</FormLabel>
                                       <FormControl>
                                           <Input
                                               placeholder="Facility Type"
                                               {...field}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                            <FormField
                                 control={form.control}
                                 name="address"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                             <Input
                                                  placeholder="Clinic Address"
                                                  {...field}
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                            <FormField
                                 control={form.control}
                                 name="city"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                             <Input
                                                  placeholder="City"
                                                  {...field}
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                            <FormField
                                 control={form.control}
                                 name="state"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                             <Input
                                                  placeholder="State"
                                                  {...field}
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                            <FormField
                                 control={form.control}
                                 name="county"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>County</FormLabel>
                                        <FormControl>
                                             <Input
                                                  placeholder="County"
                                                  {...field}
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                            <FormField
                                 control={form.control}
                                 name="zipCode"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>Zip Code</FormLabel>
                                        <FormControl>
                                             <Input
                                                  placeholder="Zip Code"
                                                  {...field}
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                            <FormField
                                 control={form.control}
                                 name="operatingHours"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>Operating Hours</FormLabel>
                                        <FormControl>
                                             <Input
                                                  placeholder="Operating Hours"
                                                  {...field}
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                            <FormField
                                 control={form.control}
                                 name="averageWaitTime"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>Average Wait Time</FormLabel>
                                        <FormControl>
                                             <Input
                                                  placeholder="Average Wait Time"
                                                  {...field}
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                       </div>
                       <Button className='w-full mt-4'>
                           {id ? "Update Facility" : "Add Facility"}
                       </Button>
                       {!!id && (
                            <Button
                                type='button'
                                disabled={disabled}
                                variant="destructive"
                                className='w-full'
                                onClick={handleDelete}
                            >
                                 <Trash className='size-4 mr-2'/>
                                 Delete Facility
                            </Button>
                       )}
                   </form>
               </Form>
   )
}
