'use client'

import * as React from "react";
import { useId } from "react";
import {Pie, PieChart as RechartsPieChart, Label, Sector, Cell, Tooltip as RechartsTooltip} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
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
    ChartStyle,
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
import {useMemo, useState} from "react";
import {pie} from "d3-shape";


export interface FacilityPieDataInput {
    name: string
    value: number //count of facilities
}

interface PieDataWithFill extends FacilityPieDataInput{
    fill: string // color for the pie slice
}

interface FacilityDistributionPieProps {
    data: FacilityPieDataInput[]
    title?: string
    description?: string
}

const COLORS = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042',
    '#00C49F',
    '#FFBB28',
];


export const FacilityDistributionPieChart = ({
    data: initialData,
    title = 'Facility Appointment Distribution',
    description = 'Breakdown of appointments by facility',
}: FacilityDistributionPieProps) => {
    const id = useId();

    const { chartDataForPie, chartConfig, facilityNames } = useMemo(() => {
        const dynamicChartConfig: ChartConfig = {
            // Generic entry for tooltip if needed, though nameKey in tooltip content is better
            appointments: { label: "Appointments" },
        };

        const processedPieData: PieDataWithFill[] = initialData.map((item, index) => {
            const colorCssVar = COLORS[index % COLORS.length];
            // Create a config key for each facility (e.g., 'facility-a', 'hospital-b')
            // This key will be used by ChartStyle to apply the color.
            const configKey = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, '');

            dynamicChartConfig[configKey] = {
                label: item.name,
                color: colorCssVar,
            };
            return {
                ...item,
                fill: colorCssVar, // Recharts <Cell> will use this
            };
        });

        return {
            chartDataForPie: processedPieData,
            chartConfig: dynamicChartConfig,
            facilityNames: processedPieData.map(item => item.name),
        };
    }, [initialData]);

    const [activeFacility, setActiveFacility] = useState<string | undefined>(chartDataForPie.length > 0 ? chartDataForPie[0].name : undefined)

    const activeIndex = useMemo(() =>
        chartDataForPie.findIndex((item) => item.name === activeFacility),
        [activeFacility, chartDataForPie]
    )

    if (!chartDataForPie || chartDataForPie.length === 0) {
        return (
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center pb-0">
                    <p className="text-sm text-muted-foreground">No data available to display chart.</p>
                </CardContent>
            </Card>
        );
    }

    return(
        <Card data-chart={id} className="flex flex-col h-full">
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className='flex flex-row items-center space-y-0 pb-0'>
                <div className='grid gap-1 flex-1'>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                {facilityNames.length >1  && (
                    <Select value={activeFacility} onValueChange={setActiveFacility}>
                        <SelectTrigger
                            className={'ml-auto h-7 w-auto min-w-[130px] max-w-[200px] rounded-lg pl-2.5 text-xs'}
                            aria-label={'Select a Facility'}
                        >
                            <SelectValue placeholder='Select a Facility' />
                        </SelectTrigger>
                        <SelectContent align='end' className='rounded-xl'>
                            {chartDataForPie.map((item) => (
                                <SelectItem
                                    value={item.name}
                                    key={item.name}
                                    className='rounded-lg [&span]:flex'
                                >
                                    <div className='flex items-center gap-2 text-sm'>
                                        <span
                                            className='flex h-3 w-3 shrink-0 rounded-sm'
                                            style={{ backgroundColor: item.fill }}
                                        />
                                            {item.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </CardHeader>
            <CardContent className='flex flex-1 items-center justify-center pb-0'>
                <ChartContainer
                    id={id}
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[300px] xs:max-w-[250px] sm:max-w-[300px]"
                >
                    <RechartsPieChart>
                        <RechartsTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel nameKey="name" />}
                        />
                            <Pie
                                data={chartDataForPie}
                                dataKey='value'
                                nameKey='name'
                                innerRadius={50}
                                strokeWidth={3}
                                activeIndex={activeIndex}
                                activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                                    <g>
                                        <Sector {...props} outerRadius={outerRadius + 4} />
                                        <Sector
                                            {...props}
                                            outerRadius={outerRadius + 10}
                                            innerRadius={outerRadius + 6}
                                        />
                                    </g>
                                )}
                            >
                                {chartDataForPie.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox && activeIndex !== -1 && chartDataForPie[activeIndex]) {
                                            const activeData = chartDataForPie[activeIndex];
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="fill-foreground"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="text-2xl font-bold"
                                                    >
                                                        {activeData.value.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 20}
                                                        className="text-xs text-muted-foreground"
                                                    >
                                                        Appts
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </Pie>
                    </RechartsPieChart>
                </ChartContainer>
            </CardContent>
        </Card>
        )
}