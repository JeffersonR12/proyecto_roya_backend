import { describe, expect, it } from 'vitest';
import { canReviewHitl, isStaff, roleName } from './roles.js';

describe('roles', () => {
    it('prioriza la relación rol (rol_id) sobre la columna de texto role', () => {
        expect(roleName({ rol: { nombre: 'tecnico' }, role: 'agricultor' })).toBe('tecnico');
        expect(roleName({ role: 'administrador' })).toBe('administrador');
    });

    it('asume agricultor (mínimo privilegio) si no hay rol', () => {
        expect(roleName(null)).toBe('agricultor');
        expect(roleName({})).toBe('agricultor');
    });

    it('solo técnico y administrador son staff y pueden revisar HITL', () => {
        expect(isStaff({ role: 'tecnico' })).toBe(true);
        expect(isStaff({ rol: { nombre: 'administrador' } })).toBe(true);
        expect(isStaff({ role: 'agricultor' })).toBe(false);
        expect(canReviewHitl({ role: 'tecnico' })).toBe(true);
        expect(canReviewHitl(undefined)).toBe(false);
    });
});
