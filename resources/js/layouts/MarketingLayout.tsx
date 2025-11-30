import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, LayoutDashboard, Menu } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

export default function MarketingLayout({ children, title }: PropsWithChildren<{ title: string }>) {
    const { auth } = usePage<SharedData>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title={title} />
            
            {/* Main Background Image Container */}
            <div className="fixed inset-0 z-0">
                <img 
                    src="/images/hero-bg.png" 
                    alt="Background" 
                    className="w-full h-full object-cover object-center"
                />
                {/* Overlay to ensure text readability if image is too bright/dark */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60" />
            </div>

            <div className="relative min-h-screen font-sans text-slate-900 selection:bg-blue-500 selection:text-white overflow-x-hidden flex flex-col">
                
                {/* Floating Glass Header */}
                <header className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center">
                    <nav className="w-full max-w-6xl rounded-full border border-white/40 bg-white/20 backdrop-blur-xl shadow-lg shadow-black/5 transition-all hover:bg-white/40 hover:border-white/50">
                        <div className="flex items-center justify-between px-8 py-4">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2">
                                <span className="text-xl font-bold tracking-tight text-slate-900">Tandem</span>
                            </Link>

                            {/* Desktop Nav */}
                            <div className="hidden md:flex items-center gap-10">
                                <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Home</Link>
                                <Link href="/how-it-works" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">How it works</Link>
                                <Link href="/pricing" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Pricing</Link>
                                <Link href="/about" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">About</Link>
                            </div>

                            {/* Auth / User */}
                            <div className="hidden md:flex items-center gap-4">
                                {auth.user ? (
                                    <Link 
                                        href={dashboard()} 
                                        className="group flex items-center gap-2 rounded-full border border-white/30 bg-white/30 px-4 py-2 text-sm font-medium text-slate-900 backdrop-blur-md transition-all hover:bg-white/50"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                ) : (
                                    <Link 
                                        href={login()} 
                                        className="group flex items-center gap-2 rounded-full border border-white/30 bg-white/30 px-4 py-2 text-sm font-medium text-slate-900 backdrop-blur-md transition-all hover:bg-white/50"
                                    >
                                        <span className="h-8 w-8 rounded-full bg-white/50 flex items-center justify-center shadow-sm">
                                            <ArrowRight className="h-4 w-4 text-slate-900" />
                                        </span>
                                        <span>Log in</span>
                                    </Link>
                                )}
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button 
                                className="md:hidden p-2 text-slate-700"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </nav>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-32 px-6 md:hidden">
                        <div className="flex flex-col gap-6 text-center">
                            <Link href="/" className="text-xl text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                            <Link href="/how-it-works" className="text-xl text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>How it works</Link>
                            <Link href="/pricing" className="text-xl text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                            <Link href="/about" className="text-xl text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                            {auth.user ? (
                                <Link href={dashboard()} className="text-xl text-blue-600">Dashboard</Link>
                            ) : (
                                <Link href={login()} className="text-xl text-blue-600">Log in</Link>
                            )}
                        </div>
                    </div>
                )}

                <main className="relative z-10 flex-grow flex flex-col pt-40 pb-20">
                    {children}
                </main>

                {/* Footer Area */}
                <footer className="relative z-10 border-t border-white/20 bg-white/10 backdrop-blur-lg py-6 mt-auto">
                    <div className="container mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="text-slate-600 text-sm font-medium">
                            &copy; {new Date().getFullYear()} Tandem AI.
                        </div>
                        <div className="flex gap-6 text-sm font-medium text-slate-600">
                             <a href="#" className="hover:text-slate-900">Privacy</a>
                             <a href="#" className="hover:text-slate-900">Terms</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
