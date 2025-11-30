import MarketingLayout from '@/layouts/MarketingLayout';

export default function About() {
    return (
        <MarketingLayout title="About | Tandem">
            <div className="container mx-auto max-w-4xl px-6 py-20">
                <div className="text-center mb-32 mt-12">
                    <h1 className="text-5xl font-bold text-slate-900 mb-8">Our Vision</h1>
                    <p className="text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
                        We believe the future of work isn't replacing humans with AI—it's creating a powerful tandem where AI handles the scale and humans handle the nuance.
                    </p>
                </div>

                <div className="space-y-32">
                    {/* Mission Section */}
                    <section className="rounded-3xl border border-white/40 bg-white/20 backdrop-blur-xl p-10 md:p-16 shadow-xl shadow-blue-900/5">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Why we built Tandem</h2>
                        <div className="space-y-6 text-lg text-slate-700">
                            <p>
                                Support teams are drowning. Volume is up, expectations are higher, but headcount is flat. The promise of "100% automation" often leads to frustrated customers and hallucinations.
                            </p>
                            <p>
                                We built Tandem to bridge the gap. We wanted a system where AI could do the heavy lifting—triaging, answering FAQs, and gathering context—but knew when to step back.
                            </p>
                            <p>
                                Our platform treats the "handoff" not as a failure, but as a first-class feature. It ensures that every complex, sensitive, or high-value conversation gets the human touch it deserves, instantly.
                            </p>
                        </div>
                    </section>

                    {/* Values Grid */}
                    <section>
                        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Our Core Values</h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="p-8 rounded-2xl bg-white/30 border border-white/40 backdrop-blur-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Trust Above All</h3>
                                <p className="text-slate-600">
                                    We prioritize accuracy and safety over raw speed. If the AI isn't sure, it asks for help. No guessing.
                                </p>
                            </div>
                            <div className="p-8 rounded-2xl bg-white/30 border border-white/40 backdrop-blur-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Human in the Loop</h3>
                                <p className="text-slate-600">
                                    Technology should amplify human expertise, not erase it. We build tools that make agents superpowers.
                                </p>
                            </div>
                            <div className="p-8 rounded-2xl bg-white/30 border border-white/40 backdrop-blur-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Transparent AI</h3>
                                <p className="text-slate-600">
                                    No black boxes. You should always know why an agent made a decision and have the power to correct it.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Team/Stats Section */}
                    <section className="text-center pt-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <div className="text-4xl font-bold text-blue-600 mb-2">100M+</div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Messages Processed</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Auto-Resolution</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Uptime</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Support</div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </MarketingLayout>
    );
}
