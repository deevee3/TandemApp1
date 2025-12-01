import MarketingLayout from '@/layouts/MarketingLayout';
import { Link } from '@inertiajs/react';
import { Check, Shield, Zap } from 'lucide-react';

export default function Pricing() {
    const plans = [
        {
            name: 'Starter',
            price: '$49',
            period: '/month',
            description: 'Perfect for small teams starting with AI support.',
            features: [
                'Up to 1,000 conversations/mo',
                'Basic Agent Runner',
                'Standard Routing',
                '7-day Audit History',
                'Email Support',
            ],
            cta: 'Start Free Trial',
            highlight: false,
        },
        {
            name: 'Pro',
            price: '$199',
            period: '/month',
            description: 'For growing teams needing control and quality.',
            features: [
                'Up to 10,000 conversations/mo',
                'Advanced Skills Routing',
                'Risk-Based QA Sampling',
                'Policy & PII Guardrails',
                '90-day Audit History',
                'Slack Connect',
            ],
            cta: 'Get Started',
            highlight: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'Full compliance, SLAs, and dedicated support.',
            features: [
                'Unlimited conversations',
                'Custom LLM Fine-tuning',
                'SLA Management & Alerts',
                'SSO & RBAC',
                'HIPAA / SOC2 Compliance',
                'Dedicated Success Manager',
            ],
            cta: 'Contact Sales',
            highlight: false,
        },
    ];

    return (
        <MarketingLayout title="Pricing | Tandem">
            <div className="container mx-auto max-w-6xl px-6 py-20">
                <div className="text-center mb-24">
                    <h1 className="text-5xl font-bold text-slate-900 mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-slate-700 max-w-2xl mx-auto">
                        Start small and scale your hybrid workforce. No hidden fees for handoffs.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3 mb-32">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col rounded-3xl border p-8 transition-all hover:-translate-y-1 shadow-xl ${plan.highlight
                                ? 'bg-white/60 border-blue-200 shadow-blue-900/10 scale-105 z-10'
                                : 'bg-white/30 border-white/40 shadow-blue-900/5'
                                } backdrop-blur-xl`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>
                                <p className="mt-4 text-sm text-slate-600">{plan.description}</p>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                        <Check className="h-5 w-5 text-blue-600 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={`/login?plan=${plan.name === 'Starter' ? 'price_basic' :
                                    plan.name === 'Pro' ? 'price_pro' :
                                        'price_enterprise'
                                    }`}
                                className={`block w-full text-center rounded-xl py-3 text-sm font-semibold transition-all ${plan.highlight
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                                    : 'bg-white/50 text-slate-900 hover:bg-white/80 border border-white/50'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-0 text-center rounded-3xl border border-white/40 bg-white/20 backdrop-blur-md p-12 shadow-lg shadow-blue-900/5">
                    <h2 className="text-2xl font-bold text-slate-900 mb-12">Included in Every Plan</h2>
                    <div className="grid gap-12 sm:grid-cols-3 max-w-5xl mx-auto">
                        <div className="space-y-4">
                            <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                <Shield className="h-7 w-7" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">Security First</h3>
                            <p className="text-slate-600 leading-relaxed">Data encryption at rest and in transit. We never train on your data without permission.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="mx-auto h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                                <Zap className="h-7 w-7" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">Instant Setup</h3>
                            <p className="text-slate-600 leading-relaxed">Connect your existing tools in minutes. No engineering required.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="mx-auto h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
                                <Check className="h-7 w-7" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">99.9% Uptime</h3>
                            <p className="text-slate-600 leading-relaxed">Enterprise-grade infrastructure designed for mission-critical support.</p>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
