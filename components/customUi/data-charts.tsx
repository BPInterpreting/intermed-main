'use client'

import {AppointmentAreaChart} from "@/components/customUi/appointment-area-chart";
import dynamic from "next/dynamic";
import type {DailyAppointmentDataPoint} from "@/components/customUi/appointment-area-chart";
import {
    eachDayOfInterval,
    endOfWeek,
    format,
    getDay,
    parseISO,
    startOfDay,
    startOfWeek,
    subDays,
    subWeeks
} from "date-fns";
import {useGetAppointments} from "@/features/appointments/api/use-get-appointments";
import {useMemo, useState} from "react";
import {FacilityDistributionPieChart} from "@/components/customUi/facility-distribution-pie-chart";

interface RawApiAppointment {
    id:string
    date: string
    facility?: string
    facilityId?: string | null
}

export interface FacilityPieDataInput {
    name: string;   // Facility Name
    value: number;  // Count of appointments
}

const LineChartGraphWithNoSSR = dynamic(
    () => import("./appointment-area-chart").then(mod => mod.AppointmentAreaChart),
    {
        ssr: false,
        loading: () => (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Loading chart...</p> {/* You can use a Skeleton here too */}
            </div>
        )
    }
);
const FacilityDistributionPieChartWithNoSSR = dynamic(
    () => import('./facility-distribution-pie-chart').then(mod => mod.FacilityDistributionPieChart),
    {
        ssr: false,
        loading: () => (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Loading chart...</p> {/* You can use a Skeleton here too */}
            </div>
        )
    }
);

const processPieChartData = (
    rawAppointments: RawApiAppointment[] | undefined
): FacilityPieDataInput[] => {
    if (!rawAppointments || rawAppointments.length === 0) return [];
    const facilityCounts: { [facilityName: string]: number } = {};

    rawAppointments.forEach(appointment => {
        const facilityName = appointment.facility || (appointment.facilityId ? `Facility ID ${appointment.facilityId}` : "Unknown Facility");
        facilityCounts[facilityName] = (facilityCounts[facilityName] || 0) + 1;
    });

    let chartData = Object.entries(facilityCounts).map(([name, value]) => ({
        name,
        value,
    }));

    chartData.sort((a, b) => b.value - a.value); // Sort by count descending
    const MAX_SLICES = 7; // Example: Show top 6 facilities + "Others"
    if (chartData.length > MAX_SLICES) {
        const topFacilities = chartData.slice(0, MAX_SLICES - 1);
        const otherFacilitiesCount = chartData.slice(MAX_SLICES - 1).reduce((acc, curr) => acc + curr.value, 0);
        if (otherFacilitiesCount > 0) {
            topFacilities.push({ name: "Others", value: otherFacilitiesCount });
        }
        chartData = topFacilities;
    }
    return chartData;
};

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
    const [timeRange, setTimeRange] = useState('7d'); // Default to last 4 weeks

    const {data: rawAppointments, isLoading: isLoadingAppointments} = useGetAppointments();

    const appointmentChartData = useMemo(() => {
        return processAppointmentsForChart(rawAppointments as RawApiAppointment[] | undefined, 12);
    }, [rawAppointments]);

    // Memoized filter to get data for the selected time range
    const filteredData = useMemo(() => {
        const today = startOfDay(new Date());
        let daysToSubtract = 90;
        if (timeRange === "30d") {
            daysToSubtract = 30;
        } else if (timeRange === "7d") {
            daysToSubtract = 7;
        }
        const startDate = subDays(today, daysToSubtract - 1);
        return appointmentChartData.filter((item) => {
            // new Date() handles 'YYYY-MM-DD' format reliably across timezones
            const itemDate = new Date(item.fullDate);
            return itemDate >= startDate;
        });
    }, [appointmentChartData, timeRange]);

    const pieChartData = useMemo(() => {
        console.log("Raw appointments for pie chart:", rawAppointments);
        const processed = processPieChartData(rawAppointments);
        console.log("Processed pie chart data:", processed);
        return processed;
    }, [rawAppointments]);

    if (isLoadingAppointments) {
        return (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Loading appointment data for chart...</p> {/* Or a Skeleton loader */}
            </div>
        );
    }

    return(
        <div className='grid grid-cols-2 gap-4 mt-4'>
                <div>
                    <LineChartGraphWithNoSSR
                        data={filteredData}
                        timeRange={timeRange}
                        onTimeRangeChange={setTimeRange}
                    />
                </div>
                <div>
                    <FacilityDistributionPieChart
                        data={pieChartData}
                        title={"Facility Distribution"}
                        description={'Breakdown of appointments by facility'}
                    />
                </div>
        </div>
    )
}