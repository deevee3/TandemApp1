import MarketingLayout from '@/layouts/MarketingLayout';
import { Head } from '@inertiajs/react';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    RadialLinearScale,
    Title,
    Tooltip
} from 'chart.js';
import { Check, Shield, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, Line, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Tandem() {
    // --- Navigation State ---
    const [activeSection, setActiveSection] = useState('intro');

    // --- Crisis Section State ---
    const [volume, setVolume] = useState(50);
    const burnout = Math.min(100, Math.floor(volume * 1.2));
    const csat = Math.max(1, (9.5 - (volume / 15)).toFixed(1));

    const crisisChartData = useMemo(() => {
        const volumeData = Array.from({ length: 12 }, (_, i) => {
            let base = volume * 0.5;
            return base + (i * (volume / 20));
        });

        return {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Ticket Volume',
                    data: volumeData,
                    borderColor: '#78716C', // Stone 500
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y',
                },
                {
                    label: 'CSAT',
                    data: volumeData.map(v => Math.max(1, 10 - (v / 12))),
                    borderColor: '#2563EB', // Blue 600
                    tension: 0.4,
                    yAxisID: 'y1',
                },
                {
                    label: 'Burnout Risk',
                    data: volumeData.map(v => Math.min(100, v * 1.1)),
                    borderColor: '#DC2626', // Red 600
                    tension: 0.4,
                    yAxisID: 'y',
                },
            ],
        };
    }, [volume]);

    const crisisChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: { display: true, text: 'Volume / Risk %' },
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                min: 0,
                max: 10,
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'CSAT Score' },
            },
        },
    };

    // --- Tandem Model State ---
    const [simulationStatus, setSimulationStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
    const [simulationData, setSimulationData] = useState({
        score: 0,
        intent: '---',
        sentiment: '---',
        complexity: '---',
        message: '',
        colorClass: 'bg-white border-stone-300',
        icon: '',
        barColor: 'bg-teal-600',
        scoreColor: 'text-stone-300',
    });

    const runSimulation = (type: 'simple' | 'complex' | 'edge') => {
        setSimulationStatus('analyzing');
        
        setTimeout(() => {
            let data;
            if (type === 'simple') {
                data = {
                    score: 92,
                    intent: "Order Status",
                    sentiment: "Neutral",
                    complexity: "Low",
                    message: "AI Resolution: Tandem retrieves order data instantly. No human needed.",
                    colorClass: "bg-teal-50 border-teal-500 text-teal-800",
                    icon: "⚡",
                    barColor: "bg-teal-600",
                    scoreColor: "text-teal-600"
                };
            } else if (type === 'complex') {
                data = {
                    score: 35,
                    intent: "Product Complaint",
                    sentiment: "Negative (High)",
                    complexity: "High",
                    message: "Human Handoff: Score below threshold (60%). Routing to Escalation Specialist.",
                    colorClass: "bg-amber-50 border-amber-500 text-amber-800",
                    icon: "🤝",
                    barColor: "bg-amber-500",
                    scoreColor: "text-amber-600"
                };
            } else {
                data = {
                    score: 55,
                    intent: "Tech Compatibility",
                    sentiment: "Confused",
                    complexity: "Medium",
                    message: "Proactive Alert: Score marginal. Tandem drafts a response but requests approval.",
                    colorClass: "bg-indigo-50 border-indigo-500 text-indigo-800",
                    icon: "🛡️",
                    barColor: "bg-indigo-500",
                    scoreColor: "text-indigo-600"
                };
            }
            setSimulationData(data);
            setSimulationStatus('complete');
        }, 1200);
    };

    // --- Competitor Radar Chart ---
    const competitorData = {
        labels: ['Automation Depth', 'Human Seamlessness', 'Empathy/Context', 'Setup Speed', 'Cost Efficiency'],
        datasets: [
            {
                label: 'Tandem',
                data: [80, 95, 90, 85, 85],
                fill: true,
                backgroundColor: 'rgba(13, 148, 136, 0.2)', // Teal
                borderColor: '#0D9488',
                pointBackgroundColor: '#0D9488',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#0D9488'
            },
            {
                label: 'Fin.ai',
                data: [90, 60, 50, 80, 70],
                fill: true,
                backgroundColor: 'rgba(156, 163, 175, 0.1)', // Stone/Grey
                borderColor: '#9CA3AF',
                pointBackgroundColor: '#9CA3AF',
                borderDash: [5, 5]
            },
            {
                label: 'Ada.cx',
                data: [95, 50, 40, 40, 60],
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue
                borderColor: '#3B82F6',
                borderDash: [2, 2]
            }
        ]
    };

    // --- ROI Calculator ---
    const [roiInputs, setRoiInputs] = useState({ agents: 50, cost: 25, deflection: 60 });
    const monthlyHours = 160;
    const totalCost = roiInputs.agents * roiInputs.cost * monthlyHours;
    const savings = totalCost * (roiInputs.deflection / 100);
    
    const roiChartData = {
        labels: ['Traditional Cost', 'Cost with Tandem'],
        datasets: [{
            label: 'Monthly Operational Spend ($)',
            data: [totalCost, totalCost - savings],
            backgroundColor: ['#78716C', '#0D9488'],
            borderRadius: 5
        }]
    };

    return (
        <MarketingLayout title="Tandem | The Hybrid Model">
            <div className="container mx-auto max-w-6xl px-4">
                
                {/* Sub Navigation */}
                <div className="sticky top-24 z-40 bg-white/80 backdrop-blur-md rounded-xl border border-stone-200 shadow-sm mb-12 p-1 flex justify-center space-x-2 md:space-x-8 overflow-x-auto">
                    {[
                        { id: 'intro', label: 'The Crisis' },
                        { id: 'model', label: 'The Tandem Model' },
                        { id: 'market', label: 'Competitors' },
                        { id: 'impact', label: 'Economic Impact' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                                activeSection === item.id 
                                ? 'bg-teal-50 text-teal-700 border border-teal-100 shadow-sm' 
                                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* SECTIONS */}
                <div className="space-y-24">
                    
                    {/* INTRO */}
                    <div className={activeSection === 'intro' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h1 className="text-4xl font-extrabold text-stone-900 sm:text-5xl mb-6">The Crisis of Scale</h1>
                            <p className="text-xl text-stone-600">
                                The demand for instant, 24/7 support is breaking the traditional model. Scale is currently the enemy of quality.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                                <h3 className="text-lg font-semibold mb-4 text-stone-800">The Dilemma Visualization</h3>
                                <p className="text-sm text-stone-500 mb-6">Adjust "Incoming Volume" to see impact on Burnout & CSAT.</p>
                                
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm font-medium text-stone-700 mb-2">
                                        <span>Incoming Ticket Volume</span>
                                        <span>{volume}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" max="100" 
                                        value={volume} 
                                        onChange={(e) => setVolume(parseInt(e.target.value))}
                                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                    />
                                    <div className="flex justify-between text-xs text-stone-400 mt-1">
                                        <span>Manageable</span>
                                        <span>Overwhelming</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                        <div className="text-xs text-stone-500 uppercase">Agent Burnout</div>
                                        <div className="text-2xl font-bold text-red-600">{burnout}%</div>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="text-xs text-stone-500 uppercase">CSAT Score</div>
                                        <div className="text-2xl font-bold text-blue-600">{csat}</div>
                                    </div>
                                </div>

                                <div className="h-64">
                                    <Line data={crisisChartData} options={crisisChartOptions} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="border-l-4 border-teal-500 pl-4">
                                    <h4 className="font-bold text-lg text-stone-800">The "Human-Only" Failure Mode</h4>
                                    <p className="text-stone-600 mt-1">Humans are empathetic generalists, not high-speed data processors. Forcing them to handle volume leads to fatigue and errors.</p>
                                </div>
                                <div className="border-l-4 border-amber-500 pl-4">
                                    <h4 className="font-bold text-lg text-stone-800">The "Bot-Only" Failure Mode</h4>
                                    <p className="text-stone-600 mt-1">Traditional bots deflect well but fail catastrophically on complex issues, leaving customers feeling trapped.</p>
                                </div>
                                <div className="bg-stone-100 p-6 rounded-lg border border-stone-200">
                                    <h4 className="font-bold text-lg mb-2 text-stone-800">The Tandem Thesis</h4>
                                    <p className="text-stone-700 italic">"The future of work is not elimination, but synergy. AI amplifies human specialists, unlocking new levels of service quality."</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MODEL */}
                    <div className={activeSection === 'model' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl font-bold text-stone-900">Precision Partnership</h2>
                            <p className="mt-4 text-lg text-stone-600">
                                Tandem acts as a high-speed assessment layer. It calculates a <strong>Confidence Score</strong> to decide who handles the ticket.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
                            <div className="bg-stone-800 text-white p-4 flex justify-between items-center">
                                <span className="font-mono text-teal-400">Tandem_Core_Engine_v2.0</span>
                                <span className="text-xs text-stone-400">Live Simulation</span>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
                                {/* Input */}
                                <div className="p-6 space-y-4">
                                    <h3 className="font-bold text-stone-700">1. Incoming Signal</h3>
                                    <p className="text-sm text-stone-500">Select a scenario:</p>
                                    <div className="space-y-2">
                                        <button onClick={() => runSimulation('simple')} className="w-full text-left p-3 rounded border hover:bg-stone-50 transition border-stone-200 text-sm group">
                                            <span className="block font-semibold text-stone-800 group-hover:text-teal-600">Scenario A: Routine</span>
                                            <span className="text-stone-500">"Where is my order #12345?"</span>
                                        </button>
                                        <button onClick={() => runSimulation('complex')} className="w-full text-left p-3 rounded border hover:bg-stone-50 transition border-stone-200 text-sm group">
                                            <span className="block font-semibold text-stone-800 group-hover:text-amber-600">Scenario B: Complex</span>
                                            <span className="text-stone-500">"I'm frustrated, device broke!"</span>
                                        </button>
                                        <button onClick={() => runSimulation('edge')} className="w-full text-left p-3 rounded border hover:bg-stone-50 transition border-stone-200 text-sm group">
                                            <span className="block font-semibold text-stone-800 group-hover:text-indigo-600">Scenario C: Ambiguous</span>
                                            <span className="text-stone-500">"Is this compatible with 2018 ver?"</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Analysis */}
                                <div className="p-6 bg-stone-50 relative min-h-[300px]">
                                    <h3 className="font-bold text-stone-700 mb-4">2. AI Analysis & Scoring</h3>
                                    
                                    {simulationStatus === 'analyzing' && (
                                        <div className="absolute inset-0 bg-stone-50/90 z-10 flex flex-col items-center justify-center">
                                            <div className="animate-spin h-8 w-8 border-4 border-stone-300 border-t-teal-600 rounded-full mb-2"></div>
                                            <div className="text-teal-600 font-mono text-sm animate-pulse">Processing...</div>
                                        </div>
                                    )}

                                    <div className={`space-y-4 transition-opacity duration-300 ${simulationStatus === 'analyzing' ? 'opacity-50' : 'opacity-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase text-stone-500">Intent</span>
                                            <span className="text-sm font-mono bg-white px-2 py-1 rounded border border-stone-200">{simulationData.intent}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase text-stone-500">Sentiment</span>
                                            <span className="text-sm font-mono bg-white px-2 py-1 rounded border border-stone-200">{simulationData.sentiment}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase text-stone-500">Complexity</span>
                                            <span className="text-sm font-mono bg-white px-2 py-1 rounded border border-stone-200">{simulationData.complexity}</span>
                                        </div>

                                        <div className="mt-8 text-center pt-4 border-t border-stone-200">
                                            <div className="text-xs text-stone-500 mb-1">CONFIDENCE SCORE</div>
                                            <div className={`text-5xl font-extrabold transition-colors duration-500 ${simulationData.scoreColor}`}>{simulationData.score}%</div>
                                            <div className="w-full bg-stone-200 rounded-full h-2.5 mt-2 overflow-hidden">
                                                <div 
                                                    className={`h-2.5 rounded-full transition-all duration-1000 ${simulationData.barColor}`} 
                                                    style={{ width: `${simulationData.score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Outcome */}
                                <div className="p-6 flex flex-col">
                                    <h3 className="font-bold text-stone-700 mb-6">3. Action Protocol</h3>
                                    
                                    <div className={`flex-grow flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-500 ${simulationStatus === 'idle' ? 'border-dashed border-stone-300' : simulationData.colorClass}`}>
                                        {simulationStatus === 'idle' ? (
                                            <>
                                                <div className="text-4xl mb-4 text-stone-300">?</div>
                                                <p className="text-stone-400 text-sm text-center">Select a scenario to begin.</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-4xl mb-4">{simulationData.icon}</div>
                                                <p className="text-sm text-center font-medium">{simulationData.message}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                                <h3 className="font-bold text-amber-800 text-lg mb-2 flex items-center gap-2"><Shield className="h-5 w-5"/> Human Escalation Specialist</h3>
                                <p className="text-stone-700 text-sm">Focuses purely on complex problem-solving and emotional de-escalation.</p>
                            </div>
                            <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
                                <h3 className="font-bold text-teal-800 text-lg mb-2 flex items-center gap-2"><Zap className="h-5 w-5"/> Tandem Manager</h3>
                                <p className="text-stone-700 text-sm">Adjusts confidence thresholds and refines the AI's language models.</p>
                            </div>
                        </div>
                    </div>

                    {/* MARKET */}
                    <div className={activeSection === 'market' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl font-bold text-stone-900">Market Landscape</h2>
                            <p className="mt-4 text-lg text-stone-600">
                                While competitors focus on deflection, Tandem focuses on resolution quality.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-[400px]">
                                <h3 className="font-bold text-center mb-4 text-stone-700">Capability Comparison</h3>
                                <Radar data={competitorData} options={{ maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { display: false } } } }} />
                            </div>

                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: 'Fin.ai', role: 'The Deflector', desc: 'High automation, standard handoff.', auto: 'High', handoff: 'Standard', color: 'stone' },
                                    { name: 'Tidio', role: 'SMB Helper', desc: 'Good for sales, lacks nuance.', auto: 'Med', handoff: 'Basic', color: 'stone' },
                                    { name: 'Ada.cx', role: 'Enterprise Giant', desc: 'Powerful but complex setup.', auto: 'V. High', handoff: 'Low Empathy', color: 'stone' },
                                    { name: 'Tandem', role: 'The Hybrid', desc: 'Superior context retention & handoff.', auto: 'Adaptive', handoff: 'Superior', color: 'teal', highlight: true }
                                ].map((comp, i) => (
                                    <div key={i} className={`p-4 rounded-lg border transition hover:shadow-md ${comp.highlight ? 'bg-teal-50 border-teal-500 shadow-md scale-105' : 'bg-white border-stone-200'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className={`font-bold ${comp.highlight ? 'text-teal-900' : 'text-stone-800'}`}>{comp.name}</h4>
                                            <span className={`text-xs px-2 py-1 rounded ${comp.highlight ? 'bg-teal-200 text-teal-800 font-bold' : 'bg-stone-100 text-stone-500'}`}>{comp.role}</span>
                                        </div>
                                        <p className={`text-xs mb-3 ${comp.highlight ? 'text-teal-800' : 'text-stone-500'}`}>{comp.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* IMPACT */}
                    <div className={activeSection === 'impact' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}>
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl font-bold text-stone-900">The Economic Payoff</h2>
                            <p className="mt-4 text-lg text-stone-600">
                                Increase Customer Lifetime Value (CLV) and reduce Agent Attrition.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                                <h3 className="font-bold text-stone-800 mb-6">ROI Calculator</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Agents: {roiInputs.agents}</label>
                                        <input type="range" min="10" max="500" value={roiInputs.agents} onChange={(e) => setRoiInputs({...roiInputs, agents: parseInt(e.target.value)})} className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Hourly Cost: ${roiInputs.cost}</label>
                                        <input type="range" min="10" max="100" value={roiInputs.cost} onChange={(e) => setRoiInputs({...roiInputs, cost: parseInt(e.target.value)})} className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Deflection: {roiInputs.deflection}%</label>
                                        <input type="range" min="10" max="90" value={roiInputs.deflection} onChange={(e) => setRoiInputs({...roiInputs, deflection: parseInt(e.target.value)})} className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-stone-100">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-stone-500 text-sm">Monthly Savings</span>
                                        <span className="text-3xl font-bold text-teal-600">${Math.floor(savings).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="h-64">
                                    <Bar data={roiChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                                <div className="bg-stone-800 text-white p-6 rounded-xl">
                                    <h4 className="font-bold text-lg mb-2">Retention Impact</h4>
                                    <p className="text-sm text-stone-300 mb-4">By removing robotic tasks, Tandem keeps your best people engaged.</p>
                                    <div className="flex items-center justify-around">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-400">40%</div>
                                            <div className="text-xs text-stone-400">Avg Turnover</div>
                                        </div>
                                        <div className="text-stone-500">→</div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-teal-400">15%</div>
                                            <div className="text-xs text-stone-400">With Tandem</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MarketingLayout>
    );
}
