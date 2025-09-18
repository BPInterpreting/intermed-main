import { useQuery } from '@tanstack/react-query';

// We are temporarily removing the Hono client to isolate the issue
// import { client } from '@/lib/hono';

export const useGetIndividualOffer = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ['offer', { id }],
        queryFn: async () => {
            // --- START OF NEW FETCH LOGIC ---
            if (!id) {
                // This check prevents fetch from running with an undefined ID
                return null;
            }
            console.log(`[Hook] Firing direct fetch for ID: ${id}`);

            // Manually construct the URL and use a standard fetch
            const response = await fetch(`/api/appointments/offers/monitoring/${id}`);
            // --- END OF NEW FETCH LOGIC ---

            if (!response.ok) {
                // Log the server's error response for more details
                console.error("Fetch failed with status:", response.status, response.statusText);
                const errorText = await response.text();
                console.error("Server error response:", errorText);
                throw new Error('Failed to fetch offer');
            }

            const { data } = await response.json();
            return data;
        }
    });
    return query;
};

