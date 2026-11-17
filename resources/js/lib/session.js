/**
 * Sesion local de la PWA: identifica a quien pertenecen los datos guardados
 * en este navegador. Todo almacenamiento local (IndexedDB y localStorage) se
 * separa por este scope para que dos cuentas en el mismo dispositivo nunca
 * vean ni envien los datos de la otra.
 */

let current = null;

export function scopeFor(user) {
    const userId = Number(user?.id);
    const tenantId = Number(user?.tenant_id);

    if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(tenantId) || tenantId <= 0) {
        return null;
    }

    return `t${tenantId}:u${userId}`;
}

export function setSession(user) {
    const scope = scopeFor(user);
    current = scope ? { userId: Number(user.id), tenantId: Number(user.tenant_id), scope } : null;

    return current;
}

export function getSession() {
    return current;
}

export function clearSession() {
    current = null;
}

export function requireSession() {
    if (!current) {
        throw new Error('No hay sesion activa: los datos locales no se pueden abrir sin usuario.');
    }

    return current;
}

/**
 * Clave de localStorage separada por cuenta. Sin sesion (pruebas, pantallas
 * publicas) devuelve la clave base.
 */
export function storageKey(base) {
    return current ? `${base}:${current.scope}` : base;
}

export function isOwnedBySession(row, session = current) {
    if (!session || !row) {
        return false;
    }

    return Number(row.owner_user_id) === session.userId && Number(row.owner_tenant_id) === session.tenantId;
}
