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
