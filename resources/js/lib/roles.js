/**
 * Rol real del usuario. El servidor envia rol.nombre calculado desde la tabla
 * roles (User::rolEfectivo); la columna legacy users.role es solo respaldo.
 */
export function roleName(user) {
    return user?.rol?.nombre || user?.role || 'agricultor';
}

export function isStaff(user) {
    const role = roleName(user);

    return role === 'tecnico' || role === 'administrador';
}

export function canReviewHitl(user) {
    return isStaff(user);
}
