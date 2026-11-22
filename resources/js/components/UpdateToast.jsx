import { useEffect, useState } from 'react';
import { applyUpdate, onUpdateAvailable } from '../lib/pwa.js';

/**
 * Aviso discreto cuando hay un service worker nuevo esperando. No recarga
 * solo: el usuario puede estar a mitad de una captura.
 */
export default function UpdateToast() {
    const [visible, setVisible] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => onUpdateAvailable(() => setVisible(true)), []);

    if (!visible) {
        return null;
    }

    const update = () => {
        setUpdating(true);
        applyUpdate();
    };

    return (
        <div className="update-toast" role="status" aria-live="polite">
            <span>Hay una versión nueva</span>
            <button type="button" className="update-toast-action" onClick={update} disabled={updating}>
                {updating ? 'Actualizando…' : 'Actualizar'}
            </button>
            <button type="button" className="update-toast-close" onClick={() => setVisible(false)} aria-label="Cerrar aviso">
                ×
            </button>
        </div>
    );
}
