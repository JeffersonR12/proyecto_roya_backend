import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    createDiagnosticosDb,
    dbNameFor,
    listDiagnosticos,
    saveDiagnostico,
} from './diagnosticosDb.js';
import { clearSession, setSession } from './session.js';

const ANA = { userId: 30, tenantId: 29, scope: 't29:u30' };
const MARIA = { userId: 32, tenantId: 29, scope: 't29:u32' };
const OTRO_TENANT = { userId: 33, tenantId: 30, scope: 't30:u33' };

function diag(uuid, overrides = {}) {
    return {
        uuid_local: uuid,
        clase: 'roya_amarilla',
        confianza: 90,
        modelo_version: 'roya-mobilenetv3-small-v1',
        captured_at: '2026-11-16T10:00:00.000Z',
        sync_status: 'pending',
        ...overrides,
    };
}

describe('base local por cuenta', () => {
    let idb;

    beforeEach(() => {
        idb = new IDBFactory();
    });

    afterEach(() => clearSession());

    it('cada cuenta usa una base distinta', () => {
        expect(dbNameFor(ANA.scope)).toBe('roya-edge:t29:u30');
        expect(dbNameFor(ANA.scope)).not.toBe(dbNameFor(MARIA.scope));
        expect(() => dbNameFor('')).toThrow();
    });

    it('dos cuentas del mismo navegador no ven los registros de la otra', async () => {
        const ana = createDiagnosticosDb(ANA, idb);
        const maria = createDiagnosticosDb(MARIA, idb);
        const otro = createDiagnosticosDb(OTRO_TENANT, idb);

        await ana.saveDiagnostico(diag('a-1'));
        await ana.saveDiagnostico(diag('a-2'));
        await otro.saveDiagnostico(diag('x-1'));

        expect((await ana.listDiagnosticos()).map((r) => r.uuid_local).sort()).toEqual(['a-1', 'a-2']);
        expect(await maria.listDiagnosticos()).toEqual([]);
        expect((await otro.listDiagnosticos()).map((r) => r.uuid_local)).toEqual(['x-1']);
    });

    it('sella el dueno al guardar y un patch no lo puede cambiar', async () => {
        const ana = createDiagnosticosDb(ANA, idb);

        const saved = await ana.saveDiagnostico(diag('a-1'));
        expect(saved).toMatchObject({ owner_user_id: 30, owner_tenant_id: 29 });

        await ana.updateDiagnostico('a-1', { sync_status: 'confirmed', owner_user_id: 99, owner_tenant_id: 99 });
        const [row] = await ana.listDiagnosticos();

        expect(row).toMatchObject({ sync_status: 'confirmed', owner_user_id: 30, owner_tenant_id: 29 });
    });

    it('los atajos sin sesion no abren ninguna base', async () => {
        clearSession();

        await expect(listDiagnosticos()).rejects.toThrow(/sesion/);
        await expect(saveDiagnostico(diag('z'))).rejects.toThrow(/sesion/);
    });

    it('los atajos usan la base de la sesion activa', async () => {
        setSession({ id: 41, tenant_id: 7 });
        await saveDiagnostico(diag('s-1'));

        setSession({ id: 42, tenant_id: 7 });
        expect(await listDiagnosticos()).toEqual([]);

        setSession({ id: 41, tenant_id: 7 });
        expect((await listDiagnosticos()).map((r) => r.uuid_local)).toEqual(['s-1']);
    });
});
