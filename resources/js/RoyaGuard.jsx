import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Scanner from './components/Scanner.jsx';
import History from './components/History.jsx';
import Onboarding from './components/Onboarding.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import ProtocolPage from './pages/ProtocolPage.jsx';
import HitlPage from './pages/HitlPage.jsx';
import ParcelasPage from './pages/ParcelasPage.jsx';
import CampoPage from './pages/CampoPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { listDiagnosticos, saveDiagnostico, updateDiagnostico } from './lib/diagnosticosDb.js';
import { adoptLegacy, discardLegacy, inspectLegacy } from './lib/legacyDb.js';
import { storageKey } from './lib/session.js';
import { summarizeDiagnosticos, toViewModel } from './lib/inference.js';
import { buildAlertas, contarAlertas } from './lib/alertas.js';
import { canReviewHitl, roleName } from './lib/roles.js';
import { registrarCorreccion } from './lib/agente.js';
import { getLastLote, mergeParcelasFromAnalyses, setLastLote, upsertParcela } from './lib/parcelasStore.js';
import { copyFor, getLang } from './lib/fieldFlow.js';
import BottomNav from './components/BottomNav.jsx';
import { syncAll, syncQueue } from './lib/sync.js';

// El onboarding se recuerda por cuenta, no por navegador.
const onboardingKey = () => storageKey('riwiscan-onboarding-v1');

export default function RoyaGuard({ urls, user }) {
    const [legacyPendientes, setLegacyPendientes] = useState([]);
    const staff = canReviewHitl(user);
    const [lang] = useState(getLang);
    const copy = copyFor(lang);
    const firstName = (user?.name || '').split(' ')[0];
    const [mode, setMode] = useState('campo');
    const [analyses, setAnalyses] = useState([]);
    const [query, setQuery] = useState('');
    const [historyFilter, setHistoryFilter] = useState('all');
    const [lote, setLote] = useState(() => getLastLote());
    const [toast, setToast] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(() => {
        try {
            return localStorage.getItem(onboardingKey()) !== 'done';
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

    const alertas = useMemo(() => buildAlertas(analyses, { staff, lang }), [analyses, staff, lang]);
    const alertCount = contarAlertas(alertas);
    const parcelasCampo = useMemo(
        () =>
            mergeParcelasFromAnalyses(analyses)
                .filter((row) => row.nombre && row.nombre !== 'Sin parcela')
                .map(({ nombre, ubicacion }) => ({ nombre, ubicacion })),
        [analyses, lote],
    );

    const reloadLocal = () =>
        listDiagnosticos()
            .then((rows) => setAnalyses(rows.map(toViewModel)))
            .catch(() => setAnalyses([]));

    // Envia la cola Outbox y trae el historial del servidor; luego refresca la vista.
    const sync = () => syncAll().then(reloadLocal);

    useEffect(() => {
        reloadLocal().then(sync);
        // Base antigua compartida por todas las cuentas: sus pendientes no se suben solos.
        inspectLegacy()
            .then(({ pendientes }) => setLegacyPendientes(pendientes))
            .catch(() => setLegacyPendientes([]));

        const onOnline = () => {
            syncQueue.reset();
            void sync();
        };
        window.addEventListener('online', onOnline);
        // Los reintentos con backoff ocurren fuera de React: refresca al terminar.
        const unsubscribe = syncQueue.subscribe(() => void reloadLocal());

        return () => {
            window.removeEventListener('online', onOnline);
            unsubscribe();
        };
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

    const adoptarLegacy = async () => {
        try {
            const n = await adoptLegacy(legacyPendientes, { saveDiagnostico });
            setLegacyPendientes([]);
            setToast(n === 1 ? '1 diagnóstico recuperado; se enviará con tu cuenta.' : `${n} diagnósticos recuperados; se enviarán con tu cuenta.`);
            await reloadLocal();
            void sync();
        } catch {
            setToast('No se pudieron recuperar los diagnósticos anteriores.');
        }
    };

    const descartarLegacy = async () => {
        await discardLegacy();
        setLegacyPendientes([]);
    };

    const handleSaved = (analysis) => {
        setAnalyses((current) => [analysis, ...current.filter((row) => row.uuid_local !== analysis.uuid_local)]);
        if (analysis.location) {
            setLote(analysis.location);
            setLastLote(analysis.location);
        }
        // Scanner ya lo guardo en IndexedDB: intenta enviarlo de inmediato.
        void sync();
    };

    const createLote = (nombre) => {
        try {
            upsertParcela({ nombre });
        } catch {
            /* el nombre vacío ya se filtra en el escáner */
        }
    };

    // Revision HITL: primero se guarda local (funciona sin red), luego se envia.
    const handleHitl = async (uuid, hitl_status) => {
        await updateDiagnostico(uuid, { hitl_status, hitl_dirty: true });
        setAnalyses((current) => current.map((row) => (row.uuid_local === uuid ? { ...row, hitl_status } : row)));
        void sync();
    };

    const handleAlertAction = async (alerta) => {
        if (alerta.accion === 'protocolo') {
            setMode('protocolo');
            return;
        }
        if (alerta.accion === 'hitl' && staff) {
            setMode('hitl');
            return;
        }
        if (alerta.accion === 'reintentar') {
            const uuids = new Set(alerta.uuids || []);
            try {
                await Promise.all(
                    [...uuids].map((uuid) =>
                        updateDiagnostico(uuid, { sync_status: 'pending', sync_rejected: false, last_error: null }),
                    ),
                );
                setAnalyses((current) =>
                    current.map((row) => (uuids.has(row.uuid_local) ? { ...row, sync_status: 'pending' } : row)),
                );
                syncQueue.reset();
                void sync();
            } catch {
                setToast('No se pudo reintentar. Intenta de nuevo.');
            }
        }
    };

    const handleCorreccion = async (uuid, etiqueta_humana) => {
        const row = analyses.find((item) => item.uuid_local === uuid);
        const patch = registrarCorreccion({ diagnostico: row, etiqueta_humana });
        await updateDiagnostico(uuid, { etiqueta_humana: patch.etiqueta_humana, hitl_dirty: true });
        setAnalyses((current) =>
            current.map((item) => (item.uuid_local === uuid ? { ...item, etiqueta_humana: patch.etiqueta_humana } : item)),
        );
        void sync();
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

        const hitlStatus = { resample: 'resample', validar: 'validated', rechazar: 'rejected' }[id];
        if (hitlStatus) {
            handleHitl(diagnostico.uuid_local, hitlStatus).catch(() => setToast('No se pudo actualizar la revisión.'));
        }
    };

    const finishOnboarding = () => {
        try {
            localStorage.setItem(onboardingKey(), 'done');
        } catch {
            /* ignore */
        }
        setShowOnboarding(false);
        setMode('campo');
    };

    const replayOnboarding = () => {
        try {
            localStorage.removeItem(onboardingKey());
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
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                staff={staff}
                alertCount={alertCount}
                pendingCount={staff ? hitlPending : 0}
            />

            <div className="app-main">
                <Topbar
                    user={user}
                    query={query}
                    onQueryChange={setQuery}
                    onClearQuery={() => setQuery('')}
                    onMenu={() => setMenuOpen(true)}
                    onOpenAlerts={() => setMode('alertas')}
                    onOpenAjustes={() => setMode('ajustes')}
                    logoutUrl={urls.logout}
                    alertCount={alertCount}
                    pendingCount={pendingCount}
                />

                <section ref={panelRef} className="app-panel">
                    {legacyPendientes.length > 0 ? (
                        <div className="app-toast" role="alert">
                            <span>
                                {legacyPendientes.length === 1
                                    ? 'Hay 1 diagnóstico sin enviar de una sesión anterior en este dispositivo.'
                                    : `Hay ${legacyPendientes.length} diagnósticos sin enviar de una sesión anterior en este dispositivo.`}
                            </span>
                            <button type="button" className="app-toast-action" onClick={adoptarLegacy}>
                                Son míos, enviarlos
                            </button>
                            <button type="button" className="app-toast-action" onClick={descartarLegacy}>
                                Descartar
                            </button>
                        </div>
                    ) : null}
                    {toast ? (
                        <div className="app-toast" role="status">
                            <span>{toast}</span>
                            <button type="button" className="app-toast-action" onClick={() => setMode('historial')}>
                                Ver historial
                            </button>
                            <button type="button" className="app-toast-action" onClick={() => goCampo()}>
                                Otra captura
                            </button>
                        </div>
                    ) : null}

                    {mode === 'campo' ? (
                        <CampoPage
                            copy={copy}
                            lang={lang}
                            firstName={firstName}
                            stats={stats}
                            analyses={analyses}
                            pendingCount={pendingCount}
                            staff={staff}
                            onOpenStat={openStat}
                            onOpenHistory={() => setMode('historial')}
                            onReview={() => setMode('hitl')}
                            onProtocol={() => setMode('protocolo')}
                            scanner={
                                <Scanner
                                    lang={lang}
                                    onSaved={handleSaved}
                                    parcelas={parcelasCampo}
                                    lote={lote}
                                    onLoteChange={(value) => {
                                        setLote(value);
                                        setLastLote(value);
                                    }}
                                    onCreateLote={createLote}
                                    onOpenHistory={() => setMode('historial')}
                                    onOpenProtocol={() => setMode('protocolo')}
                                />
                            }
                        />
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
                        <AlertsPage alertas={alertas} lang={lang} onAction={handleAlertAction} onCapture={() => goCampo()} />
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

            <BottomNav
                mode={mode}
                onModeChange={setMode}
                onMore={() => setMenuOpen(true)}
                alertCount={alertCount}
                labels={copy.nav}
            />
        </div>
    );
}
