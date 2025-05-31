'use client'

import {LineChartGraph} from "@/components/customUi/line-chart-graph";
import dynamic from "next/dynamic";
import type {DailyAppointmentDataPoint} from "@/components/customUi/line-chart-graph";
import {eachDayOfInterval, endOfWeek, format, getDay, parseISO, startOfWeek, subWeeks} from "date-fns";
import {useGetAppointments} from "@/features/appointments/api/use-get-appointments";
import {useMemo} from "react";

interface RawApiAppointment {
    id:string
    date: string
}

const LineChartGraphWithNoSSR = dynamic(
    () => import("./line-chart-graph").then(mod => mod.LineChartGraph), // Adjust path
    {
        ssr: false,
        loading: () => (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Loading chart...</p> {/* You can use a Skeleton here too */}
            </div>
        )
    }
);

const processAppointmentsForChart = (
    rawAppointments: RawApiAppointment[] | undefined,
    weeksToShow: number = 4 // Number of past weeks to show including the current week
): DailyAppointmentDataPoint[] => {
    if (!rawAppointments) return [];

    const today = new Date();
    // Go back to the start of the week (Monday) for the earliest week
    const startDatePeriod = startOfWeek(subWeeks(today, weeksToShow - 1), { weekStartsOn: 1 });
    // End of the current week (Sunday), but we'll filter for Mon-Fri
    const endDatePeriod = endOfWeek(today, { weekStartsOn: 1 });

    const dailyCounts: { [key: string]: number } = {};

    // Initialize counts for all Mon-Fri in the period to 0
    const allWeekdaysInRange = eachDayOfInterval({ start: startDatePeriod, end: endDatePeriod });
    allWeekdaysInRange.forEach(day => {
        const dayOfWeek = getDay(day); // Sunday = 0, Monday = 1, ..., Saturday = 6
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
            const formattedDateKey = format(day, 'yyyy-MM-dd');
            dailyCounts[formattedDateKey] = 0;
        }
    });

    // Count actual appointments
    rawAppointments.forEach(appointment => {
        try {
            // Assuming appointment.date from API is a full ISO string or at least parsable by parseISO
            const appointmentDate = parseISO(appointment.date);
            const dayOfWeek = getDay(appointmentDate);

            // Only count if it's Mon-Fri and within our initialized date range
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                const formattedDateKey = format(appointmentDate, 'yyyy-MM-dd');
                if (dailyCounts.hasOwnProperty(formattedDateKey)) {
                    dailyCounts[formattedDateKey]++;
                }
            }
        } catch (e) {
            console.error("Error processing appointment date for chart:", appointment.date, e);
        }
    });

    // Convert to chart data format and sort
    const chartData = Object.keys(dailyCounts)
        .map(dateKey => {
            const dateObj = parseISO(dateKey); // dateKey is 'yyyy-MM-dd'
            return {
                date: format(dateObj, 'EEE, MMM d'), // e.g., "Mon, May 26"
                fullDate: dateKey,
                dayOfWeek: format(dateObj, 'EEE'),
                appointments: dailyCounts[dateKey],
            };
        })
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

    return chartData;
};


export const DataCharts = () => {

    const {data: rawAppointments, isLoading: isLoadingAppointments} = useGetAppointments();

    const appointmentChartData = useMemo(() => {
        return processAppointmentsForChart(rawAppointments, 4); // Show last 4 weeks (Mon-Fri)
    }, [rawAppointments]);

    if (isLoadingAppointments) {
        return (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Loading appointment data for chart...</p> {/* Or a Skeleton loader */}
            </div>
        );
    }



    return(
        <div className='grid grid-cols-1 lg:grid-cols-6 gap-8'>
            <div className='col-span-1 lg:col-span-3 xl:col-span-4'>
                <LineChartGraphWithNoSSR data={appointmentChartData} />
            </div>
        </div>
    )
}