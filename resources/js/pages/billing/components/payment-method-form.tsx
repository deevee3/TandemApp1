import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';

// Initialize Stripe - this should be done outside the component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

interface PaymentFormProps {
    clientSecret: string;
    onSuccess?: () => void;
}

function PaymentForm({ clientSecret, onSuccess }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

            // Update payment method on the backend
            const paymentMethodId = typeof setupIntent.payment_method === 'string'
                ? setupIntent.payment_method
                : setupIntent.payment_method?.id;

            router.post('/billing/payment-method', {
                payment_method: paymentMethodId as string,
            }, {
                onSuccess: () => {
                    setLoading(false);
                    if (onSuccess) onSuccess();
                },
                onError: () => {
                    setError('Failed to update payment method');
                    setLoading(false);
                },
            });
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            <Button type="submit" disabled={!stripe || loading} className="w-full">
                {loading ? 'Processing...' : 'Save Payment Method'}
            </Button>
        </form>
    );
}

export default function PaymentMethodForm({ clientSecret }: PaymentFormProps) {
    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <PaymentForm clientSecret={clientSecret} />
        </Elements>
    );
}
