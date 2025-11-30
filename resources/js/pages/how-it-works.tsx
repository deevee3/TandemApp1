import MarketingLayout from '@/layouts/MarketingLayout';
import { Bot, CheckCircle2, GitMerge, ShieldAlert, UserCheck } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: Bot,
            title: '1. Agent Runner Intercepts',
            description: 'The Agent Runner consumes every new message. It attempts to resolve the case using your tools and knowledge base, handling up to 80% of volume instantly.',
        },
        {
            icon: ShieldAlert,
            title: '2. Risk & Confidence Checks',
            description: 'If the agent detects low confidence, policy violations (PII), or high-risk topics, it automatically triggers a "Handoff" event instead of guessing.',
        },
        {
            icon: GitMerge,
            title: '3. Skills-Based Routing',
            description: 'The router assigns the case to the right human queue based on required skills and SLA priority. No cherry-picking; just efficient assignment.',
        },
        {
            icon: UserCheck,
            title: '4. Human Resolution & Loop',
            description: 'A human expert reviews the transcript, resolves the issue, or—crucially—returns control to the agent to finish up, teaching it for next time.',
        },
    ];

    return (
        <MarketingLayout title="How it Works | Tandem">
            <div className="container mx-auto max-w-5xl px-6">
                <div className="text-center mb-20">
                    <h1 className="text-5xl font-bold text-slate-900 mb-6">From AI to Human, Seamlessly.</h1>
                    <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
                        Tandem isn't just a chatbot. It's a state machine for support that guarantees high-quality outcomes by enforcing human oversight when it matters most.
                    </p>
                </div>

                <div className="relative grid gap-8 md:grid-cols-2 lg:gap-12 mb-32">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent -z-10" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative group rounded-2xl border border-white/40 bg-white/30 backdrop-blur-xl p-8 transition-all hover:bg-white/60 hover:-translate-y-1 shadow-lg shadow-blue-900/5">
                            <div className="absolute -top-6 left-8 h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <step.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute top-4 right-4 text-6xl font-bold text-slate-900/5 select-none">
                                0{index + 1}
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>

                {/* Workflow Diagram Section */}
                <div className="rounded-3xl border border-white/40 bg-white/20 backdrop-blur-md p-10 md:p-16 text-center shadow-xl shadow-blue-900/5">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12">The Handoff Protocol</h2>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-left">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Low Confidence Handoff</h4>
                                    <p className="text-sm text-slate-600">When the LLM is unsure (score &lt; 0.8), it doesn't hallucinate. It asks for help.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <ShieldAlert className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Policy & PII Flags</h4>
                                    <p className="text-sm text-slate-600">Sensitive topics or PII detection instantly route to the Compliance Queue.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Return to Agent</h4>
                                    <p className="text-sm text-slate-600">Humans can solve the hard part, then tag the Agent back in to handle the paperwork.</p>
                                </div>
                            </div>
                        </div>

                        {/* Abstract Visual Representation */}
                        <div className="flex-1 w-full max-w-sm aspect-square rounded-full border border-blue-200/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center relative animate-pulse-slow">
                            <div className="absolute inset-0 rounded-full border border-white/40 animate-spin-slower" />
                            <div className="text-center">
                                <p className="text-blue-900 font-bold text-lg">Hybrid Workflow</p>
                                <p className="text-blue-600/60 text-sm">AI Speed + Human Trust</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
