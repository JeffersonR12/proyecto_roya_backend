/**
 * Descarga el historial del servidor y lo combina con IndexedDB.
 *
 * Reglas de combinacion por uuid_local:
 * - Si solo existe en el servidor, se crea localmente (otro dispositivo o,
 *   para tecnico/administrador, otro usuario del tenant).
 * - Si existe en los dos, el registro ya esta en el servidor: queda confirmed.
 * - Los campos de revision (hitl_status, etiqueta_humana) los manda el
 *   servidor, salvo que haya una revision local aun no enviada (hitl_dirty).
 */

export const LIST_URL = '/api/diagnosticos';
export const PAGE_SIZE = 200;
export const MAX_PAGES = 10;

export class SessionMismatchError extends Error {
    constructor() {
        super('La sesion del servidor no coincide con la de este dispositivo.');
        this.name = 'SessionMismatchError';
    }
}

export function fromServer(row, tenantId = null) {
    return {
        uuid_local: row.uuid_local,
        // Dueno real: un tecnico descarga diagnosticos de otros usuarios del tenant.
        owner_user_id: row.usuario?.id ?? null,
        owner_tenant_id: tenantId,
        clase: row.clase,
        confianza: row.confianza,
        severidad: row.severidad ?? null,
        scores: null,
        imagen_thumb: null,
        imagen_url: row.imagen_url ?? null,
        parcela_nota: row.ubicacion ?? null,
        latitud: row.latitud ?? null,
        longitud: row.longitud ?? null,
        modelo_version: row.modelo_version,
        sync_status: 'confirmed',
        synced_at: row.synced_at ?? null,
        hitl_status: row.hitl_status ?? null,
        etiqueta_humana: row.etiqueta_humana ?? null,
        usuario_nombre: row.usuario?.name ?? null,
        retry_count: 0,
        captured_at: row.captured_at,
        origen: 'servidor',
    };
}

/**
 * @returns {object[]} registros a escribir en IndexedDB (nuevos o cambiados).
 */
export function mergeServerRows(localRows, serverRows, tenantId = null) {
    const locales = new Map(localRows.map((row) => [row.uuid_local, row]));
    const cambios = [];

    serverRows.forEach((server) => {
        if (!server?.uuid_local) {
            return;
        }

        const local = locales.get(server.uuid_local);

        if (!local) {
            cambios.push(fromServer(server, tenantId));

            return;
        }

        const merged = {
            ...local,
            sync_status: 'confirmed',
            sync_rejected: false,
            last_error: null,
            imagen_url: server.imagen_url ?? local.imagen_url ?? null,
            usuario_nombre: server.usuario?.name ?? local.usuario_nombre ?? null,
        };

        if (!local.hitl_dirty) {
            merged.hitl_status = server.hitl_status ?? local.hitl_status;
            merged.etiqueta_humana = server.etiqueta_humana ?? null;
        }

        const changed = ['sync_status', 'hitl_status', 'etiqueta_humana', 'imagen_url', 'usuario_nombre'].some(
            (key) => (merged[key] ?? null) !== (local[key] ?? null),
        );

        if (changed) {
            cambios.push(merged);
        }
    });

    return cambios;
}

/**
 * @param {{ userId: number, tenantId: number } | null} session si se indica, se
 *        exige que el servidor responda para ese mismo usuario.
 */
export async function fetchServerRows(http, { maxPages = MAX_PAGES, session = null } = {}) {
    const rows = [];
    let page = 1;
    let lastPage = 1;
    let tenantId = session?.tenantId ?? null;

    do {
        const { data } = await http.get(LIST_URL, { params: { page, per_page: PAGE_SIZE } });
        const meta = data?.meta || {};

        if (session && meta.usuario_id !== undefined && Number(meta.usuario_id) !== session.userId) {
            throw new SessionMismatchError();
        }

        tenantId = meta.tenant_id ?? tenantId;
        rows.push(...(data?.data || []));
        lastPage = meta.last_page || 1;
        page += 1;
    } while (page <= lastPage && page <= maxPages);

    return { rows, tenantId };
}

/**
 * Descarga y guarda. Devuelve cuantos registros locales cambiaron.
 * Lanza SessionMismatchError si el servidor responde para otro usuario.
 */
export async function pullAndMerge({ db, http, session = null }) {
    const { rows: serverRows, tenantId } = await fetchServerRows(http, { session });
    const cambios = mergeServerRows(await db.listDiagnosticos(), serverRows, tenantId);

    for (const row of cambios) {
        await db.saveDiagnostico(row);
    }

    return cambios.length;
}
