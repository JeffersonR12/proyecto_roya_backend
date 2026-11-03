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

export default function Sidebar({ mode, onModeChange, logoutUrl, open, onClose, staff, alertCount, pendingCount = 0 }) {
    const logout = async () => {
        await axios.post(logoutUrl);
        window.location.href = '/login';
    };

    const groups = [
        [
            { id: 'campo', label: 'Campo', icon: CameraGlyph },
            { id: 'historial', label: 'Historial', icon: HistoryGlyph },
            { id: 'alertas', label: 'Alertas', icon: AlertGlyph, badge: alertCount },
            { id: 'parcelas', label: 'Parcelas', icon: PinGlyph },
        ],
        [
            staff ? { id: 'hitl', label: 'Revisión técnica', icon: ShieldGlyph, badge: pendingCount } : null,
            { id: 'protocolo', label: 'Protocolo', icon: BookGlyph },
        ].filter(Boolean),
    ];

    const item = ({ id, label, icon: Icon, badge }) => {
        const active = mode === id;
        return (
            <button
                key={id}
                type="button"
                onClick={() => {
                    onModeChange(id);
                    onClose();
                }}
                className={`app-nav-item ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
            >
                <Icon />
                <span className="flex-1 truncate">{label}</span>
                {badge ? <span className="app-nav-count">{badge}</span> : null}
            </button>
        );
    };

    return (
        <>
            {open ? <button type="button" className="app-sidebar-backdrop" aria-label="Cerrar menú" onClick={onClose} /> : null}
            <aside className={`app-sidebar ${open ? 'is-open' : ''}`} id="app-sidebar">
                <a href="/" className="app-brand">
                    <img src={LOGO_URL} alt="" />
                    <strong>{BRAND_NAME}</strong>
                </a>

                <nav className="app-nav" aria-label="Navegación principal">
                    {groups[0].map(item)}
                    <p className="app-nav-group">Seguimiento</p>
                    {groups[1].map(item)}
                </nav>

                <div className="app-nav app-nav-foot">
                    {item({ id: 'ajustes', label: 'Ajustes', icon: GearGlyph })}
                    <button type="button" onClick={logout} className="app-nav-item">
                        <LogoutGlyph />
                        <span className="flex-1">Salir</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
