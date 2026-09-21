import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Scanner from './components/Scanner.jsx';
import Dashboard from './components/Dashboard.jsx';
import History from './components/History.jsx';
import { summarizeAnalyses } from './lib/risk.js';

export default function App({ initialAnalyses, storeUrl }) {
    const [mode, setMode] = useState('mobile');
    const [analyses, setAnalyses] = useState(initialAnalyses);
    const stats = useMemo(() => summarizeAnalyses(analyses), [analyses]);

    const handleSaved = (analysis) => {
        setAnalyses((current) => [analysis, ...current]);
    };

    return (
        <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10 lg:py-9">
            <Header mode={mode} onModeChange={setMode} />

            {mode === 'mobile' ? (
                <section>
                    <div className="mb-8 grid gap-8 lg:grid-cols-[.88fr_1.12fr] lg:items-start">
                        <div className="pt-2">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[.24em] text-copper">Tecnico de campo / 01</p>
                            <h1 className="max-w-xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
                                Detecta antes.
                                <br />
                                <span className="text-leaf">Protege mejor.</span>
                            </h1>
                            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                                Captura una hoja o sube una imagen para registrar una inspeccion de Roya Amarilla con IA local simulada.
                            </p>
                            <div className="mt-8 grid max-w-md grid-cols-3 gap-3 border-y border-white/10 py-5 text-center">
                                <div>
                                    <p className="font-display text-2xl font-bold text-white">{stats.total}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Registros</p>
                                </div>
                                <div>
                                    <p className="font-display text-2xl font-bold text-red-300">{stats.critical}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Criticos</p>
                                </div>
                                <div>
                                    <p className="font-display text-2xl font-bold text-emerald-300">{stats.healthy}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Sanos</p>
                                </div>
                            </div>
                        </div>
                        <Scanner storeUrl={storeUrl} onSaved={handleSaved} />
                    </div>
                </section>
            ) : (
                <Dashboard analyses={analyses} stats={stats} />
            )}

            <History analyses={analyses} />
        </main>
    );
}

