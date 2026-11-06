import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
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
import { listDiagnosticos, updateDiagnostico } from './lib/diagnosticosDb.js';
import { summarizeDiagnosticos, toViewModel } from './lib/inference.js';
import { buildAlertas, contarAlertas } from './lib/alertas.js';
import { canReviewHitl, roleName } from './lib/roles.js';
import { registrarCorreccion } from './lib/agente.js';
import { getLastLote, mergeParcelasFromAnalyses, setLastLote, upsertParcela } from './lib/parcelasStore.js';
import { copyFor, getLang } from './lib/fieldFlow.js';
import { requeuePatch, syncPendientes } from './lib/syncQueue.js';
import { fromApiDiagnostico, mergeDiagnosticos } from './lib/cloudDiagnosticos.js';
import BottomNav from './components/BottomNav.jsx';

const ONBOARDING_KEY = 'riwiscan-onboarding-v1';
const SYNC_INTERVAL_MS = 60_000;

function isOnline() {
    return typeof navigator === 'undefined' || navigator.onLine !== false;
}

export default function RoyaGuard({ urls, user }) {
    const staff = canReviewHitl(user);
    const [lang] = useState(getLang);
    const copy = copyFor(lang);
    const firstName = (user?.name || '').split(' ')[0];
    const [mode, setMode] = useState('campo');
    // localRows: IndexedDB del dispositivo. cloudRows: diagnosticos visibles en la nube
    // (propios de otros dispositivos o, para tecnico/admin, los del tenant).
    const [localRows, setAnalyses] = useState([]);
    const [cloudRows, setCloudRows] = useState([]);
    const analyses = useMemo(() => mergeDiagnosticos(localRows, cloudRows), [localRows, cloudRows]);
    const syncingRef = useRef(null);
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

    const alertas = useMemo(() => buildAlertas(analyses, { staff, lang }), [analyses, staff, lang]);
    const alertCount = contarAlertas(alertas);
    const parcelasCampo = useMemo(
        () =>
            mergeParcelasFromAnalyses(analyses)
                .filter((row) => row.nombre && row.nombre !== 'Sin parcela')
                .map(({ nombre, ubicacion }) => ({ nombre, ubicacion })),
        [analyses, lote],
    );

    const reloadLocal = useCallback(
        () =>
            listDiagnosticos()
                .then((rows) => setAnalyses(rows.map(toViewModel)))
                .catch(() => setAnalyses([])),
        [],
    );

    const loadCloud = useCallback(async () => {
        if (!urls?.diagnosticos || !isOnline()) {
            return;
        }

        try {
            const response = await axios.get(urls.diagnosticos, { params: { per_page: 100 } });
            setCloudRows((response.data?.data || []).map(fromApiDiagnostico));
        } catch {
            // Sin red o sesion vencida: la app sigue con los datos locales.
        }
    }, [urls?.diagnosticos]);

    // Una sola sincronizacion a la vez; el servidor es idempotente si se solapan pestañas.
    const runSync = useCallback(() => {
        if (syncingRef.current) {
            return syncingRef.current;
        }

        if (!urls?.sync || !isOnline()) {
            return Promise.resolve(null);
        }

        syncingRef.current = syncPendientes({
            list: listDiagnosticos,
            update: updateDiagnostico,
            post: (items) => axios.post(urls.sync, { items }),
        })
            .then(async (summary) => {
                await reloadLocal();

                if (summary.confirmed) {
                    loadCloud();
                }

                if (summary.authRequired) {
                    setToast('Tu sesión expiró. Inicia sesión de nuevo para sincronizar.');
                }

                return summary;
            })
            .catch(() => null)
            .finally(() => {
                syncingRef.current = null;
            });

        return syncingRef.current;
    }, [urls?.sync, reloadLocal, loadCloud]);

    useEffect(() => {
        reloadLocal().then(runSync);
        loadCloud();

        const onOnline = () => {
            runSync();
            loadCloud();
        };
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                runSync();
            }
        };
        const timer = window.setInterval(runSync, SYNC_INTERVAL_MS);

        window.addEventListener('online', onOnline);
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            window.clearInterval(timer);
            window.removeEventListener('online', onOnline);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [reloadLocal, loadCloud, runSync]);

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
        runSync();
    };

    // Cambio de campos mutables (HITL / etiqueta humana):
    // - fila de la nube => PATCH inmediato a la API;
    // - fila local      => se guarda y se reencola; el sync la envia y el servidor la aplica.
    const patchDiagnostico = async (uuid, patch) => {
        const row = analyses.find((item) => item.uuid_local === uuid);

        if (row?.origen === 'cloud') {
            await axios.patch(`${urls.diagnosticos}/${uuid}`, patch);
            setCloudRows((current) => current.map((item) => (item.uuid_local === uuid ? { ...item, ...patch } : item)));
            return;
        }

        await updateDiagnostico(uuid, { ...patch, ...requeuePatch() });
        setAnalyses((current) =>
            current.map((item) => (item.uuid_local === uuid ? { ...item, ...patch, sync_status: 'pending' } : item)),
        );
        runSync();
    };

    const createLote = (nombre) => {
        try {
            upsertParcela({ nombre });
        } catch {
            /* el nombre vacío ya se filtra en el escáner */
        }
    };

    const handleHitl = async (uuid, hitl_status) => {
        try {
            await patchDiagnostico(uuid, { hitl_status });
        } catch {
            setToast('No se pudo actualizar la revisión. Intenta de nuevo.');
        }
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
                await Promise.all([...uuids].map((uuid) => updateDiagnostico(uuid, requeuePatch())));
                setAnalyses((current) =>
                    current.map((row) => (uuids.has(row.uuid_local) ? { ...row, sync_status: 'pending' } : row)),
                );
                runSync();
            } catch {
                setToast('No se pudo reintentar. Intenta de nuevo.');
            }
        }
    };

    const handleCorreccion = async (uuid, etiqueta_humana) => {
        const row = analyses.find((item) => item.uuid_local === uuid);
        const patch = registrarCorreccion({ diagnostico: row, etiqueta_humana });
        try {
            await patchDiagnostico(uuid, { etiqueta_humana: patch.etiqueta_humana });
        } catch {
            setToast('No se pudo guardar la corrección. Intenta de nuevo.');
        }
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
                        <SettingsPage
                            user={user}
                            pendingCount={pendingCount}
                            onReplayOnboarding={replayOnboarding}
                            onSync={async () => {
                                const summary = await runSync();
                                await loadCloud();
                                return summary;
                            }}
                        />
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
