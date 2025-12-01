import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import OnboardingLayout from '@/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PageProps } from '@/types';
import { useState, FormEvent } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
    popular?: boolean;
}

interface PlansPageProps extends PageProps {
    plans: Plan[];
    intent: {
        client_secret: string;
    } | null;
    preselected_plan?: string;
}

interface SubscribeFormProps {
    plan: Plan;
    clientSecret: string;
    onCancel: () => void;
}

function SubscribeForm({ plan, clientSecret, onCancel }: SubscribeFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [elementReady, setElementReady] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setError(submitError.message || 'An error occurred');
                setLoading(false);
                return;
            }

            const { error: confirmError, setupIntent } = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: window.location.href,
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                setError(confirmError.message || 'Payment confirmation failed');
                setLoading(false);
                return;
            }

            // Create subscription with payment method
            const paymentMethodId = typeof setupIntent.payment_method === 'string'
                ? setupIntent.payment_method
                : setupIntent.payment_method?.id;

            router.post('/billing/subscribe', {
                payment_method: paymentMethodId as string,
                plan: plan.id,
            }, {
                onError: () => {
                    setError('Failed to create subscription');
                    setLoading(false);
                },
            });
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Subscribe to {plan.name}</CardTitle>
                    <CardDescription>
                        ${plan.price}/{plan.interval}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="min-h-[200px]">
                            {!elementReady && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <span className="ml-3 text-sm text-muted-foreground">Loading payment form...</span>
                                </div>
                            )}
                            <PaymentElement 
                                onReady={() => setElementReady(true)} 
                                onLoadError={(e) => setError(`Failed to load payment form: ${e.error.message}`)}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!stripe || !elementReady || loading} className="flex-1">
                                {loading ? 'Processing...' : 'Subscribe'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function BillingPlans({ plans, intent, preselected_plan, auth }: PlansPageProps) {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(() => {
        if (preselected_plan) {
            return plans.find(p => p.id === preselected_plan) || null;
        }
        return null;
    });

    const options = intent ? {
        clientSecret: intent.client_secret,
        appearance: {
            theme: 'stripe' as const,
        },
    } : null;

    const Layout = auth.user.subscribed ? AppLayout : OnboardingLayout;

    return (
        <Layout>
            <Head title="Pricing Plans" />

            <div className="container mx-auto py-8 max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
                    <p className="text-xl text-muted-foreground">
                        Select the perfect plan for your needs
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-primary">Most Popular</Badge>
                                </div>
                            )}

                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">${plan.price}</span>
                                    <span className="text-muted-foreground">/{plan.interval}</span>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.popular ? 'default' : 'outline'}
                                    onClick={() => setSelectedPlan(plan)}
                                >
                                    Get Started
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            {selectedPlan && intent && options && stripePromise && (
                <Elements stripe={stripePromise} options={options}>
                    <SubscribeForm
                        plan={selectedPlan}
                        clientSecret={intent.client_secret}
                        onCancel={() => setSelectedPlan(null)}
                    />
                </Elements>
            )}

            {selectedPlan && (!intent || !stripePromise) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Payment Unavailable</CardTitle>
                            <CardDescription>
                                {!stripePromise 
                                    ? 'Stripe is not configured. Please contact support.'
                                    : 'Unable to initialize payment. Please try again later or contact support.'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="outline" onClick={() => setSelectedPlan(null)} className="w-full">
                                Close
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </Layout>
    );
}
