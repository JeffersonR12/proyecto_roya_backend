import { afterEach, describe, expect, it } from 'vitest';
import { clearSession, isOwnedBySession, scopeFor, setSession, storageKey } from './session.js';
import { roleLabel } from './risk.js';
import { roleName } from './roles.js';

describe('sesion local', () => {
    afterEach(() => clearSession());

    it('arma el scope con tenant y usuario', () => {
        expect(scopeFor({ id: 30, tenant_id: 29 })).toBe('t29:u30');
        expect(scopeFor({ id: 30 })).toBeNull();
        expect(scopeFor(null)).toBeNull();
    });

    it('separa las claves de localStorage por cuenta', () => {
        expect(storageKey('riwiscan-parcelas-v1')).toBe('riwiscan-parcelas-v1');

        setSession({ id: 30, tenant_id: 29 });
        const ana = storageKey('riwiscan-parcelas-v1');
        setSession({ id: 32, tenant_id: 29 });
        const maria = storageKey('riwiscan-parcelas-v1');

        expect(ana).toBe('riwiscan-parcelas-v1:t29:u30');
        expect(maria).not.toBe(ana);
    });

    it('reconoce solo los registros de la cuenta activa', () => {
        const session = setSession({ id: 30, tenant_id: 29 });

        expect(isOwnedBySession({ owner_user_id: 30, owner_tenant_id: 29 }, session)).toBe(true);
        expect(isOwnedBySession({ owner_user_id: 32, owner_tenant_id: 29 }, session)).toBe(false);
        expect(isOwnedBySession({ owner_user_id: 30, owner_tenant_id: 30 }, session)).toBe(false);
        expect(isOwnedBySession({}, session)).toBe(false);
        expect(isOwnedBySession({ owner_user_id: 30, owner_tenant_id: 29 }, null)).toBe(false);
    });
});

describe('etiqueta de rol', () => {
    it('muestra la etiqueta correcta para los tres roles', () => {
        expect(roleLabel('administrador')).toBe('Administrador');
        expect(roleLabel('tecnico')).toBe('Técnico de campo');
        expect(roleLabel('agricultor')).toBe('Agricultor');
    });

    it('un rol desconocido se muestra como agricultor', () => {
        expect(roleLabel('visitante')).toBe('Agricultor');
        expect(roleLabel(undefined)).toBe('Agricultor');
    });

    it('usa rol.nombre del servidor antes que la columna legacy', () => {
        expect(roleName({ role: 'tecnico', rol: { nombre: 'agricultor' } })).toBe('agricultor');
    });
});
