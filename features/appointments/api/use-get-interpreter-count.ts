// In your hooks folder
import {useQuery} from "@tanstack/react-query";

export const useInterpreterCount = (facilityId: string | null) => {
    return useQuery({
        queryKey: ['interpreter-count', facilityId],
        queryFn: async () => {
            if (!facilityId) return { count: 0 }
            const response = await fetch(`/api/appointments/offers/interpreter-count?facilityId=${facilityId}`)
            return response.json()
        },
        enabled: !!facilityId
    })
}