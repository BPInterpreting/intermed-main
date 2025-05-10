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
import LocationInput from "@/components/ui/location-input";
import {useEffect} from "react";
import dynamic from "next/dynamic";
const MapWithNoSSR = dynamic(
    () => import('@/components/ui/map'), // Path to your Map component
    {
        ssr: false, // Disable Server-Side Rendering for this component
        loading: () => <div className='h-64 flex items-center justify-center'><p>Loading map...</p></div> // Optional loading state
    }
);

const formSchema = z.object({
    name: z.string(),
    address: z.string(),
    longitude: z.coerce.number(),
    latitude: z.coerce.number(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    facilityType: z.string(),
    operatingHours: z.string(),
    averageWaitTime: z.string(),
})

// modified formSchema to only include firstName based on drizzle insertPatientSchema
const apiSchema = insertFacilitySchema.pick({
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
type ApiValues = z.input<typeof apiSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: ApiValues) => void;
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
        console.log("Form values on submit:", values)
        onSubmit({
            ...values,
            longitude: values.longitude.toString(),
            latitude: values.latitude.toString(),
        })
    }

    const handleDelete = () => {
        onDelete?.()
    }

    const handleLocationSelected = (address: string, latitude: number, longitude: number) => {
        console.log("Location selected:", { address, latitude, longitude })
        form.setValue("address", address);
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
    }

    useEffect(() => {
        console.log("Form values:", form.getValues());
    }, [form.watch()]);

    return(
        <div>
               <Form {...form}>
                   {(form.getValues('latitude') !==0 && form.getValues('longitude') !==0) ? (
                       <div className='mb-1'>
                           <MapWithNoSSR
                               key={`<span class="math-inline">\{form\.getValues\('latitude'\)\}\-</span>{form.getValues('longitude')}`}
                               latitude={parseFloat(form.getValues('latitude').toString())}
                               longitude={parseFloat(form.getValues('longitude').toString())}
                               markerText={form.getValues('address') || 'Selected Location'}
                               height='64'
                           />
                       </div>
                     ): (
                         <div className={'flex mb-4 items-center justify-center'}>
                             <p className='text-muted-foreground'>
                                 **Select location below to see it on the map**
                             </p>
                         </div>

                   )}
                   <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 w-full">
                       <div className='grid grid-cols-2 '>
                           <div className='flex flex-row gap-x-4'>
                               <FormField
                                   control={form.control}
                                   name="name"
                                   render={({field}) => (
                                       <FormItem>
                                           <FormLabel>Name</FormLabel>
                                           <FormControl>
                                               <Input
                                                   className='capitalize'
                                                   placeholder="Facility Name"
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
                                               value={field.value || ''}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           </div>
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
                                               placeholder="Enter specialty"
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
                                             <LocationInput
                                                 initialAddress={field.value || ''}
                                                 onLocationSelected={handleLocationSelected}
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                           <div className='flex flex-row gap-x-4'>
                            <FormField
                                 control={form.control}
                                 name="operatingHours"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>Operating Hours</FormLabel>
                                        <FormControl>
                                             <Input
                                                  placeholder="9:00am-5:00pm"
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
                                                  placeholder="1h30m"
                                                  {...field}
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                           </div>
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
        </div>
   )
}
