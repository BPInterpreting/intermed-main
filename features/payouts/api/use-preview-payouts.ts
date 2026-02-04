import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { InferRequestType } from "hono";

type RequestType = InferRequestType<typeof client.api.payouts.generate.$post>["json"]

export type PreviewAppointment = {
    id: string
    bookingId: number | null
    date: string
    status: string | null
    patientName: string
    facilityName: string
    startTime: string | null
    endTime: string | null
    serviceHours: number
    hourlyRate: number
    mileage: number
    mileageRate: number
    adjustmentType: string | null
    adjustmentAmount: number
    lineTotal: number
    isCertified: boolean
    durationSource: string
}

export type PreviewInterpreter = {
    interpreterId: string
    interpreterName: string
    appointmentCount: number
    estimatedHours: number
    estimatedTotal: number
    rate: number
    isCertified: boolean
    appointments: PreviewAppointment[]
}

export type SkippedInterpreter = {
    name: string
    reason: string
    appointmentCount: number
    appointments: {
        id: string
        bookingId: number | null
        date: string
        status: string | null
        patientName: string
        facilityName: string
    }[]
}

export type UnclosedDetail = {
    id: string
    bookingId: number | null
    date: string
    status: string | null
    interpreterName: string
    patientName: string
    facilityName: string
}

export type PreviewWarning = {
    type: string
    message: string
    count?: number
}

export type PreviewResponse = {
    data: {
        totalAppointments: number
        totalInterpreters: number
        estimatedTotal: number
        interpreters: PreviewInterpreter[]
        warnings: PreviewWarning[]
        skippedInterpreters: SkippedInterpreter[]
        unclosedByStatus: Record<string, number>
        unclosedDetails: UnclosedDetail[]
    }
}

export const usePreviewPayouts = () => {
    const mutation = useMutation<PreviewResponse, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await fetch('/api/payouts/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to preview payouts')
            }

            return await response.json()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to preview payouts')
        }
    })

    return mutation
}