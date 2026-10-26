import { MODELO_VERSION } from '../lib/inference.js';
import { BRAND_NAME } from '../lib/brand.js';
import { roleName } from '../lib/roles.js';
import PageHeader from '../components/PageHeader.jsx';

export default function SettingsPage({ user, pendingCount = 0, onReplayOnboarding }) {
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
