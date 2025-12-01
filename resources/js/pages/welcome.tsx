import MarketingLayout from '@/layouts/MarketingLayout';
import { Bot, Shield, Zap } from 'lucide-react';

export default function Welcome() {
    return (
        <MarketingLayout title="Tandem | The Future of AI Support">
            <div className="container mx-auto max-w-5xl text-center px-6">

                <h1 className="mx-auto max-w-4xl text-6xl font-bold leading-tight sm:text-7xl tracking-tight mb-6 text-slate-900 drop-shadow-sm">
                    Where Calm <br />
                    <span className="text-blue-700">Meets Intelligence</span>
                </h1>

                <p className="mx-auto max-w-2xl text-lg text-slate-700 mb-8 font-medium">
                    Premium AI support, crafted just for your team.
                </p>

                {/* CTA Button */}
                <div className="mb-16">
                    <a
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transition-all hover:scale-105"
                    >
                        Buy Now
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>

                {/* Glass Action Bar */}
                <div className="mx-auto max-w-3xl rounded-2xl border border-white/50 bg-white/30 backdrop-blur-xl p-2 shadow-2xl shadow-blue-900/5 flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 rounded-xl bg-white/40 border border-white/40 px-6 py-4 text-left hover:bg-white/60 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3 mb-1">
                            <Zap className="h-4 w-4 text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Speed</span>
                        </div>
                        <div className="font-medium text-slate-900">Instant Resolution</div>
                    </div>

                    <div className="flex-1 rounded-xl bg-white/40 border border-white/40 px-6 py-4 text-left hover:bg-white/60 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3 mb-1">
                            <Bot className="h-4 w-4 text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Intelligence</span>
                        </div>
                        <div className="font-medium text-slate-900">Human-Level AI</div>
                    </div>

                    <div className="flex-1 rounded-xl bg-white/40 border border-white/40 px-6 py-4 text-left hover:bg-white/60 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3 mb-1">
                            <Shield className="h-4 w-4 text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trust</span>
                        </div>
                        <div className="font-medium text-slate-900">Seamless Handoff</div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
