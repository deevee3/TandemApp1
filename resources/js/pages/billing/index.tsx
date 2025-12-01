import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { PageProps } from '@/types';
import { useState } from 'react';
import PaymentMethodForm from './components/payment-method-form';

interface Subscription {
    name: string;
    stripe_status: string;
    stripe_price: string;
    quantity: number;
    trial_ends_at: string | null;
    ends_at: string | null;
    on_grace_period: boolean;
    on_trial: boolean;
}

interface PaymentMethod {
    brand: string;
    last_four: string;
    exp_month: number;
    exp_year: number;
}

interface BillingPageProps extends PageProps {
    subscription: Subscription | null;
    paymentMethod: PaymentMethod | null;
    intent: {
        client_secret: string;
    };
}

export default function BillingIndex({ subscription, paymentMethod, intent }: BillingPageProps) {
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
            router.post('/billing/cancel');
        }
    };

    const handleResume = () => {
        router.post('/billing/resume');
    };

    const getStatusBadge = () => {
        if (!subscription) return null;

        if (subscription.on_trial) {
            return <Badge variant="default">Trial</Badge>;
        }

        if (subscription.on_grace_period) {
            return <Badge variant="destructive">Canceled</Badge>;
        }

        if (subscription.stripe_status === 'active') {
            return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
        }

        return <Badge variant="secondary">{subscription.stripe_status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Billing" />

            <div className="container mx-auto py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Billing & Subscription</h1>
                    <p className="text-muted-foreground mt-2">Manage your subscription and payment methods</p>
                </div>

                <div className="space-y-6">
                    {/* Subscription Status Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Current Subscription</CardTitle>
                                {getStatusBadge()}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {subscription ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Plan</p>
                                            <p className="text-lg font-semibold capitalize">{subscription.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                                            <p className="text-lg font-semibold capitalize">{subscription.stripe_status}</p>
                                        </div>
                                    </div>

                                    {subscription.trial_ends_at && subscription.on_trial && (
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <p className="text-sm">
                                                Trial ends on {new Date(subscription.trial_ends_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {subscription.ends_at && subscription.on_grace_period && (
                                        <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                            <AlertCircle className="h-4 w-4 text-orange-600" />
                                            <p className="text-sm">
                                                Your subscription will end on {new Date(subscription.ends_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t">
                                        <Link href="/billing/plans">
                                            <Button variant="outline">Change Plan</Button>
                                        </Link>
                                        {subscription.on_grace_period ? (
                                            <Button onClick={handleResume}>Resume Subscription</Button>
                                        ) : (
                                            <Button variant="destructive" onClick={handleCancel}>Cancel Subscription</Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
                                    <Link href="/billing/plans">
                                        <Button>View Plans</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Method Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                            <CardDescription>Manage your payment information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {paymentMethod && !showPaymentForm ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="font-medium capitalize">{paymentMethod.brand} •••• {paymentMethod.last_four}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" onClick={() => setShowPaymentForm(true)}>
                                        Update Payment Method
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paymentMethod && (
                                        <Button variant="ghost" onClick={() => setShowPaymentForm(false)} className="mb-4">
                                            ← Back
                                        </Button>
                                    )}
                                    <PaymentMethodForm clientSecret={intent.client_secret} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoices Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices</CardTitle>
                            <CardDescription>View and download your billing history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/billing/invoices">
                                <Button variant="outline">View All Invoices</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
