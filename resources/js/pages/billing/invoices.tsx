import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import { PageProps } from '@/types';

interface Invoice {
    id: string;
    date: string;
    total: string;
    status: string;
}

interface InvoicesPageProps extends PageProps {
    invoices: Invoice[];
}

export default function BillingInvoices({ invoices }: InvoicesPageProps) {
    return (
        <AppLayout>
            <Head title="Invoices" />

            <div className="container mx-auto py-8 max-w-4xl">
                <div className="mb-8">
                    <Link href="/billing">
                        <Button variant="ghost" className="mb-4">← Back to Billing</Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Invoices</h1>
                    <p className="text-muted-foreground mt-2">View and download your billing history</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                        <CardDescription>All your invoices and receipts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.length > 0 ? (
                            <div className="space-y-3">
                                {invoices.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{invoice.date}</p>
                                                <p className="text-sm text-muted-foreground capitalize">
                                                    {invoice.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-semibold">{invoice.total}</p>
                                            <Link href={`/billing/invoice/${invoice.id}`}>
                                                <Button size="sm" variant="outline">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No invoices yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
