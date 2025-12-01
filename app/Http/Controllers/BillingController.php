<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Cashier;

class BillingController extends Controller
{
    /**
     * Display the user's billing dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $subscription = $user->subscription('default');
        $defaultPaymentMethod = null;
        $intent = null;
        
        try {
            $defaultPaymentMethod = $user->defaultPaymentMethod();
            $intent = $user->createSetupIntent();
        } catch (\Exception $e) {
            // Log Stripe API errors but continue to render the page
            \Log::warning('Stripe API error in billing index', ['error' => $e->getMessage()]);
        }
        
        return Inertia::render('billing/index', [
            'subscription' => $subscription ? [
                'name' => $subscription->name,
                'stripe_status' => $subscription->stripe_status,
                'stripe_price' => $subscription->stripe_price,
                'quantity' => $subscription->quantity,
                'trial_ends_at' => $subscription->trial_ends_at,
                'ends_at' => $subscription->ends_at,
                'on_grace_period' => $subscription->onGracePeriod(),
                'on_trial' => $subscription->onTrial(),
            ] : null,
            'paymentMethod' => $defaultPaymentMethod && $defaultPaymentMethod->card ? [
                'brand' => $defaultPaymentMethod->card->brand,
                'last_four' => $defaultPaymentMethod->card->last4,
                'exp_month' => $defaultPaymentMethod->card->exp_month,
                'exp_year' => $defaultPaymentMethod->card->exp_year,
            ] : null,
            'intent' => $intent,
        ]);
    }

    /**
     * Display available pricing plans.
     */
    public function plans(): Response
    {
        $intent = null;
        
        try {
            $intent = auth()->user()->createSetupIntent();
        } catch (\Exception $e) {
            \Log::warning('Stripe API error in billing plans', ['error' => $e->getMessage()]);
        }
        
        return Inertia::render('billing/plans', [
            'intent' => $intent,
            'preselected_plan' => session('selected_plan'),
            'plans' => config('plans'),
        ]);
    }

    /**
     * Create a new subscription.
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'plan' => 'required|string',
        ]);

        $user = $request->user();

        try {
            $user->newSubscription('default', $request->plan)
                ->create($request->payment_method);

            return redirect()->route('billing.index')->with('success', 'Subscription created successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create subscription: ' . $e->getMessage());
        }
    }

    /**
     * Update the user's payment method.
     */
    public function updatePaymentMethod(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
        ]);

        try {
            $request->user()->updateDefaultPaymentMethod($request->payment_method);

            return back()->with('success', 'Payment method updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update payment method: ' . $e->getMessage());
        }
    }

    /**
     * Cancel the user's subscription.
     */
    public function cancel(Request $request)
    {
        $subscription = $request->user()->subscription('default');

        if (!$subscription) {
            return back()->with('error', 'No active subscription found.');
        }

        try {
            $subscription->cancel();

            return back()->with('success', 'Subscription canceled. You can continue using it until the end of your billing period.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to cancel subscription: ' . $e->getMessage());
        }
    }

    /**
     * Resume a canceled subscription.
     */
    public function resume(Request $request)
    {
        $subscription = $request->user()->subscription('default');

        if (!$subscription || !$subscription->onGracePeriod()) {
            return back()->with('error', 'No canceled subscription found.');
        }

        try {
            $subscription->resume();

            return back()->with('success', 'Subscription resumed successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to resume subscription: ' . $e->getMessage());
        }
    }

    /**
     * Display the user's invoices.
     */
    public function invoices(Request $request): Response
    {
        $invoices = $request->user()->invoicesIncludingPending();

        return Inertia::render('billing/invoices', [
            'invoices' => collect($invoices)->map(fn($invoice) => [
                'id' => $invoice->id,
                'date' => $invoice->date(),
                'total' => $invoice->total(),
                'status' => $invoice->status,
            ]),
        ]);
    }

    /**
     * Download an invoice PDF.
     */
    public function downloadInvoice(Request $request, string $invoiceId)
    {
        return $request->user()->downloadInvoice($invoiceId, [
            'vendor' => config('app.name'),
            'product' => 'Subscription',
        ]);
    }
}
