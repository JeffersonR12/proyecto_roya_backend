import { useEffect, useState } from 'react';
import axios from 'axios';
import { MODELO_VERSION } from '../lib/inference.js';
import { BRAND_NAME } from '../lib/brand.js';
import { roleName } from '../lib/roles.js';
import PageHeader from '../components/PageHeader.jsx';

/**
 * Solo para administrador. El servidor vuelve a comprobar el rol: ocultar el
 * panel es comodidad, no seguridad.
 */
function InvitacionPanel({ urls }) {
    const [estado, setEstado] = useState({ cargando: true, codigo: '', error: '', aviso: '' });
    const [regenerando, setRegenerando] = useState(false);

    useEffect(() => {
        let activo = true;

        axios
            .get(urls.invitacion)
            .then((response) => {
                if (activo) setEstado({ cargando: false, codigo: response.data.codigo_invitacion ?? '', error: '', aviso: '' });
            })
            .catch(() => {
                if (activo) setEstado({ cargando: false, codigo: '', error: 'No se pudo cargar el código. Revisa tu conexión.', aviso: '' });
            });

        return () => {
            activo = false;
        };
    }, [urls.invitacion]);

    const regenerar = async () => {
        if (!window.confirm('El código actual dejará de funcionar. Quienes ya tienen cuenta no se ven afectados. ¿Generar uno nuevo?')) {
            return;
        }

        setRegenerando(true);

        try {
            const response = await axios.post(urls.invitacionRegenerar);
            setEstado({ cargando: false, codigo: response.data.codigo_invitacion, error: '', aviso: response.data.message });
        } catch (error) {
            const mensaje = error.response?.status === 429 ? 'Demasiados intentos. Espera un minuto.' : 'No se pudo regenerar el código.';
            setEstado((actual) => ({ ...actual, error: mensaje, aviso: '' }));
        } finally {
            setRegenerando(false);
        }
    };

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(estado.codigo);
            setEstado((actual) => ({ ...actual, aviso: 'Código copiado.', error: '' }));
        } catch {
            setEstado((actual) => ({ ...actual, aviso: '', error: 'No se pudo copiar. Selecciónalo y cópialo a mano.' }));
        }
    };

    return (
        <section className="mt-5 rounded-3xl bg-white p-6 text-sm" aria-labelledby="invitacion-title">
            <h2 id="invitacion-title" className="text-base font-extrabold text-navy">Código de invitación</h2>
            <p className="mt-1 text-navy/60">
                Compártelo con los agricultores de tu cooperativa. Con él se registran directamente en tu cooperativa y siempre como agricultor.
            </p>
            <p className="mt-4 select-all font-mono text-2xl font-extrabold tracking-[0.2em] text-navy" aria-live="polite">
                {estado.cargando ? 'Cargando…' : estado.codigo || '—'}
            </p>
            {estado.error ? <p className="mt-2 font-bold text-red-700" role="alert">{estado.error}</p> : null}
            {estado.aviso ? <p className="mt-2 font-bold text-teal" role="status">{estado.aviso}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={copiar}
                    disabled={!estado.codigo}
                    className="min-h-11 rounded-full bg-teal px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50"
                >
                    Copiar
                </button>
                <button
                    type="button"
                    onClick={regenerar}
                    disabled={regenerando || estado.cargando}
                    className="min-h-11 rounded-full bg-sky px-5 py-3 text-sm font-extrabold text-navy disabled:opacity-50"
                >
                    {regenerando ? 'Generando…' : 'Generar código nuevo'}
                </button>
            </div>
        </section>
    );
}

export default function SettingsPage({ user, urls = {}, pendingCount = 0, onReplayOnboarding }) {
    const esAdministrador = roleName(user) === 'administrador';

    return (
        <section>
            <PageHeader mode="ajustes" kicker="Cuenta y PWA" title="Ajustes">
                <p className="mt-2 max-w-2xl text-sm text-navy/60">Datos de cuenta, dispositivo y modelo. No hay entrenamiento de CNN aquí.</p>
            </PageHeader>
            <dl className="mt-2 grid gap-3 rounded-3xl bg-white p-6 text-sm">
                <div>
                    <dt className="text-navy/40">Producto</dt>
                    <dd className="font-extrabold text-navy">{BRAND_NAME}</dd>
                </div>
                <div>
                    <dt className="text-navy/40">Usuario</dt>
                    <dd className="font-extrabold text-navy">{user?.name} · {user?.email}</dd>
                </div>
                <div>
                    <dt className="text-navy/40">Rol / tenant</dt>
                    <dd className="font-extrabold text-navy">
                        {roleName(user)}
                        {user?.organization ? ` · ${user.organization}` : ''}
                    </dd>
                </div>
                <div>
                    <dt className="text-navy/40">modelo_version</dt>
                    <dd className="font-extrabold text-navy">{MODELO_VERSION}</dd>
                </div>
                <div>
                    <dt className="text-navy/40">Cola IndexedDB</dt>
                    <dd className="font-extrabold text-navy">{pendingCount} pending / sending / error</dd>
                </div>
                <div>
                    <dt className="text-navy/40">PWA</dt>
                    <dd className="font-extrabold text-navy">Instalable · inferencia local ONNX · cola IndexedDB</dd>
                </div>
                <div>
                    <dt className="text-navy/40">Idioma</dt>
                    <dd className="mt-2 flex gap-2">
                        <span className="rounded-full bg-teal px-4 py-2 text-xs font-extrabold text-white">Español</span>
                        <button type="button" disabled className="rounded-full bg-sky px-4 py-2 text-xs font-extrabold text-navy/40" title="Próximamente">
                            English · Próximamente
                        </button>
                    </dd>
                </div>
            </dl>
            {esAdministrador && urls.invitacion ? <InvitacionPanel urls={urls} /> : null}
            <button
                type="button"
                onClick={onReplayOnboarding}
                className="mt-5 min-h-11 rounded-full bg-sky px-5 py-3 text-sm font-extrabold text-navy"
            >
                Ver onboarding otra vez
            </button>
        </section>
    );
}
