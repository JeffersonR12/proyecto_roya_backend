import axios from 'axios';
import { LOGO_URL, BRAND_NAME } from '../lib/brand.js';
import {
    AlertGlyph,
    BookGlyph,
    CameraGlyph,
    GearGlyph,
    HistoryGlyph,
    LogoutGlyph,
    PinGlyph,
    ShieldGlyph,
} from './Icons.jsx';

export default function Sidebar({ mode, onModeChange, logoutUrl, onInspect, open, onClose, staff, alertCount, pendingCount = 0 }) {
    const logout = async () => {
        await axios.post(logoutUrl);
        window.location.href = '/login';
    };

    const items = [
        { id: 'campo', label: 'Campo', icon: CameraGlyph },
        { id: 'historial', label: 'Historial', icon: HistoryGlyph },
        { id: 'alertas', label: 'Alertas', icon: AlertGlyph, badge: alertCount },
        { id: 'protocolo', label: 'Protocolo', icon: BookGlyph },
        staff ? { id: 'hitl', label: 'Revisión técnica', icon: ShieldGlyph, badge: pendingCount } : null,
        { id: 'parcelas', label: 'Parcelas', icon: PinGlyph },
        { id: 'ajustes', label: 'Ajustes', icon: GearGlyph },
    ].filter(Boolean);

    return (
        <>
            {open ? (
                <button type="button" className="app-sidebar-backdrop md:hidden" aria-label="Cerrar menú" onClick={onClose} />
            ) : null}
            <aside className={`app-sidebar ${open ? 'is-open' : ''}`} id="app-sidebar">
                <a href="/" className="mb-10 flex items-center gap-3 text-white">
                    <img src={LOGO_URL} alt="" className="h-10 w-10 rounded-2xl bg-white object-contain p-0.5" />
                    <span className="text-lg font-extrabold tracking-tight">{BRAND_NAME}</span>
                </a>

                <nav className="flex flex-1 flex-col gap-1" aria-label="Navegación principal">
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
                                aria-current={active ? 'page' : undefined}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge ? (
                                    <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-extrabold text-navy">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                    <button type="button" onClick={logout} className="app-nav-item mt-auto">
                        <LogoutGlyph className="h-5 w-5" />
                        Salir
                    </button>
                </nav>

                <div className="app-upgrade">
                    <p className="text-sm font-extrabold text-white">Inspecciona ahora</p>
                    <p className="mt-1 text-xs leading-5 text-white/80">Detecta Roya Amarilla a tiempo en cada lote.</p>
                    <button
                        type="button"
                        onClick={() => {
                            onInspect();
                            onClose();
                        }}
                        className="mt-4 min-h-11 w-full rounded-full bg-gold px-4 py-2 text-xs font-extrabold text-navy transition hover:brightness-105"
                    >
                        Nueva captura
                    </button>
                </div>
            </aside>
        </>
    );
}
