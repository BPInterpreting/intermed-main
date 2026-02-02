'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Building2, FileText, Clock, Loader2, Plus, Edit, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { useGetPayer } from "@/features/payers/api/use-get-payer";
import { useOpenPayer } from "@/features/payers/hooks/use-open-payer";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useNewPayerRate } from "../../../../../features/payers/hooks/use-new-payer-rate";
import { useOpenPayerRate } from "../../../../../features/payers/hooks/use-open-payer-rate";
import { useDeletePayerRate } from "@/features/payers/api/use-delete-payer-rate";
import { useConfirm } from "@/hooks/use-confirm";

const PayerDetailPage = () => {
    const params = useParams();
    const payerId = params.payerId as string;
    const payerQuery = useGetPayer(payerId);
    const payer = payerQuery.data;
    const { onOpen } = useOpenPayer();
    const newPayerRate = useNewPayerRate();
    const openPayerRate = useOpenPayerRate();

    if (payerQuery.isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[500px]">
                    <Loader2 className="size-6 text-slate-300 animate-spin" />
                </div>
            </div>
        );
    }

    if (!payer) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[500px]">
                    <p className="text-muted-foreground">Payer not found</p>
                </div>
            </div>
        );
    }

    const typeLabels: Record<string, string> = {
        workers_comp: "Workers Comp",
        medi_cal: "Medi-Cal",
    };

    return (
        <>
            <div className="flex-1 space-y-4 p-8 pt-6">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/dashboard/payers">Payers</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Payer Details</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="flex items-center gap-3 mt-1">
                            <h2 className="text-3xl font-bold tracking-tight">{payer.name}</h2>
                            <Badge variant={payer.isActive ? "default" : "secondary"}>
                                {payer.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => onOpen(payerId)} variant="default">
                            Edit
                        </Button>
                    </div>
                </div>

                {/* Main Content Area - 2 column layout */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                    {/* Left Column - 1/3 of the space */}
                    <div className="space-y-4">
                        {/* Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payer Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Created</span>
                                    <span>
                                        {payer.createdAt
                                            ? format(new Date(payer.createdAt), 'PPP')
                                            : 'N/A'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="space-y-4 pt-2">
                                    <div>
                                        <div className="flex flex-row items-center space-x-2">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <Building2 height={24} width={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-muted-foreground">Type</span>
                                                <span className="font-medium">
                                                    {typeLabels[payer.type] || payer.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex flex-row items-center space-x-2">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <DollarSign height={24} width={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-muted-foreground">Default Hourly Rate</span>
                                                <span className="font-medium">
                                                    {payer.defaultHourlyRate 
                                                        ? `$${parseFloat(payer.defaultHourlyRate).toFixed(2)}/hr`
                                                        : 'Not set'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex flex-row items-center space-x-2">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <Clock height={24} width={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-muted-foreground">Minimum Hours</span>
                                                <span className="font-medium">
                                                    {payer.minimumHours 
                                                        ? `${parseFloat(payer.minimumHours)} hours`
                                                        : '2 hours'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex flex-row items-center space-x-2">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <FileText height={24} width={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-muted-foreground">Billing Code</span>
                                                <span className="font-medium font-mono">
                                                    {payer.billingCode || 'Not set'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fees Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Fees & Terms</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Late Cancel Fee</span>
                                    <span className="font-medium">
                                        {payer.lateCancelFee 
                                            ? `$${parseFloat(payer.lateCancelFee).toFixed(2)}`
                                            : 'Not set'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">No Show Fee</span>
                                    <span className="font-medium">
                                        {payer.noShowFee 
                                            ? `$${parseFloat(payer.noShowFee).toFixed(2)}`
                                            : 'Not set'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Terms</span>
                                    <span className="font-medium">
                                        Net {payer.paymentTermsDays || 30} days
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes Card */}
                        {payer.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {payer.notes}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right column - 2/3 of space */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Language Rates Card */}
                        <Card>
                            <CardHeader className="pb-4 flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle>Language Rates</CardTitle>
                                    <CardDescription>
                                        Custom hourly rates by language
                                    </CardDescription>
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={() => newPayerRate.onOpen(payerId)}
                                >
                                    <Plus className="size-4 mr-2" />
                                    Add Language Rate
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {payer.languageRates && payer.languageRates.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Language</TableHead>
                                                <TableHead>Hourly Rate</TableHead>
                                                <TableHead>Min Hours</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payer.languageRates.map((rate) => (
                                                <LanguageRateRow 
                                                    key={rate.id} 
                                                    rate={rate} 
                                                    payerId={payerId}
                                                    onEdit={() => openPayerRate.onOpen(payerId, rate.id)}
                                                />
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No language-specific rates configured.</p>
                                        <p className="text-sm">Default rate of ${payer.defaultHourlyRate || '0.00'}/hr will be used for all languages.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats Cards - Placeholder for future invoice stats */}
                        <div className="grid gap-4 grid-cols-2">
                            <Card>
                                <CardContent className="flex flex-col p-6">
                                    <span className="text-sm text-muted-foreground">Total Invoiced</span>
                                    <span className="text-2xl font-bold">$0.00</span>
                                    <span className="text-xs text-muted-foreground">Coming soon</span>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex flex-col p-6">
                                    <span className="text-sm text-muted-foreground">Outstanding</span>
                                    <span className="text-2xl font-bold">$0.00</span>
                                    <span className="text-xs text-muted-foreground">Coming soon</span>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Separate component for language rate row with delete functionality
type LanguageRateRowProps = {
    rate: {
        id: string;
        language: string;
        hourlyRate: string;
        minimumHours: string | null;
    };
    payerId: string;
    onEdit: () => void;
};

const LanguageRateRow = ({ rate, payerId, onEdit }: LanguageRateRowProps) => {
    const deleteMutation = useDeletePayerRate(payerId, rate.id);
    const [ConfirmDialog, confirm] = useConfirm(
        'Delete this language rate?',
        `This will remove the ${rate.language} rate. The default payer rate will be used instead.`
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) {
            deleteMutation.mutate();
        }
    };

    return (
        <>
            <ConfirmDialog />
            <TableRow>
                <TableCell className="font-medium">{rate.language}</TableCell>
                <TableCell>${parseFloat(rate.hourlyRate).toFixed(2)}/hr</TableCell>
                <TableCell>
                    {rate.minimumHours 
                        ? `${parseFloat(rate.minimumHours)} hrs`
                        : '-'}
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={onEdit}
                            disabled={deleteMutation.isPending}
                        >
                            <Edit className="size-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash className="size-4" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        </>
    );
};

export default PayerDetailPage;