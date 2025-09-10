'use client'

import {LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, Line, Legend, YAxis, Area, AreaChart} from "recharts";
import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export interface DailyAppointmentDataPoint {
    date: string;       // Formatted date string for display on XAxis (e.g., "Mon, May 26")
    fullDate: string;   // YYYY-MM-DD for sorting or internal use
    dayOfWeek: string;  // e.g., "Mon", "Tue"
    appointments: number; // Count of appointments for that day
}


export interface LineChartGraphProps {
    data: DailyAppointmentDataPoint[]
    title?:string
    description?: string;
    timeRange?: string; // Optional time range for filtering data
    onTimeRangeChange: (value: string) => void;
}

export const AppointmentAreaChart = ({
    data,
    title = 'Daily Appointments Trend',
    description = 'Trend of daily appointments over time',
    timeRange,
    onTimeRangeChange

}: LineChartGraphProps) => {

    if (!data || data.length === 0) {
        return <div>No data available for chart </div>
    }

    const CustomToolTip = ({ active, payload, label } : any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border rounded shadow-lg">
                    <p className="text-sm font-semibold mb-2">{`${label}`}</p>
                    <p className="text-sm">Appointments: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    }

    const chartConfig = {
        appointments: {
            label: "Appointments",
            color: "hsl(221, 83%, 53%)",
        },
    } satisfies ChartConfig

    return(
        <Card className='pt-0'>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        {description}
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={onTimeRangeChange}>
                    <SelectTrigger
                        className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={data}
                    >
                        <defs>
                            {/* Define the gradient fill for the 'appointments' data series */}
                            <linearGradient id="fillAppointments" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-appointments)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-appointments)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey='date'
                            axisLine={false}
                            tickMargin={4}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                // Add timezone offset to prevent date from being off-by-one
                                const timeZoneOffset = date.getTimezoneOffset() * 60000;
                                const adjustedDate = new Date(date.valueOf() + timeZoneOffset);
                                return adjustedDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                            <ChartTooltipContent
                                labelFormatter={(value) => {
                                    const date = new Date(value);
                                    const timeZoneOffset = date.getTimezoneOffset() * 60000;
                                    const adjustedDate = new Date(date.valueOf() + timeZoneOffset);
                                    return adjustedDate.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                    });
                                }}
                                indicator='line'
                            />
                        }
                        />
                        <Area
                            dataKey='appointments'
                            type={'monotone'}
                            fill="url(#fillAppointments)"
                            stroke="var(--color-appointments)"
                            stackId='a'
                        >
                        </Area>
                    </AreaChart>
                </ChartContainer>
            </CardContent>

        </Card>
    )
}