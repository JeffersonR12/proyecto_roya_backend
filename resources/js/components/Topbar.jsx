import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BellGlyph, MenuGlyph, SearchGlyph } from './Icons.jsx';
import { roleLabel } from '../lib/risk.js';
import { BRAND_NAME, LOGO_URL } from '../lib/brand.js';

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
    const [searchOpen, setSearchOpen] = useState(false);
    const menuRef = useRef(null);
    const searchRef = useRef(null);

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

    useEffect(() => {
        if (searchOpen) {
            searchRef.current?.focus();
        }
    }, [searchOpen]);

    const logout = async () => {
        await axios.post(logoutUrl);
        window.location.href = '/login';
    };

    const offlineStatus = pendingCount > 0 ? `Sin internet · ${pendingCount} por enviar` : 'Sin internet';
    const status = online ? 'En línea' : offlineStatus;
    const alertsLabel = alertCount ? `Alertas: ${alertCount}` : 'Alertas';

    return (
        <header className={`app-topbar ${searchOpen || query ? 'is-searching' : ''}`}>
            <button type="button" onClick={onMenu} className="app-icon-btn app-only-phone" aria-label="Abrir menú" aria-controls="app-sidebar">
                <MenuGlyph />
            </button>
            <a href="/" className="app-topbar-brand app-only-phone">
                <img src={LOGO_URL} alt="" />
                {BRAND_NAME}
            </a>

            <label className="app-search">
                <span className="sr-only">Buscar lote o resultado</span>
                <SearchGlyph />
                <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    onBlur={() => setSearchOpen(false)}
                    placeholder="Buscar lote o resultado"
                />
                {query ? (
                    <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={onClearQuery} className="app-search-clear">
                        Limpiar
                    </button>
                ) : null}
            </label>

            <div className="app-topbar-end">
                <span className={`app-online ${online ? '' : 'is-offline'}`}>
                    <span aria-hidden="true" />
                    {status}
                </span>
                <button type="button" className="app-icon-btn app-only-phone" aria-label="Buscar" onClick={() => setSearchOpen(true)}>
                    <SearchGlyph className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => onOpenAlerts?.()} className="app-icon-btn" aria-label={alertsLabel}>
                    <BellGlyph />
                    {alertCount > 0 ? <span className="app-icon-count">{alertCount}</span> : null}
                </button>
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((value) => !value)}
                        className="app-account"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-label={`Cuenta de ${user?.name ?? 'usuario'}`}
                    >
                        <span className="app-account-text">
                            <strong>{user?.name}</strong>
                            <small>{roleLabel(user?.role)}</small>
                        </span>
                        <span className="app-avatar">{initials}</span>
                    </button>
                    {menuOpen ? (
                        <div role="menu" className="app-menu">
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setMenuOpen(false);
                                    onOpenAjustes?.();
                                }}
                            >
                                Ajustes
                            </button>
                            <button type="button" role="menuitem" onClick={logout}>
                                Salir
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
