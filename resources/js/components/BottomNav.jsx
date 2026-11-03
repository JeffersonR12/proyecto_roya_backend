import { motion, useReducedMotion } from 'framer-motion';
import { AlertGlyph, CameraGlyph, HistoryGlyph, MenuGlyph, PinGlyph } from './Icons.jsx';

export default function BottomNav({ mode, onModeChange, onMore, alertCount = 0, labels }) {
    const reduceMotion = useReducedMotion();
    const items = [
        { id: 'campo', icon: CameraGlyph, label: labels.campo },
        { id: 'historial', icon: HistoryGlyph, label: labels.historial },
        { id: 'alertas', icon: AlertGlyph, label: labels.alertas, badge: alertCount },
        { id: 'parcelas', icon: PinGlyph, label: labels.parcelas },
    ];

    return (
        <nav className="field-bottomnav" aria-label="Navegación rápida">
            {items.map((item) => {
                const Icon = item.icon;
                const active = mode === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onModeChange(item.id)}
                        className={active ? 'is-active' : ''}
                        aria-current={active ? 'page' : undefined}
                    >
                        <span className="field-bottomnav-icon">
                            {active ? (
                                <motion.span
                                    layoutId="bottomnav-pill"
                                    className="field-bottomnav-pill"
                                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 38 }}
                                />
                            ) : null}
                            <Icon className="h-6 w-6" />
                            {item.badge ? <span className="field-bottomnav-badge">{item.badge}</span> : null}
                        </span>
                        {item.label}
                    </button>
                );
            })}
            <button type="button" onClick={onMore}>
                <span className="field-bottomnav-icon">
                    <MenuGlyph className="h-6 w-6" />
                </span>
                {labels.mas}
            </button>
        </nav>
    );
}
