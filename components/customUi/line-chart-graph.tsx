'use client'

import {LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, Line, Legend, YAxis} from "recharts";
import React from "react";

export interface DailyAppointmentDataPoint {
    date: string;       // Formatted date string for display on XAxis (e.g., "Mon, May 26")
    fullDate: string;   // YYYY-MM-DD for sorting or internal use
    dayOfWeek: string;  // e.g., "Mon", "Tue"
    appointments: number; // Count of appointments for that day
}


export interface LineChartGraphProps {
    data: DailyAppointmentDataPoint[]
    title?:string
}

export const LineChartGraph = ({
    data,
    title = 'Daily Appointments Trend'
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

    return(
        <div className='p-4 bg-white rounded-lg shadow-md'>
            <h2 className='text-lg font-semibold mb-4'>
                {title}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    width={730}
                    height={250}
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        angle={-30}
                        textAnchor="end"
                        height={50}
                        interval="preserveStartEnd"

                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: '#6B7280' }}
                        label={{ value: 'No. of Appts', angle: -90, position: 'insideLeft', offset: -10, style:{fontSize: 12, fill: '#333'} }}

                    />
                    <Tooltip content={CustomToolTip} />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Line
                        type="monotone"
                        dataKey='appointments'
                        stroke="#8884d8"
                        strokeWidth={2}
                        activeDot={{ r: 7, strokeWidth: 2, fill: '#fff', stroke: '#8884d8' }}
                        dot={{ r: 4, fill: '#8884d8' }}
                        name="Appointments"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>

    )
}