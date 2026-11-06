import { CLASE_LABELS } from './inference.js';

// Convierte un diagnostico de GET /api/diagnosticos al mismo view model que toViewModel().
export function fromApiDiagnostico(row) {
    const clase = row.clase || 'no_concluyente';

    return {
        id: row.uuid_local,
        uuid_local: row.uuid_local,
        clase,
        disease_detected: CLASE_LABELS[clase] || clase,
        confianza: row.confianza,
        confidence: Number(row.confianza) / 100,
        severidad: row.severidad,
        image_base64: row.imagen_url || null,
        location: row.parcela?.nombre || null,
        created_at: row.captured_at,
        modelo_version: row.modelo_version,
        sync_status: 'confirmed',
        hitl_status: row.hitl_status || (clase === 'sana' ? 'not_required' : 'pending'),
        etiqueta_humana: row.etiqueta_humana || null,
        latitud: row.latitud,
        longitud: row.longitud,
        autor: row.usuario?.name || null,
        origen: 'cloud',
    };
}

// Lo local manda: si el uuid existe en el dispositivo, se usa esa version (puede tener cambios sin enviar).
export function mergeDiagnosticos(localRows = [], cloudRows = []) {
    const localIds = new Set(localRows.map((row) => row.uuid_local));
    const merged = [...localRows, ...cloudRows.filter((row) => !localIds.has(row.uuid_local))];

    return merged.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
}
