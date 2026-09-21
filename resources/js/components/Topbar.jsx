import { BellGlyph, MenuGlyph, SearchGlyph } from './Icons.jsx';
import { roleLabel } from '../lib/risk.js';

export default function Topbar({ user, query, onQueryChange, onMenu }) {
    const initials = (user?.name || 'RG')
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <button type="button" onClick={onMenu} className="grid h-11 w-11 place-items-center rounded-2xl bg-sky text-teal md:hidden" aria-label="Abrir menu">
                    <MenuGlyph />
                </button>
                <label className="relative min-w-0 flex-1 max-w-md">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/35">
                        <SearchGlyph />
                    </span>
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Buscar..."
                        className="w-full rounded-full bg-sky/80 py-3 pl-11 pr-4 text-sm text-navy outline-none placeholder:text-navy/35"
                    />
                </label>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold text-navy">{user?.name}</p>
                    <p className="text-xs text-navy/45">{roleLabel(user?.role)}</p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-full bg-teal text-sm font-extrabold text-white">
                    {initials}
                </div>
                <button type="button" className="relative grid h-11 w-11 place-items-center rounded-full bg-sky text-teal" aria-label="Notificaciones">
                    <BellGlyph />
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold" />
                </button>
            </div>
        </div>
    );
}
