import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import heroImage from '../../../newimages/1.png';

const cards = [
    {
        title: 'How it works',
        items: ['We listen', 'AI tries first', 'If it gets hard, a person joins', 'You get it solved', 'No repeat. No fuss'],
    },
    {
        title: 'Why Tandem',
        items: ['No dead ends', 'No “say that again”', 'Help that feels human'],
    },
    {
        title: 'What you get',
        items: [
            'Speed: Quick answers for simple stuff',
            'Care: A human for the hard stuff',
            'Trust: You see the handoff',
            'Clarity: One clean thread with notes',
        ],
    },
];

const benefitCards = [
    { title: 'For customers', items: ['Get help fast', 'Talk to a person when you need one', 'Keep your time'] },
    { title: 'For teams', items: ['Do less busy work', 'Do the work that matters', 'Go home proud'] },
    { title: 'For leaders', items: ['Cut cost', 'Raise scores', 'Stay in control'] },
    { title: 'Trust and safety', items: ['Your data stays safe', 'We hide private info', 'You can see every change'] },
];

const differentiators = [
    { title: 'Clear handoff', blurb: 'You see when a person jumps in' },
    { title: 'Full story', blurb: 'We keep the chat and the notes' },
    { title: 'Smart rules', blurb: 'You choose when to hand off' },
    { title: 'Right person', blurb: 'Skills match the case' },
    { title: 'On time', blurb: 'We track goals and alerts' },
    { title: 'Proof', blurb: 'Logs for every step' },
];

const testimonials = ['“No more loops.”', '“I got my time back.”', '“Our team is less tired and does better work.”'];

const faqs = [
    { question: 'Do I get a human?', answer: 'Yes, when it counts.' },
    { question: 'Will I have to repeat?', answer: 'No. We share notes.' },
    { question: 'Can I set rules?', answer: 'Yes. You pick when to hand off.' },
    { question: 'Is it fast to start?', answer: 'Yes. Simple setup.' },
    { question: 'Is my data safe?', answer: 'Yes. We protect it.' },
];

function ListCard({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
            <ul className="list-inside list-disc space-y-2 text-sm text-neutral-600">
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Tandem | AI speed. Human judgment.">
                <meta name="description" content="Tandem pairs fast AI support with real people when it counts." />
            </Head>
            <div className="min-h-screen bg-white text-neutral-900">
                <header className="border-b border-neutral-200">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                        <span className="text-lg font-semibold tracking-[0.3em]">TANDEM</span>
                        <nav className="text-sm font-medium">
                            {auth.user ? (
                                <Link href={dashboard()} className="rounded-md border border-neutral-300 px-4 py-2 transition hover:border-neutral-500">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={login()} className="px-4 py-2 transition hover:text-neutral-600">
                                    Log in
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex flex-col gap-20">
                    <section className="bg-gradient-to-b from-white to-neutral-100 py-20">
                        <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
                            <div className="space-y-6 text-center lg:text-left">
                                <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Quick AI answers. Real people for hard stuff.</h1>
                                <p className="text-lg text-neutral-600">AI helps you first. Then a real person takes over when you need them.</p>
                                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start sm:gap-4">
                                    <a
                                        href="#demo"
                                        className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-700 sm:w-auto"
                                    >
                                        See a demo
                                    </a>
                                    <a
                                        href="#contact"
                                        className="w-full rounded-lg border border-neutral-900 px-6 py-3 text-center text-sm font-semibold transition hover:bg-neutral-100 sm:w-auto"
                                    >
                                        Talk to sales
                                    </a>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src={heroImage}
                                    alt="Customer celebrating Tandem support"
                                    className="w-full max-w-xl rounded-[40px] border border-neutral-200 shadow-xl"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="py-20">
                        <div className="container mx-auto max-w-6xl px-6">
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {cards.map((card) => (
                                    <ListCard key={card.title} title={card.title} items={card.items} />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-neutral-100 py-20">
                        <div className="container mx-auto max-w-6xl px-6">
                            <div className="grid gap-8 md:grid-cols-2">
                                {benefitCards.map((card) => (
                                    <ListCard key={card.title} title={card.title} items={card.items} />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-20">
                        <div className="container mx-auto max-w-5xl px-6 text-center">
                            <h2 className="text-3xl font-bold">Why it&apos;s different</h2>
                            <div className="mt-12 grid gap-10 md:grid-cols-2">
                                {differentiators.map(({ title, blurb }) => (
                                    <div key={title} className="space-y-2 text-left">
                                        <h4 className="text-lg font-semibold">{title}</h4>
                                        <p className="text-sm text-neutral-600">{blurb}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-neutral-900 py-20 text-white">
                        <div className="container mx-auto max-w-5xl px-6 text-center">
                            <h2 className="text-3xl font-bold">What people say</h2>
                            <div className="mt-12 grid gap-10 md:grid-cols-3">
                                {testimonials.map((quote) => (
                                    <blockquote key={quote} className="text-xl italic">{quote}</blockquote>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-20">
                        <div className="container mx-auto max-w-4xl px-6">
                            <h2 className="text-3xl font-bold text-center">Questions</h2>
                            <div className="mt-12 space-y-8">
                                {faqs.map(({ question, answer }) => (
                                    <div key={question} className="border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0">
                                        <h4 className="text-lg font-semibold text-neutral-900">{question}</h4>
                                        <p className="mt-2 text-sm text-neutral-600">{answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="contact" className="bg-neutral-100 py-20">
                        <div className="container mx-auto max-w-4xl px-6 text-center">
                            <h2 className="text-3xl font-bold">Ready to see Tandem?</h2>
                            <p className="mt-4 text-lg text-neutral-600">Book a live walkthrough or connect with our team.</p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <a
                                    id="demo"
                                    href="#demo"
                                    className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-700 sm:w-auto"
                                >
                                    See a demo
                                </a>
                                <a
                                    href="#contact"
                                    className="w-full rounded-lg border border-neutral-900 px-6 py-3 text-center text-sm font-semibold transition hover:bg-neutral-200 sm:w-auto"
                                >
                                    Talk to sales
                                </a>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
