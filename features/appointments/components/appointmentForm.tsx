'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Trash, Building2, AlertCircle} from "lucide-react";
import {insertAppointmentSchema} from "@/db/schema";
import {CustomSelect} from "@/components/customUi/customSelect";
import { DatePicker } from "@/components/customUi/date-picker";
import {Textarea} from "@/components/ui/textarea";
import {TimePick} from "@/components/customUi/time-picker";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {useState, useRef, useEffect} from "react";
import {Card, CardContent, CardDescription, CardHeader} from "@/components/ui/card";
import {useInterpreterCount} from "@/features/appointments/api/use-get-interpreter-count";
import {SimpleTimePicker} from "@/components/customUi/time-picker-ampm";
import {Check, ChevronsUpDown} from "lucide-react";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import { useGetActivePatientPayers } from "@/features/patient-payers/use-get-active-patient-payers" 

// Appointment type options for searchable combobox
const appointmentTypeOptions = [
    { label: "Follow Up", value: "Follow-Up" },
    { label: "Initial", value: "Initial" },
    { label: "IME/AME", value: "IME/AME" },
    { label: "Second Opinion", value: "Second-Opinion" },
    { label: "QME", value: "QME" },
    { label: "IEP", value: "IEP" },
    { label: "Conference", value: "Conference" },
    { label: "Physical Therapy", value: "Physical Therapy" },
    { label: "Injection", value: "Injection" },
    { label: "Surgery", value: "Surgery" },
    { label: "Chiropractor", value: "Chiropractor" },
    { label: "Acupuncture", value: "Acupuncture" },
    { label: "Other", value: "Other" },
];

// Language options
const languageOptions = [
    { label: "Spanish", value: "Spanish" },
    { label: "Mandarin", value: "Mandarin" },
    { label: "Cantonese", value: "Cantonese" },
    { label: "Vietnamese", value: "Vietnamese" },
    { label: "Korean", value: "Korean" },
    { label: "Tagalog", value: "Tagalog" },
    { label: "Russian", value: "Russian" },
    { label: "Arabic", value: "Arabic" },
    { label: "Farsi", value: "Farsi" },
    { label: "Portuguese", value: "Portuguese" },
    { label: "French", value: "French" },
    { label: "Japanese", value: "Japanese" },
    { label: "Hindi", value: "Hindi" },
    { label: "Punjabi", value: "Punjabi" },
    { label: "ASL", value: "ASL" },
    { label: "Other", value: "Other" },
];

const intervalRegex = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i;

const formSchema = z.object({
    date: z.coerce.date(),
    patientId: z.string().nullable(),
    facilityId: z.string().nullable(),
    interpreterId: z.string().nullable().optional(),
    startTime: z.string(),
    projectedEndTime: z.string().nullable(),
    projectedDuration: z.string().regex(intervalRegex, {message: 'Invalid duration format. Example: 1h30m'}).nullable(),
    endTime: z.string().nullable().optional(),
    appointmentType: z.string().nullable(),
    isCertified: z.boolean().optional(),
    notes: z.string().nullable().optional(),
    adminNotes: z.string().nullable().optional(),
    status: z.string().nullable(),
    offerMode: z.boolean().optional(),
    isRushAppointment: z.boolean().optional(),
    // NEW: Billing fields
    payerId: z.string().nullable().optional(),
    language: z.string().nullable().optional(),
    mileageApproved: z.boolean().optional(),
})

const apiSchema = insertAppointmentSchema.omit({
    id:true
})

type FormValues = z.input<typeof formSchema>
type ApiFormValues = z.input<typeof apiSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: ApiFormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
    patientOptions: {label: string, value: string}[];
    facilityOptions: {label: string, value: string}[];
    interpreterOptions: {label: string, value: string}[];
    payerOptions: {label: string, value: string}[];
}

export const AppointmentForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
    patientOptions,
    facilityOptions,
    interpreterOptions,
    payerOptions,
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    const [isOfferMode, setIsOfferMode] = useState(false)
    const [appointmentTypeOpen, setAppointmentTypeOpen] = useState(false)
    const [appointmentTypeSearch, setAppointmentTypeSearch] = useState("")
    const appointmentTypeInputRef = useRef<HTMLInputElement>(null)
    const facilityId = form.watch('facilityId')
    const patientId = form.watch('patientId')
    const currentPayerId = form.watch('payerId')
    const interpreterCount = useInterpreterCount(facilityId)

    // Auto-populate payer when patient is selected
    const activePayersQuery = useGetActivePatientPayers(patientId ?? undefined)

    // Track if payer was manually overridden
    const [payerManuallySet, setPayerManuallySet] = useState(false)
    const [autoPopulatedPayerId, setAutoPopulatedPayerId] = useState<string | null>(null)

    useEffect(() => {
        if (activePayersQuery.data && activePayersQuery.data.length > 0 && !payerManuallySet) {
            // Find primary payer first, fallback to first active
            const primaryPayer = activePayersQuery.data.find((p: any) => p.isPrimary)
            const payerToSet = primaryPayer || activePayersQuery.data[0]

            if (payerToSet?.payerId) {
                form.setValue('payerId', payerToSet.payerId)
                setAutoPopulatedPayerId(payerToSet.payerId)
            }
        }
    }, [activePayersQuery.data, payerManuallySet, form])

    // Reset payer auto-population when patient changes
    useEffect(() => {
        if (!id) {
            // Only reset on new appointments, not edits
            setPayerManuallySet(false)
            setAutoPopulatedPayerId(null)
        }
    }, [patientId, id])

    // Focus the search input when popover opens
    useEffect(() => {
        if (appointmentTypeOpen && appointmentTypeInputRef.current) {
            setTimeout(() => {
                appointmentTypeInputRef.current?.focus()
            }, 0)
        }
    }, [appointmentTypeOpen])

    const filteredAppointmentTypes = appointmentTypeOptions.filter((option) =>
        option.label.toLowerCase().includes(appointmentTypeSearch.toLowerCase())
    )

    // Get the active payer info for display
    const activePrimaryPayer = activePayersQuery.data?.find((p: any) => p.isPrimary)
    const activeSecondaryPayer = activePayersQuery.data?.find((p: any) => !p.isPrimary)
    const isPayerOverridden = payerManuallySet && currentPayerId !== autoPopulatedPayerId

    const handleSubmit = (values: FormValues) => {
        onSubmit({
            ...values,
            interpreterId: values.offerMode ? null : values.interpreterId,
            offerMode: values.offerMode ?? false,
            isRushAppointment: values.isRushAppointment ?? false,
            payerId: values.payerId ?? null,
            language: values.language ?? null,
            mileageApproved: values.mileageApproved ?? true,
        })
    }

    const handleDelete = () => {
        onDelete?.()
    }

   return(
               <Form {...form}>
                   <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                       console.error("Validation failed", JSON.stringify(errors, null, 2));})} className="space-y-2 pt-4 ">
                       <div className='grid grid-cols-1 gap-1 '>
                           <FormField
                               control={form.control}
                               name="date"
                               render={({field}) => (
                                   <FormItem>
                                       <FormControl>
                                             <DatePicker
                                                  value={field.value}
                                                  onChange={field.onChange}
                                                  disabled={disabled}
                                             />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <div className='flex flex-row  gap-x-4'>
                               <FormField
                                   control={form.control}
                                   name="startTime"
                                   render={({field}) => (
                                       <FormItem>
                                           <FormLabel>Start Time</FormLabel>
                                           <FormControl>
                                               <div className="flex flex-col gap-3">
                                                   <TimePick
                                                       value={field.value}
                                                       onChange={field.onChange}
                                                       disabled={disabled}
                                                   />
                                               </div>
                                           </FormControl>
                                       </FormItem>
                                   )}
                               />
                               <FormField
                                   control={form.control}
                                   name="projectedEndTime"
                                   render={({field}) => (
                                       <FormItem>
                                           <FormLabel>Projected End Time</FormLabel>
                                           <FormControl>
                                               <TimePick
                                                   value={field.value ?? ""}
                                                   onChange={field.onChange}
                                                   disabled={disabled}
                                               />
                                           </FormControl>
                                       </FormItem>
                                   )}
                               />
                           </div>
                           </div>
                          <div>
                              <div className={'flex flex-row'}>
                                  <div className={'mr-5'}>
                                      <FormField
                                          control={form.control}
                                          name="endTime"
                                          render={({field}) => (
                                              <FormItem>
                                                  <FormLabel>End Time</FormLabel>
                                                  <FormControl>
                                                      <TimePick
                                                          value={field.value ?? ""}
                                                          onChange={field.onChange}
                                                          disabled={disabled}
                                                      />
                                                  </FormControl>
                                              </FormItem>
                                          )}
                                      />
                                  </div>
                                  <div >
                                      <FormField
                                          control={form.control}
                                          name="projectedDuration"
                                          render={({field}) => (
                                              <FormItem>
                                                  <FormLabel className={'ml-8'}>Projected Duration</FormLabel>
                                                  <FormControl>
                                                      <Input
                                                          disabled={disabled}
                                                          placeholder={'1h30m'}
                                                          {...field}
                                                          value={field.value ?? ""}
                                                          className={'ml-8 w-28'}
                                                      />
                                                  </FormControl>
                                              </FormItem>
                                          )}
                                      />
                                  </div>
                              </div>
                           <FormField
                               control={form.control}
                               name="patientId"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Patient</FormLabel>
                                       <FormControl>
                                           <CustomSelect
                                               placeholder="Select a patient..."
                                               options={patientOptions}
                                               value={field.value}
                                               onChange={field.onChange}
                                               disabled={disabled}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />

                           {/* ============================================================ */}
                           {/* BILLING SECTION: Payer + Language + Mileage */}
                           {/* ============================================================ */}
                           {patientId && (
                               <div className="rounded-lg border p-3 mt-2 space-y-3">
                                   <div className="flex items-center justify-between">
                                       <p className="text-sm font-medium flex items-center gap-2">
                                           <Building2 className="size-4" />
                                           Billing Info
                                       </p>
                                       {activePrimaryPayer && !isPayerOverridden && (
                                           <Badge variant="outline" className="text-xs">
                                               Auto-populated from patient
                                           </Badge>
                                       )}
                                       {isPayerOverridden && (
                                           <Badge variant="secondary" className="text-xs">
                                               Manually overridden
                                           </Badge>
                                       )}
                                   </div>

                                   {/* Active payer info from patient */}
                                   {activePayersQuery.data && activePayersQuery.data.length > 0 && (
                                       <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 rounded p-2">
                                           {activePrimaryPayer && (
                                               <div className="flex justify-between">
                                                   <span>Primary: <span className="font-medium text-foreground">{activePrimaryPayer.payerName}</span></span>
                                                   <Badge variant="outline" className="text-[10px] h-4">{activePrimaryPayer.payerType?.replace("_", " ")}</Badge>
                                               </div>
                                           )}
                                           {activeSecondaryPayer && (
                                               <div className="flex justify-between">
                                                   <span>Secondary: <span className="font-medium text-foreground">{activeSecondaryPayer.payerName}</span></span>
                                                   <Badge variant="outline" className="text-[10px] h-4">{activeSecondaryPayer.payerType?.replace("_", " ")}</Badge>
                                               </div>
                                           )}
                                       </div>
                                   )}

                                   {activePayersQuery.data && activePayersQuery.data.length === 0 && (
                                       <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded p-2">
                                           <AlertCircle className="size-3 shrink-0" />
                                           No active payer assigned to this patient
                                       </div>
                                   )}

                                   {/* Payer Select (override) */}
                                   <FormField
                                       control={form.control}
                                       name="payerId"
                                       render={({field}) => (
                                           <FormItem>
                                               <FormLabel className="text-xs">Payer</FormLabel>
                                               <FormControl>
                                                   <CustomSelect
                                                       placeholder="Select payer..."
                                                       options={payerOptions}
                                                       value={field.value}
                                                       onChange={(value) => {
                                                           field.onChange(value)
                                                           setPayerManuallySet(true)
                                                       }}
                                                       disabled={disabled}
                                                   />
                                               </FormControl>
                                           </FormItem>
                                       )}
                                   />

                                   {/* Language */}
                                   <FormField
                                       control={form.control}
                                       name="language"
                                       render={({field}) => (
                                           <FormItem>
                                               <FormLabel className="text-xs">Language</FormLabel>
                                               <FormControl>
                                                   <Select
                                                       onValueChange={field.onChange}
                                                       value={field.value ?? ''}
                                                   >
                                                       <SelectTrigger>
                                                           <SelectValue placeholder="Select language..." />
                                                       </SelectTrigger>
                                                       <SelectContent>
                                                           <SelectGroup>
                                                               <SelectLabel>Languages</SelectLabel>
                                                               {languageOptions.map((lang) => (
                                                                   <SelectItem key={lang.value} value={lang.value}>
                                                                       {lang.label}
                                                                   </SelectItem>
                                                               ))}
                                                           </SelectGroup>
                                                       </SelectContent>
                                                   </Select>
                                               </FormControl>
                                           </FormItem>
                                       )}
                                   />

                                   {/* Mileage Approved */}
                                   <FormField
                                       control={form.control}
                                       name="mileageApproved"
                                       render={({field}) => (
                                           <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                               <div className="space-y-0.5">
                                                   <FormLabel className="text-xs">Mileage Approved</FormLabel>
                                                   <FormDescription className="text-[11px]">
                                                       Is mileage reimbursable for this appointment?
                                                   </FormDescription>
                                               </div>
                                               <FormControl>
                                                   <Switch
                                                       checked={field.value ?? false}
                                                       onCheckedChange={field.onChange}
                                                   />
                                               </FormControl>
                                           </FormItem>
                                       )}
                                   />
                               </div>
                           )}

                           <FormField
                               control={form.control}
                               name="facilityId"
                               render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Facility</FormLabel>
                                       <FormControl>
                                           <CustomSelect
                                               options={facilityOptions}
                                               value={field.value}
                                               onChange={field.onChange}
                                               placeholder="Select a facility..."
                                               disabled={disabled}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                              <div className='mt-2'>
                                  <FormField
                                      control={form.control}
                                      name="offerMode"
                                      render={({field}) => (
                                          <FormItem className="relative rounded-lg border p-4 shadow-sm min-h-[100px]">
                                              <div className="space-y-1 pr-16">
                                                  <FormLabel>Switch to enable offer mode</FormLabel>
                                                  <FormDescription>
                                                      Enabling will send offer out to multiple interpreters in a 30 mile radius
                                                  </FormDescription>
                                              </div>
                                              <FormControl>
                                                  <div className="absolute bottom-2 right-4">
                                                      <Switch
                                                          checked={field.value ?? false}
                                                          onCheckedChange={(checked) => {
                                                              field.onChange(checked);
                                                              setIsOfferMode(checked);
                                                              if (checked) {
                                                                  form.setValue('interpreterId', null);
                                                              }
                                                          }}
                                                      />
                                                  </div>
                                              </FormControl>
                                          </FormItem>
                                      )}
                                  />
                              </div>

                              {!isOfferMode &&
                                  <FormField
                                      control={form.control}
                                      name="interpreterId"
                                      render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Interpreter</FormLabel>
                                              <FormControl>
                                                  <CustomSelect
                                                      options={interpreterOptions}
                                                      value={field.value}
                                                      onChange={field.onChange}
                                                      placeholder="Select an Interpreter..."
                                                      disabled={disabled}
                                                  />
                                              </FormControl>
                                          </FormItem>
                                      )}
                                  />
                              }
                              {isOfferMode &&
                                  <Card className={'mt-2'}>
                                      <CardContent className={'flex items-center justify-center'}>
                                          <CardDescription className={'p-1'}>
                                              {facilityId && interpreterCount.data && (
                                                  <span className="block mt-1 font-medium text-primary">
                                                      {interpreterCount.data.count} interpreters available in area
                                                  </span>
                                              )}
                                              Offer will automatically be sent out to multiple interpreters in the area. Refer to offer interface to monitor status changes
                                          </CardDescription>
                                      </CardContent>
                                  </Card>
                              }
                           <div className='flex flex-row gap-x-4 items-end'>
                               <FormField
                                   control={form.control}
                                   name="appointmentType"
                                   render={({ field }) => (
                                       <FormItem className="flex flex-col relative overflow-visible">
                                           <FormLabel>Appointment Type</FormLabel>
                                           <FormControl>
                                               <div className="relative overflow-visible">
                                                   <Button
                                                       variant="outline"
                                                       role="combobox"
                                                       type="button"
                                                       aria-expanded={appointmentTypeOpen}
                                                       className={cn(
                                                           "w-[180px] justify-between font-normal",
                                                           !field.value && "text-muted-foreground"
                                                       )}
                                                       disabled={disabled}
                                                       onClick={() => setAppointmentTypeOpen(!appointmentTypeOpen)}
                                                   >
                                                       {field.value
                                                           ? appointmentTypeOptions.find(
                                                               (option) => option.value === field.value
                                                           )?.label
                                                           : "Select type..."}
                                                       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                   </Button>
                                                   {appointmentTypeOpen && (
                                                       <div className="absolute bottom-full left-0 z-50 mb-1 w-[200px] rounded-md border bg-background shadow-lg">
                                                           <div className="flex items-center border-b px-3 py-2">
                                                               <Input
                                                                   ref={appointmentTypeInputRef}
                                                                   placeholder="Search type..."
                                                                   value={appointmentTypeSearch}
                                                                   onChange={(e) => setAppointmentTypeSearch(e.target.value)}
                                                                   className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                                               />
                                                           </div>
                                                           <div className="max-h-[150px] overflow-y-auto p-1">
                                                               {filteredAppointmentTypes.length === 0 ? (
                                                                   <div className="py-4 text-center text-sm text-muted-foreground">
                                                                       No type found.
                                                                   </div>
                                                               ) : (
                                                                   filteredAppointmentTypes.map((option) => (
                                                                       <div
                                                                           key={option.value}
                                                                           className={cn(
                                                                               "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                                               field.value === option.value && "bg-accent"
                                                                           )}
                                                                           onClick={() => {
                                                                               field.onChange(option.value)
                                                                               setAppointmentTypeOpen(false)
                                                                               setAppointmentTypeSearch("")
                                                                           }}
                                                                       >
                                                                           <Check
                                                                               className={cn(
                                                                                   "mr-2 h-4 w-4",
                                                                                   field.value === option.value
                                                                                       ? "opacity-100"
                                                                                       : "opacity-0"
                                                                               )}
                                                                           />
                                                                           {option.label}
                                                                       </div>
                                                                   ))
                                                               )}
                                                           </div>
                                                       </div>
                                                   )}
                                               </div>
                                           </FormControl>
                                       </FormItem>
                                   )}
                               />
                               <FormField
                                   control={form.control}
                                   name="status"
                                   render={({ field }) => (
                                       <FormItem>
                                           <FormLabel>Status</FormLabel>
                                           <FormControl>
                                               <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                   <SelectTrigger className="w-[180px]">
                                                       <SelectValue className='pr-4' placeholder="Select Status" />
                                                   </SelectTrigger>
                                                   <SelectContent>
                                                       <SelectGroup>
                                                           <SelectLabel>Status</SelectLabel>
                                                           <SelectItem value="Pending Confirmation">Pending Confirmation</SelectItem>
                                                           <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                           <SelectItem value="Closed">Closed</SelectItem>
                                                           <SelectItem value="Interpreter Requested">Interpreter Requested</SelectItem>
                                                           <SelectItem value="Pending Authorization">Pending Authorization</SelectItem>
                                                           <SelectItem value="Late CX">Late CX</SelectItem>
                                                           <SelectItem value="No Show">No Show</SelectItem>
                                                       </SelectGroup>
                                                   </SelectContent>
                                               </Select>
                                           </FormControl>
                                       </FormItem>
                                   )}
                               />
                           </div>
                              <div className='mt-2'>
                                  <FormField
                                      control={form.control}
                                      name="isCertified"
                                      render={({field}) => (
                                          <FormItem className="relative rounded-lg border p-3 shadow-sm h-24">
                                              <FormLabel className='mb-4'>Switch If Certification Required</FormLabel>
                                              <FormControl>
                                                  <div className='absolute right-4'>
                                                      <Switch
                                                          checked={field.value ?? undefined}
                                                          onCheckedChange={field.onChange}
                                                      />
                                                  </div>
                                              </FormControl>
                                          </FormItem>
                                      )}
                                  />
                              </div>

                           <FormField
                               control={form.control}
                               name="adminNotes"
                               render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Notes</FormLabel>
                                       <FormControl>
                                           <Textarea
                                               {...field}
                                               value={field.value ?? ""}
                                               disabled={disabled}
                                               placeholder="Optional notes..."
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                       </div>
                       <Button className='w-full'>
                           {id ? "Update Appointment" : "Add Appointment"}
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
                                 Delete Appointment
                            </Button>
                       )}
                   </form>
               </Form>

   )

}