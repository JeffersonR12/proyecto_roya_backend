import { useState } from 'react';
import { MODELO_VERSION } from '../lib/inference.js';
import { BRAND_NAME } from '../lib/brand.js';
import { roleName } from '../lib/roles.js';
import PageHeader from '../components/PageHeader.jsx';

function describeSync(summary) {
    if (!summary) {
        return 'Sin conexión: se enviará automáticamente al volver la red.';
    }
    if (summary.authRequired) {
        return 'La sesión expiró. Inicia sesión de nuevo para sincronizar.';
    }
    if (summary.offline) {
        return 'No se pudo contactar al servidor. Se reintentará automáticamente.';
    }
    if (!summary.sent) {
        return 'Todo está sincronizado.';
    }

    const errores = summary.failed ? ', ' + summary.failed + ' con error' : '';

    return `Enviados ${summary.sent}: ${summary.confirmed} confirmados${errores}.`;
}

export default function SettingsPage({ user, pendingCount = 0, onReplayOnboarding, onSync }) {
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    const syncNow = async () => {
        setSyncing(true);
        try {
            setSyncMessage(describeSync(await onSync?.()));
        } finally {
            setSyncing(false);
        }
    };

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
                    {onSync ? (
                        <dd className="mt-2 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={syncNow}
                                disabled={syncing}
                                className="min-h-11 rounded-full bg-teal px-5 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                            >
                                {syncing ? 'Sincronizando…' : 'Sincronizar ahora'}
                            </button>
                            {syncMessage ? (
                                <output className="text-xs text-navy/60">{syncMessage}</output>
                            ) : null}
                        </dd>
                    ) : null}
                </div>
                <div>
                    <dt className="text-navy/40">PWA</dt>
                    <dd className="font-extrabold text-navy">Instalable · inferencia local ONNX · cola IndexedDB con sincronización a la nube</dd>
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
