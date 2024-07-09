import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {AreaVariant} from "@/components/customUi/area-variant";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import React from "react";

const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];


export const Chart = () => {
    return(
        <Card className='drop-shadow-sm'>
            <CardHeader className='flex space-y-0 items-center justify-between'>
                <CardTitle className='text-xl font-bold line-clamp-1'>
                    Card Title
                </CardTitle>

                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart
                            data={data}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={16}  />
                            <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" className='drop-shadow-sm' />
                            <Tooltip />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </CardHeader>
        </Card>
    )
}