import axios from 'axios';
import { CameraGlyph, ChartGlyph, LogoGlyph, LogoutGlyph } from './Icons.jsx';

export default function Sidebar({ mode, onModeChange, logoutUrl, onInspect, open, onClose }) {
    const logout = async () => {
        await axios.post(logoutUrl);
        window.location.href = '/login';
    };

    const items = [
        { id: 'mobile', label: 'Campo', icon: CameraGlyph },
        { id: 'desktop', label: 'Dashboard', icon: ChartGlyph },
    ];

    return (
        <>
            {open ? <button type="button" className="app-sidebar-backdrop md:hidden" aria-label="Cerrar menu" onClick={onClose} /> : null}
            <aside className={`app-sidebar ${open ? 'is-open' : ''}`}>
                <a href="/" className="mb-10 flex items-center gap-3 text-white">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15">
                        <LogoGlyph className="h-6 w-6" />
                    </span>
                    <span className="text-lg font-extrabold tracking-tight">Roya</span>
                </a>

                <nav className="flex flex-1 flex-col gap-1" aria-label="Navegacion principal">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const active = mode === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    onModeChange(item.id);
                                    onClose();
                                }}
                                className={`app-nav-item ${active ? 'is-active' : ''}`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </button>
                        );
                    })}
                    <button type="button" onClick={logout} className="app-nav-item mt-auto">
                        <LogoutGlyph className="h-5 w-5" />
                        Salir
                    </button>
                </nav>

                <div className="app-upgrade">
                    <div className="app-upgrade-art" aria-hidden="true">
                        <span className="blob blob-a" />
                        <span className="blob blob-b" />
                        <span className="plant" />
                    </div>
                    <p className="text-sm font-extrabold text-white">Inspecciona ahora</p>
                    <p className="mt-1 text-xs leading-5 text-white/80">Detecta Roya Amarilla a tiempo en cada lote.</p>
                    <button
                        type="button"
                        onClick={() => {
                            onInspect();
                            onClose();
                        }}
                        className="mt-4 rounded-full bg-gold px-4 py-2 text-xs font-extrabold text-navy"
                    >
                        Nueva captura
                    </button>
                </div>
            </aside>
        </>
    );
}
