import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BellGlyph, MenuGlyph, SearchGlyph } from './Icons.jsx';
import { roleLabel } from '../lib/risk.js';

export default function Topbar({
    user,
    query,
    onQueryChange,
    onClearQuery,
    onMenu,
    onOpenAlerts,
    onOpenAjustes,
    logoutUrl,
    alertCount = 0,
    pendingCount = 0,
}) {
    const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const initials = (user?.name || 'RG')
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => {
            window.removeEventListener('online', on);
            window.removeEventListener('offline', off);
        };
    }, []);

    useEffect(() => {
        const onDoc = (event) => {
            if (!menuRef.current?.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const logout = async () => {
        await axios.post(logoutUrl);
        window.location.href = '/login';
    };

    const queueLabel = pendingCount > 0 ? `Sin red · cola ${pendingCount}` : 'Sin red · cola 0';

    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                    type="button"
                    onClick={onMenu}
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-sky text-teal md:hidden"
                    aria-label="Abrir menú"
                    aria-controls="app-sidebar"
                >
                    <MenuGlyph />
                </button>
                <label className="relative min-w-0 flex-1 max-w-md">
                    <span className="sr-only">Buscar lote, clase o UUID</span>
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/35">
                        <SearchGlyph />
                    </span>
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Buscar lote, clase o UUID"
                        className="w-full rounded-full bg-sky/80 py-3 pl-11 pr-20 text-sm text-navy outline-none placeholder:text-navy/35 focus:ring-2 focus:ring-teal/30"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={onClearQuery}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-bold text-navy/50"
                        >
                            Limpiar
                        </button>
                    ) : null}
                </label>
            </div>

            <div className="flex items-center gap-3">
                <span
                    className={`hidden rounded-full px-3 py-2 text-xs font-extrabold sm:inline ${
                        online ? 'bg-sand text-teal' : 'bg-gold/25 text-navy'
                    }`}
                >
                    {online ? 'En línea · inferencia local' : queueLabel}
                </span>
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 text-left transition hover:bg-sky"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                    >
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold text-navy">{user?.name}</p>
                            <p className="text-xs text-navy/45">{roleLabel(user?.role)}</p>
                        </div>
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-teal text-sm font-extrabold text-white">
                            {initials}
                        </span>
                    </button>
                    {menuOpen ? (
                        <div
                            role="menu"
                            className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl bg-white p-1 shadow-lg ring-1 ring-sky"
                        >
                            <button
                                type="button"
                                role="menuitem"
                                className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-navy hover:bg-sky"
                                onClick={() => {
                                    setMenuOpen(false);
                                    onOpenAjustes?.();
                                }}
                            >
                                Ajustes
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-navy hover:bg-sky"
                                onClick={logout}
                            >
                                Salir
                            </button>
                        </div>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={() => onOpenAlerts?.()}
                    className="relative grid h-11 w-11 place-items-center rounded-full bg-sky text-teal transition hover:scale-105"
                    aria-label="Alertas"
                >
                    <BellGlyph />
                    {alertCount > 0 ? (
                        <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-gold px-1 text-[10px] font-extrabold text-navy">
                            {alertCount}
                        </span>
                    ) : null}
                </button>
            </div>
        </div>
    );
}
