/**
 * Cola Outbox Edge -> Cloud.
 *
 * Toma los diagnosticos locales que aun no llegan al servidor, los envia en
 * lotes a POST /api/diagnosticos/sync y marca cada uno segun la respuesta.
 * El servidor es idempotente por uuid_local, asi que reenviar es seguro.
 *
 * Estados locales: pending -> sending -> confirmed | error.
 * - error con sync_rejected: el servidor lo rechazo por datos invalidos; no se
 *   reintenta solo, solo con "reintentar".
 * - error sin sync_rejected: fallo de red o servidor; se reintenta con backoff.
 * Las revisiones HITL hechas localmente llevan hitl_dirty y se envian con PATCH.
 */

import { getSession as getModuleSession, isOwnedBySession } from './session.js';

export const SYNC_URL = '/api/diagnosticos/sync';
export const REVISION_URL = (uuid) => `/api/diagnosticos/${uuid}/revision`;
export const LOTE_MAX = 50;
export const BACKOFF_BASE_MS = 2000;
export const BACKOFF_MAX_MS = 5 * 60 * 1000;

const ENVIABLES = new Set(['pending', 'error', 'sending']);

export function backoffDelay(attempt) {
    const exp = BACKOFF_BASE_MS * 2 ** Math.max(0, attempt);

    return Math.min(exp, BACKOFF_MAX_MS);
}

export function esEnviable(row) {
    return Boolean(row?.uuid_local) && ENVIABLES.has(row.sync_status || 'pending') && !row.sync_rejected;
}

export function toPayload(row) {
    return {
        uuid_local: row.uuid_local,
        clase: row.clase,
        confianza: row.confianza,
        severidad: row.severidad ?? null,
        latitud: row.latitud ?? null,
        longitud: row.longitud ?? null,
        modelo_version: row.modelo_version,
        captured_at: row.captured_at,
        ubicacion: row.parcela_nota ?? null,
        hitl_status: row.hitl_status ?? null,
        etiqueta_humana: row.etiqueta_humana ?? null,
        imagen: row.imagen_thumb,
    };
}

export function chunk(items, size = LOTE_MAX) {
    const out = [];

    for (let i = 0; i < items.length; i += size) {
        out.push(items.slice(i, i + size));
    }

    return out;
}

/**
 * Indices del lote que Laravel marco como invalidos en un 422:
 * claves "diagnosticos.3.imagen" -> { 3: 'mensaje' }.
 */
export function erroresPorIndice(responseData) {
    const errors = responseData?.errors || {};
    const porIndice = {};

    Object.entries(errors).forEach(([key, messages]) => {
        const match = /^diagnosticos\.(\d+)\./.exec(key);

        if (match) {
            const index = Number(match[1]);
            porIndice[index] ??= Array.isArray(messages) ? messages[0] : String(messages);
        }
    });

    return porIndice;
}

export function esSesionPerdida(error) {
    return error?.response?.status === 401 || error?.response?.status === 419;
}

function mensajeDeError(error) {
    if (esSesionPerdida(error)) {
        return 'Sesion expirada. Vuelve a iniciar sesion.';
    }

    if (error?.response?.status) {
        return `Servidor respondio ${error.response.status}.`;
    }

    return error?.message || 'Sin conexion.';
}

/**
 * @param {object} deps
 * @param {{ listDiagnosticos: Function, updateDiagnostico: Function }} deps.db
 * @param {{ post: Function, patch: Function }} deps.http
 * @param {() => boolean} [deps.isOnline]
 * @param {(fn: Function, ms: number) => any} [deps.setTimer]
 * @param {(id: any) => void} [deps.clearTimer]
 * @param {() => string} [deps.now]
 * @param {() => ({ userId: number, tenantId: number } | null)} [deps.getSession]
 * @param {() => void} [deps.onAuthLost] se llama ante 401/419: la cola se detiene.
 */
export function createSyncQueue({
    db,
    http,
    isOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false),
    setTimer = (fn, ms) => setTimeout(fn, ms),
    clearTimer = (id) => clearTimeout(id),
    now = () => new Date().toISOString(),
    getSession = getModuleSession,
    onAuthLost = () => {},
}) {
    let running = null;
    let attempt = 0;
    let timer = null;
    let stopped = false;
    const listeners = new Set();

    const notify = (summary) => listeners.forEach((fn) => fn(summary));

    const scheduleRetry = () => {
        if (timer || stopped) {
            return;
        }

        const delay = backoffDelay(attempt);
        attempt += 1;
        timer = setTimer(() => {
            timer = null;
            void flush();
        }, delay);
    };

    const cancelRetry = () => {
        if (timer) {
            clearTimer(timer);
            timer = null;
        }
    };

    async function enviarLote(lote, summary) {
        await Promise.all(lote.map((row) => db.updateDiagnostico(row.uuid_local, { sync_status: 'sending' })));

        try {
            const { data } = await http.post(SYNC_URL, { diagnosticos: lote.map(toPayload) });
            const confirmados = new Set(data?.confirmados || []);
            const rechazados = new Map((data?.rechazados || []).map((r) => [r.uuid_local, r.error]));

            await Promise.all(
                lote.map((row) => {
                    if (confirmados.has(row.uuid_local)) {
                        summary.confirmados += 1;
                        // hitl_dirty se conserva: la revision se confirma despues con PATCH.
                        return db.updateDiagnostico(row.uuid_local, {
                            sync_status: 'confirmed',
                            synced_at: now(),
                            last_error: null,
                            sync_rejected: false,
                        });
                    }

                    summary.rechazados += 1;

                    return db.updateDiagnostico(row.uuid_local, {
                        sync_status: 'error',
                        last_error: rechazados.get(row.uuid_local) || 'El servidor no confirmo el registro.',
                        sync_rejected: true,
                    });
                }),
            );

            return true;
        } catch (error) {
            if (error?.response?.status === 422) {
                const invalidos = erroresPorIndice(error.response.data);

                await Promise.all(
                    lote.map((row, index) =>
                        invalidos[index] !== undefined
                            ? db.updateDiagnostico(row.uuid_local, {
                                  sync_status: 'error',
                                  last_error: invalidos[index],
                                  sync_rejected: true,
                              })
                            : db.updateDiagnostico(row.uuid_local, { sync_status: 'pending' }),
                    ),
                );
                summary.rechazados += Object.keys(invalidos).length;
                // El resto del lote era valido: se reenvia enseguida, sin backoff.
                summary.reintentarYa = Object.keys(invalidos).length > 0 && Object.keys(invalidos).length < lote.length;

                return Object.keys(invalidos).length > 0;
            }

            const mensaje = mensajeDeError(error);

            if (esSesionPerdida(error)) {
                // Sin sesion valida no se reintenta: los registros esperan al dueno.
                summary.authLost = true;
                await Promise.all(
                    lote.map((row) => db.updateDiagnostico(row.uuid_local, { sync_status: 'pending', last_error: mensaje })),
                );
                summary.error = mensaje;

                return false;
            }

            await Promise.all(
                lote.map((row) =>
                    db.updateDiagnostico(row.uuid_local, {
                        sync_status: 'error',
                        last_error: mensaje,
                        retry_count: (row.retry_count || 0) + 1,
                    }),
                ),
            );
            summary.fallidos += lote.length;
            summary.error = mensaje;

            return false;
        }
    }

    async function enviarRevisiones(rows, summary, session) {
        // Las revisiones se envian solo desde la base de la cuenta activa; un tecnico
        // revisa diagnosticos de otros usuarios, asi que aqui no se exige ser el dueno.
        const revisiones = session ? rows.filter((row) => row.hitl_dirty && row.sync_status === 'confirmed') : [];

        for (const row of revisiones) {
            try {
                await http.patch(REVISION_URL(row.uuid_local), {
                    hitl_status: row.hitl_status,
                    etiqueta_humana: row.etiqueta_humana ?? null,
                });
                await db.updateDiagnostico(row.uuid_local, { hitl_dirty: false });
                summary.revisiones += 1;
            } catch (error) {
                const status = error?.response?.status;

                if (esSesionPerdida(error)) {
                    summary.authLost = true;
                    summary.error = mensajeDeError(error);

                    return false;
                }

                if (status === 403 || status === 404 || status === 422) {
                    // No se puede aplicar nunca: se descarta para no bloquear la cola.
                    await db.updateDiagnostico(row.uuid_local, { hitl_dirty: false, last_error: mensajeDeError(error) });
                    continue;
                }

                summary.error = mensajeDeError(error);

                return false;
            }
        }

        return true;
    }

    async function run() {
        const summary = {
            confirmados: 0,
            rechazados: 0,
            fallidos: 0,
            revisiones: 0,
            ajenos: 0,
            error: null,
            offline: false,
            authLost: false,
        };
        const session = getSession();

        if (stopped || !session) {
            summary.authLost = !session;

            return summary;
        }

        if (!isOnline()) {
            summary.offline = true;

            return summary;
        }

        const rows = await db.listDiagnosticos();
        const candidatos = rows.filter(esEnviable);
        // Defensa extra: nunca se envia un registro cuyo dueno no es la sesion activa.
        const ajenos = candidatos.filter((row) => !isOwnedBySession(row, session));
        const pendientes = candidatos.filter((row) => isOwnedBySession(row, session));

        if (ajenos.length) {
            summary.ajenos = ajenos.length;
            await Promise.all(
                ajenos.map((row) =>
                    db.updateDiagnostico(row.uuid_local, {
                        sync_status: 'quarantine',
                        last_error: 'El registro pertenece a otra cuenta y no se envia.',
                    }),
                ),
            );
        }

        let ok = true;

        for (const lote of chunk(pendientes)) {
            summary.reintentarYa = false;
            const loteOk = await enviarLote(lote, summary);

            if (summary.reintentarYa) {
                const vigentes = (await db.listDiagnosticos()).filter(
                    (row) => esEnviable(row) && lote.some((l) => l.uuid_local === row.uuid_local),
                );
                if (vigentes.length) {
                    ok = (await enviarLote(vigentes, summary)) && ok;
                }
            } else if (!loteOk) {
                ok = false;
                break;
            }
        }

        if (ok) {
            ok = await enviarRevisiones(await db.listDiagnosticos(), summary, session);
        }

        delete summary.reintentarYa;

        if (summary.authLost) {
            stopped = true;
            cancelRetry();
            onAuthLost(summary);
        } else if (ok) {
            attempt = 0;
            cancelRetry();
        } else {
            scheduleRetry();
        }

        return summary;
    }

    /**
     * Vacia la cola. Si ya hay un envio en curso, devuelve esa misma promesa
     * (candado): nunca hay dos envios simultaneos.
     */
    function flush() {
        if (!running) {
            running = run()
                .then((summary) => {
                    notify(summary);

                    return summary;
                })
                .finally(() => {
                    running = null;
                });
        }

        return running;
    }

    return {
        flush,
        subscribe(fn) {
            listeners.add(fn);

            return () => listeners.delete(fn);
        },
        get attempt() {
            return attempt;
        },
        get retryScheduled() {
            return timer !== null;
        },
        get stopped() {
            return stopped;
        },
        reset() {
            attempt = 0;
            cancelRetry();
        },
        /** Detiene la cola (logout o cambio de usuario): no envia ni reintenta mas. */
        stop() {
            stopped = true;
            attempt = 0;
            cancelRetry();
        },
    };
}
