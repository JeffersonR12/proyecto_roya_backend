// Cola Edge -> Cloud (rules.md §4): pending -> sending -> confirmed | error.
// Backoff exponencial y confirmacion del servidor ANTES de marcar confirmed.
// Las funciones puras se prueban sin IndexedDB ni red (syncQueue.test.js).

export const SYNC_BATCH_SIZE = 10;
export const BACKOFF_BASE_MS = 5_000;
export const BACKOFF_MAX_MS = 15 * 60_000;
export const STALE_SENDING_MS = 2 * 60_000;

const OK_STATUSES = new Set(['confirmed', 'already_exists']);
const FINAL_STATUSES = new Set(['conflict', 'rejected']);

export function nextRetryDelay(retryCount = 0) {
    const exp = BACKOFF_BASE_MS * 2 ** Math.max(0, retryCount);

    return Math.min(exp, BACKOFF_MAX_MS);
}

// ¿Este registro debe enviarse ahora?
export function isDue(row, now = Date.now()) {
    if (!row?.uuid_local || row.origen === 'cloud') {
        return false;
    }

    const status = row.sync_status || 'pending';

    if (status === 'pending') {
        return true;
    }

    if (status === 'error') {
        if (row.sync_final) {
            return false;
        }

        return !row.next_retry_at || Date.parse(row.next_retry_at) <= now;
    }

    // Quedo en "sending" porque se cerro la app a mitad de envio: el servidor es idempotente.
    if (status === 'sending') {
        return !row.sending_at || now - Date.parse(row.sending_at) >= STALE_SENDING_MS;
    }

    return false;
}

export function toSyncItem(row) {
    const item = {
        uuid_local: row.uuid_local,
        clase: row.clase,
        confianza: Number(row.confianza),
        severidad: row.severidad == null || row.severidad === '' ? null : Number(row.severidad),
        modelo_version: row.modelo_version,
        captured_at: row.captured_at,
        latitud: row.latitud ?? null,
        longitud: row.longitud ?? null,
        parcela_nombre: row.parcela_nota || null,
        hitl_status: row.hitl_status || null,
        etiqueta_humana: row.etiqueta_humana || null,
    };

    if (row.scores && typeof row.scores === 'object') {
        item.scores = row.scores;
    }

    if (typeof row.imagen_thumb === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(row.imagen_thumb)) {
        item.imagen_base64 = row.imagen_thumb;
    }

    return item;
}

export function successPatch(nowIso) {
    return {
        sync_status: 'confirmed',
        synced_at: nowIso,
        sync_error: null,
        sync_final: false,
        next_retry_at: null,
        sending_at: null,
    };
}

export function failurePatch(row, now = Date.now(), message = 'Sin conexion con el servidor.') {
    const retry = Number(row?.retry_count || 0) + 1;

    return {
        sync_status: 'error',
        retry_count: retry,
        next_retry_at: new Date(now + nextRetryDelay(retry - 1)).toISOString(),
        sync_error: message,
        sync_final: false,
        sending_at: null,
    };
}

export function finalErrorPatch(message) {
    return {
        sync_status: 'error',
        sync_error: message || 'El servidor rechazo el diagnostico.',
        sync_final: true,
        next_retry_at: null,
        sending_at: null,
    };
}

// Traduce el resultado por item del servidor a un patch local.
export function patchForResult(row, result, now = Date.now()) {
    if (!result) {
        return failurePatch(row, now, 'El servidor no confirmo este diagnostico.');
    }

    if (OK_STATUSES.has(result.status)) {
        return successPatch(new Date(now).toISOString());
    }

    if (FINAL_STATUSES.has(result.status)) {
        return finalErrorPatch(result.message);
    }

    return failurePatch(row, now, result.message);
}

// Patch para reintento manual (alerta "Reintentar" o cambio HITL local).
export function requeuePatch() {
    return {
        sync_status: 'pending',
        sync_final: false,
        sync_error: null,
        retry_count: 0,
        next_retry_at: null,
        sending_at: null,
    };
}

// Indices de items con errores de validacion: { "items.3.confianza": [...] } -> Map(3 => mensaje)
export function validationErrorsByIndex(errors = {}) {
    const byIndex = new Map();

    for (const [key, messages] of Object.entries(errors || {})) {
        const match = /^items\.(\d+)\./.exec(key);

        if (match && !byIndex.has(Number(match[1]))) {
            byIndex.set(Number(match[1]), Array.isArray(messages) ? messages[0] : String(messages));
        }
    }

    return byIndex;
}

function chunk(rows, size) {
    const out = [];

    for (let i = 0; i < rows.length; i += size) {
        out.push(rows.slice(i, i + size));
    }

    return out;
}

/**
 * Envia los diagnosticos pendientes. Dependencias inyectadas para poder probarlo:
 *  - list(): Promise<row[]>             (IndexedDB)
 *  - update(uuid, patch): Promise       (IndexedDB)
 *  - post(items): Promise<{ data }>     (axios.post al endpoint de sync)
 */
export async function syncPendientes({ list, update, post, now = () => Date.now(), batchSize = SYNC_BATCH_SIZE }) {
    const summary = { sent: 0, confirmed: 0, failed: 0, authRequired: false, offline: false };
    const due = (await list()).filter((row) => isDue(row, now()));

    for (const batch of chunk(due, batchSize)) {
        const sendingAt = new Date(now()).toISOString();
        await Promise.all(batch.map((row) => update(row.uuid_local, { sync_status: 'sending', sending_at: sendingAt })));

        let response;

        try {
            response = await post(batch.map(toSyncItem));
        } catch (error) {
            const status = error?.response?.status;

            if (status === 401 || status === 419) {
                summary.authRequired = true;
                await Promise.all(batch.map((row) => update(row.uuid_local, { sync_status: 'pending', sending_at: null })));
                return summary;
            }

            if (status === 422) {
                const byIndex = validationErrorsByIndex(error.response?.data?.errors);
                await Promise.all(
                    batch.map((row, index) =>
                        update(
                            row.uuid_local,
                            byIndex.has(index) ? finalErrorPatch(byIndex.get(index)) : failurePatch(row, now(), 'Lote rechazado; se reintentara.'),
                        ),
                    ),
                );
                summary.failed += byIndex.size;
                continue;
            }

            summary.offline = !status;
            await Promise.all(
                batch.map((row) => update(row.uuid_local, failurePatch(row, now(), status ? `Error del servidor (${status}).` : undefined))),
            );
            summary.failed += batch.length;
            // Sin red o servidor caido: no seguir martillando con mas lotes.
            return summary;
        }

        const results = new Map((response?.data?.data?.items || []).map((item) => [String(item.uuid_local).toLowerCase(), item]));

        for (const row of batch) {
            const result = results.get(String(row.uuid_local).toLowerCase());
            const patch = patchForResult(row, result, now());
            await update(row.uuid_local, patch);
            summary.sent += 1;

            if (patch.sync_status === 'confirmed') {
                summary.confirmed += 1;
            } else {
                summary.failed += 1;
            }
        }
    }

    return summary;
}
