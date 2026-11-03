const PARCELAS_KEY = 'riwiscan-parcelas-v1';
const LOTE_KEY = 'riwiscan-lote-v1';

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function listParcelas() {
    const rows = readJson(PARCELAS_KEY, []);
    return Array.isArray(rows) ? rows : [];
}

export function saveParcelas(rows) {
    localStorage.setItem(PARCELAS_KEY, JSON.stringify(rows));
    return rows;
}

export function upsertParcela({ nombre, ubicacion = '', notas = '' }) {
    const trimmed = String(nombre || '').trim();
    if (!trimmed) {
        throw new Error('El lote necesita un nombre.');
    }

    const rows = listParcelas();
    const existing = rows.find((row) => row.nombre.toLowerCase() === trimmed.toLowerCase());

    if (existing) {
        existing.ubicacion = ubicacion || existing.ubicacion;
        existing.notas = notas || existing.notas;
        saveParcelas(rows);
        return existing;
    }

    const created = {
        id: crypto.randomUUID(),
        nombre: trimmed,
        ubicacion: String(ubicacion || '').trim(),
        notas: String(notas || '').trim(),
        created_at: new Date().toISOString(),
    };
    saveParcelas([created, ...rows]);
    return created;
}

export function removeParcela(id) {
    saveParcelas(listParcelas().filter((row) => row.id !== id));
}

export function getLastLote() {
    try {
        return localStorage.getItem(LOTE_KEY) || '';
    } catch {
        return '';
    }
}

export function setLastLote(nombre) {
    try {
        localStorage.setItem(LOTE_KEY, nombre || '');
    } catch {
        /* ignore */
    }
}

export function mergeParcelasFromAnalyses(analyses = []) {
    const stored = listParcelas();
    const seen = new Map(stored.map((row) => [row.nombre.toLowerCase(), { ...row, rows: [] }]));

    for (const analysis of analyses) {
        const nombre = analysis.location || 'Sin parcela';
        const key = nombre.toLowerCase();
        if (!seen.has(key)) {
            seen.set(key, { id: `scan-${key}`, nombre, ubicacion: '', notas: '', rows: [] });
        }
        seen.get(key).rows.push(analysis);
    }

    return Array.from(seen.values());
}
