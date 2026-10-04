import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Scanner from './components/Scanner.jsx';
import Dashboard from './components/Dashboard.jsx';
import History from './components/History.jsx';

const emptyListing = {
    data: [],
    recent: [],
    activity: [],
    stats: { total: 0, critical: 0, medium: 0, healthy: 0 },
    meta: { current_page: 1, last_page: 1, per_page: 12, total: 0 },
};

export default function RoyaGuard({ listing, urls, user }) {
    const [mode, setMode] = useState(user?.role === 'administrador' ? 'desktop' : 'mobile');
    const [data, setData] = useState(listing ?? emptyListing);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(listing?.meta?.current_page ?? 1);
    const [menuOpen, setMenuOpen] = useState(false);
    const panelRef = useRef(null);
    const skipFirstFetch = useRef(true);
    const stats = data.stats ?? emptyListing.stats;

    const loadListing = async (nextPage, nextQuery, nextFilter) => {
        const response = await axios.get(urls.list, {
            params: {
                page: nextPage,
                q: nextQuery,
                risk: nextFilter,
            },
        });
        setData(response.data);
    };

    const handleSaved = () => {
        if (page === 1 && filter === 'all') {
            loadListing(1, query, 'all');
            return;
        }

        setFilter('all');
        setPage(1);
    };

    const goToField = () => setMode('mobile');

    useEffect(() => {
        panelRef.current?.scrollTo({ top: 0 });
    }, [mode]);

    useEffect(() => {
        if (skipFirstFetch.current) {
            skipFirstFetch.current = false;
            return;
        }

        const handle = setTimeout(() => {
            loadListing(page, query, filter);
        }, 250);

        return () => clearTimeout(handle);
    }, [page, query, filter]);

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
                    onQueryChange={(value) => {
                        setQuery(value);
                        setPage(1);
                    }}
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
                                Captura o sube una imagen para registrar Roya Amarilla. El resultado queda en tu bitacora.
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
                        <Scanner storeUrl={urls.store} onSaved={handleSaved} />
                    </div>
                ) : (
                    <>
                        <Dashboard
                            recent={data.recent ?? []}
                            activity={data.activity ?? []}
                            stats={stats}
                            onInspect={goToField}
                            exportUrl={urls.export}
                            query={query}
                        />
                        <History
                            analyses={data.data ?? []}
                            filter={filter}
                            onFilterChange={(value) => {
                                setFilter(value);
                                setPage(1);
                            }}
                            meta={data.meta}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </section>
        </div>
    );
}
