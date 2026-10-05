import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Scanner from './components/Scanner.jsx';
import Dashboard from './components/Dashboard.jsx';
import History from './components/History.jsx';
import { listDiagnosticos } from './lib/diagnosticosDb.js';
import { summarizeDiagnosticos, toViewModel } from './lib/inference.js';

export default function RoyaGuard({ urls, user }) {
    const [mode, setMode] = useState(user?.role === 'administrador' ? 'desktop' : 'mobile');
    const [analyses, setAnalyses] = useState([]);
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const panelRef = useRef(null);
    const stats = useMemo(() => summarizeDiagnosticos(analyses), [analyses]);

    const visibleAnalyses = useMemo(() => {
        const term = query.trim().toLowerCase();

        if (!term) {
            return analyses;
        }

        return analyses.filter((analysis) => {
            const haystack = [
                analysis.disease_detected,
                analysis.clase,
                analysis.location,
                analysis.uuid_local,
                analysis.sync_status,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(term);
        });
    }, [analyses, query]);

    const visibleStats = useMemo(() => summarizeDiagnosticos(visibleAnalyses), [visibleAnalyses]);

    useEffect(() => {
        listDiagnosticos()
            .then((rows) => setAnalyses(rows.map(toViewModel)))
            .catch(() => setAnalyses([]));
    }, []);

    const handleSaved = (analysis) => {
        setAnalyses((current) => [analysis, ...current.filter((row) => row.uuid_local !== analysis.uuid_local)]);
    };

    const goToField = () => setMode('mobile');

    useEffect(() => {
        panelRef.current?.scrollTo({ top: 0 });
    }, [mode]);

    return (
        <div className="app-frame">
            <Sidebar
                mode={mode}
                onModeChange={setMode}
                logoutUrl={urls.logout}
                onInspect={goToField}
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
            />

            <section ref={panelRef} className="app-panel">
                <Topbar
                    user={user}
                    query={query}
                    onQueryChange={setQuery}
                    onMenu={() => setMenuOpen(true)}
                />

                {mode === 'mobile' ? (
                    <div className="grid gap-8 xl:grid-cols-[.92fr_1.08fr] xl:items-start">
                        <div>
                            <p className="mb-2 text-sm font-semibold text-teal">Inspeccion de campo</p>
                            <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-navy">
                                Mira la hoja.
                                <br />
                                <span className="text-teal">Actua a tiempo.</span>
                            </h1>
                            <p className="mt-4 max-w-md text-sm leading-7 text-navy/60">
                                La CNN corre en el navegador (ONNX). Sin red también diagnostica; el resultado queda en IndexedDB.
                            </p>
                            <div className="mt-8 grid max-w-md grid-cols-3 gap-3 border-y border-sky py-5 text-center">
                                <div>
                                    <p className="text-2xl font-extrabold text-navy">{stats.total}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-navy/40">Registros</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-navy">{stats.critical}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-navy/40">Criticos</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-teal">{stats.healthy}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-navy/40">Sanos</p>
                                </div>
                            </div>
                        </div>
                        <Scanner onSaved={handleSaved} />
                    </div>
                ) : (
                    <>
                        <Dashboard analyses={visibleAnalyses} stats={visibleStats} onInspect={goToField} />
                        <History analyses={visibleAnalyses} />
                    </>
                )}
            </section>
        </div>
    );
}
