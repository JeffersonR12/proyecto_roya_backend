import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Scanner from './components/Scanner.jsx';
import History from './components/History.jsx';
import CaptureGuide from './components/CaptureGuide.jsx';
import Onboarding from './components/Onboarding.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import ProtocolPage from './pages/ProtocolPage.jsx';
import HitlPage from './pages/HitlPage.jsx';
import ParcelasPage from './pages/ParcelasPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { listDiagnosticos, updateDiagnostico } from './lib/diagnosticosDb.js';
import { summarizeDiagnosticos, toViewModel } from './lib/inference.js';
import { buildAlertas } from './lib/alertas.js';
import { canReviewHitl, roleName } from './lib/roles.js';
import { registrarCorreccion } from './lib/agente.js';
import { getLastLote, listParcelas, mergeParcelasFromAnalyses, setLastLote } from './lib/parcelasStore.js';
import { MODE_LABELS } from './lib/nav.js';

const ONBOARDING_KEY = 'riwiscan-onboarding-v1';

export default function RoyaGuard({ urls, user }) {
    const staff = canReviewHitl(user);
    const [mode, setMode] = useState('campo');
    const [analyses, setAnalyses] = useState([]);
    const [query, setQuery] = useState('');
    const [historyFilter, setHistoryFilter] = useState('all');
    const [lote, setLote] = useState(() => getLastLote());
    const [toast, setToast] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(() => {
        try {
            return localStorage.getItem(ONBOARDING_KEY) !== 'done';
        } catch {
            return true;
        }
    });
    const panelRef = useRef(null);
    const stats = useMemo(() => summarizeDiagnosticos(analyses), [analyses]);
    const pendingCount = useMemo(
        () => analyses.filter((row) => ['pending', 'sending', 'error'].includes(row.sync_status)).length,
        [analyses],
    );
    const hitlPending = useMemo(
        () => analyses.filter((row) => row.hitl_status === 'pending' || row.hitl_status === 'resample').length,
        [analyses],
    );

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
                analysis.hitl_status,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(term);
        });
    }, [analyses, query]);

    const alertas = useMemo(() => buildAlertas(visibleAnalyses, { staff }), [visibleAnalyses, staff]);
    const parcelaNombres = useMemo(() => {
        const fromStore = listParcelas().map((row) => row.nombre);
        const fromScan = mergeParcelasFromAnalyses(analyses)
            .map((row) => row.nombre)
            .filter((nombre) => nombre && nombre !== 'Sin parcela');
        return Array.from(new Set([...fromStore, ...fromScan]));
    }, [analyses, lote]);

    useEffect(() => {
        listDiagnosticos()
            .then((rows) => setAnalyses(rows.map(toViewModel)))
            .catch(() => setAnalyses([]));
    }, []);

    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const goCampo = (nextLote) => {
        if (nextLote) {
            setLote(nextLote);
            setLastLote(nextLote);
        }
        setMode('campo');
    };

    const handleSaved = (analysis) => {
        setAnalyses((current) => [analysis, ...current.filter((row) => row.uuid_local !== analysis.uuid_local)]);
        if (analysis.location) {
            setLote(analysis.location);
            setLastLote(analysis.location);
        }
        setToast(`Guardado · ${analysis.sync_status || 'pending'}`);
        setMode('campo');
    };

    const handleHitl = async (uuid, hitl_status) => {
        await updateDiagnostico(uuid, { hitl_status });
        setAnalyses((current) => current.map((row) => (row.uuid_local === uuid ? { ...row, hitl_status } : row)));
    };

    const handleCorreccion = async (uuid, etiqueta_humana) => {
        const row = analyses.find((item) => item.uuid_local === uuid);
        const patch = registrarCorreccion({ diagnostico: row, etiqueta_humana });
        await updateDiagnostico(uuid, { etiqueta_humana: patch.etiqueta_humana });
        setAnalyses((current) =>
            current.map((item) => (item.uuid_local === uuid ? { ...item, etiqueta_humana: patch.etiqueta_humana } : item)),
        );
    };

    const handleAgenteAccion = (id, diagnostico) => {
        if (id === 'campo' || id === 'guia') {
            setMode('campo');
            return;
        }

        if (id === 'protocolo') {
            setMode('protocolo');
            return;
        }

        if (id === 'hitl' && staff) {
            setMode('hitl');
            return;
        }

        if (!diagnostico?.uuid_local || !staff) {
            return;
        }

        if (id === 'resample') {
            handleHitl(diagnostico.uuid_local, 'resample');
        } else if (id === 'validar') {
            handleHitl(diagnostico.uuid_local, 'validated');
        } else if (id === 'rechazar') {
            handleHitl(diagnostico.uuid_local, 'rejected');
        }
    };

    const finishOnboarding = () => {
        try {
            localStorage.setItem(ONBOARDING_KEY, 'done');
        } catch {
            /* ignore */
        }
        setShowOnboarding(false);
        setMode('campo');
    };

    const replayOnboarding = () => {
        try {
            localStorage.removeItem(ONBOARDING_KEY);
        } catch {
            /* ignore */
        }
        setShowOnboarding(true);
    };

    const openStat = (nextFilter) => {
        setHistoryFilter(nextFilter);
        setMode('historial');
    };

    useEffect(() => {
        panelRef.current?.scrollTo({ top: 0 });
    }, [mode]);

    useEffect(() => {
        if (mode === 'hitl' && !staff) {
            setMode('campo');
            setToast('La revisión técnica es solo para técnico o administrador.');
        }
    }, [mode, staff]);

    useEffect(() => {
        if (!toast) {
            return undefined;
        }
        const timer = window.setTimeout(() => setToast(''), 4200);
        return () => window.clearTimeout(timer);
    }, [toast]);

    return (
        <div className="app-frame">
            {showOnboarding ? <Onboarding onDone={finishOnboarding} /> : null}
            <Sidebar
                mode={mode}
                onModeChange={setMode}
                logoutUrl={urls.logout}
                onInspect={() => goCampo()}
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                staff={staff}
                alertCount={alertas.length}
                pendingCount={staff ? hitlPending : 0}
            />

            <section ref={panelRef} className="app-panel">
                <Topbar
                    user={user}
                    query={query}
                    onQueryChange={setQuery}
                    onClearQuery={() => setQuery('')}
                    onMenu={() => setMenuOpen(true)}
                    onOpenAlerts={() => setMode('alertas')}
                    onOpenAjustes={() => setMode('ajustes')}
                    logoutUrl={urls.logout}
                    alertCount={alertas.length}
                    pendingCount={pendingCount}
                />

                {toast ? (
                    <div className="app-toast" role="status">
                        <span>{toast}</span>
                        <button type="button" className="rounded-full bg-white px-3 py-1 text-xs font-extrabold" onClick={() => setMode('historial')}>
                            Ver historial
                        </button>
                        <button type="button" className="rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-navy" onClick={() => goCampo()}>
                            Otra captura
                        </button>
                    </div>
                ) : null}

                {mode === 'campo' ? (
                    <div className="grid gap-8 xl:grid-cols-[.92fr_1.08fr] xl:items-start">
                        <div className="order-2 xl:order-1">
                            <p className="app-crumb">
                                <span>RiwiScan</span>
                                <span aria-hidden="true">/</span>
                                <span>{MODE_LABELS.campo}</span>
                                <span aria-hidden="true">/</span>
                                <span>Nueva inspección</span>
                            </p>
                            <p className="mb-2 text-sm font-semibold text-teal">Inspección de campo</p>
                            <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-navy">
                                Mira la hoja.
                                <br />
                                <span className="text-teal">Actúa a tiempo.</span>
                            </h1>
                            <p className="mt-4 max-w-md text-sm leading-7 text-navy/60">
                                La CNN corre en el navegador (ONNX). Sin red también diagnostica; el resultado queda en IndexedDB.
                            </p>
                            <div className="mt-8 grid max-w-md grid-cols-3 gap-3 border-y border-sky py-5 text-center">
                                <button type="button" className="app-stat" onClick={() => openStat('all')}>
                                    <p className="text-2xl font-extrabold text-navy">{stats.total}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-navy/40">Registros</p>
                                </button>
                                <button type="button" className="app-stat" onClick={() => openStat('roya_amarilla')}>
                                    <p className="text-2xl font-extrabold text-navy">{stats.critical}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-navy/40">Roya afirmada</p>
                                </button>
                                <button type="button" className="app-stat" onClick={() => openStat('no_concluyente')}>
                                    <p className="text-2xl font-extrabold text-teal">{stats.inconclusive}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-navy/40">No concluyente</p>
                                </button>
                            </div>
                            <div className="mt-6">
                                <CaptureGuide />
                            </div>
                        </div>
                        <div className="order-1 xl:order-2">
                            <Scanner
                                onSaved={handleSaved}
                                parcelas={parcelaNombres}
                                lote={lote}
                                onLoteChange={(value) => {
                                    setLote(value);
                                    setLastLote(value);
                                }}
                                onGoParcelas={() => setMode('parcelas')}
                                onOpenHistory={() => setMode('historial')}
                            />
                        </div>
                    </div>
                ) : null}

                {mode === 'historial' ? (
                    <History
                        analyses={visibleAnalyses}
                        filter={historyFilter}
                        onFilterChange={setHistoryFilter}
                        onRepeat={() => goCampo()}
                        staff={staff}
                        onHitl={handleHitl}
                        query={query}
                    />
                ) : null}
                {mode === 'alertas' ? (
                    <AlertsPage
                        alertas={alertas}
                        staff={staff}
                        onCapture={() => goCampo()}
                        onOpen={() => {
                            setHistoryFilter('all');
                            setMode('historial');
                        }}
                    />
                ) : null}
                {mode === 'protocolo' ? (
                    <ProtocolPage analyses={visibleAnalyses} staff={staff} user={user} onAgenteAccion={handleAgenteAccion} />
                ) : null}
                {mode === 'hitl' && staff ? (
                    <HitlPage
                        analyses={visibleAnalyses}
                        onHitl={handleHitl}
                        onCorreccion={handleCorreccion}
                        onAgenteAccion={handleAgenteAccion}
                        rol={roleName(user)}
                    />
                ) : null}
                {mode === 'parcelas' ? <ParcelasPage analyses={visibleAnalyses} onInspect={goCampo} /> : null}
                {mode === 'ajustes' ? (
                    <SettingsPage user={user} pendingCount={pendingCount} onReplayOnboarding={replayOnboarding} />
                ) : null}
            </section>
        </div>
    );
}
