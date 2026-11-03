import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getLastLote,
    listParcelas,
    mergeParcelasFromAnalyses,
    removeParcela,
    saveParcelas,
    setLastLote,
    upsertParcela,
} from './parcelasStore.js';

function memoryStorage() {
    const data = new Map();
    return {
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: (key) => data.delete(key),
    };
}

describe('parcelas en localStorage', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', memoryStorage());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('empieza vacio y crea un lote con id y fecha', () => {
        expect(listParcelas()).toEqual([]);

        const lote = upsertParcela({ nombre: '  Lote Norte ', ubicacion: ' Cusco ' });

        expect(lote.nombre).toBe('Lote Norte');
        expect(lote.ubicacion).toBe('Cusco');
        expect(lote.id).toBeTruthy();
        expect(lote.created_at).toBeTruthy();
        expect(listParcelas()).toHaveLength(1);
    });

    it('actualiza el lote existente sin distinguir mayusculas', () => {
        const original = upsertParcela({ nombre: 'Lote Norte', ubicacion: 'Cusco', notas: 'a' });
        const actualizado = upsertParcela({ nombre: 'lote norte', notas: 'b' });

        expect(actualizado.id).toBe(original.id);
        expect(actualizado.ubicacion).toBe('Cusco');
        expect(actualizado.notas).toBe('b');
        expect(listParcelas()).toHaveLength(1);
    });

    it('exige nombre', () => {
        expect(() => upsertParcela({ nombre: '   ' })).toThrow('El lote necesita un nombre.');
        expect(() => upsertParcela({})).toThrow();
    });

    it('elimina por id', () => {
        const a = upsertParcela({ nombre: 'A' });
        upsertParcela({ nombre: 'B' });

        removeParcela(a.id);

        expect(listParcelas().map((row) => row.nombre)).toEqual(['B']);
    });

    it('tolera JSON corrupto o datos que no son lista', () => {
        localStorage.setItem('riwiscan-parcelas-v1', '{no-json');
        expect(listParcelas()).toEqual([]);

        saveParcelas({ nombre: 'no es lista' });
        expect(listParcelas()).toEqual([]);
    });

    it('recuerda el ultimo lote', () => {
        expect(getLastLote()).toBe('');
        setLastLote('Lote Sur');
        expect(getLastLote()).toBe('Lote Sur');
        setLastLote(null);
        expect(getLastLote()).toBe('');
    });

    it('no falla si localStorage no esta disponible', () => {
        vi.stubGlobal('localStorage', {
            getItem: () => {
                throw new Error('bloqueado');
            },
            setItem: () => {
                throw new Error('bloqueado');
            },
        });

        expect(getLastLote()).toBe('');
        expect(() => setLastLote('X')).not.toThrow();
        expect(listParcelas()).toEqual([]);
    });

    it('agrupa analisis por lote y crea lotes desde los escaneos', () => {
        upsertParcela({ nombre: 'Lote Norte' });

        const grupos = mergeParcelasFromAnalyses([
            { uuid_local: '1', location: 'lote norte' },
            { uuid_local: '2', location: 'Lote Sur' },
            { uuid_local: '3' },
        ]);

        const porNombre = Object.fromEntries(grupos.map((g) => [g.nombre, g]));
        expect(porNombre['Lote Norte'].rows).toHaveLength(1);
        expect(porNombre['Lote Sur'].id).toBe('scan-lote sur');
        expect(porNombre['Sin parcela'].rows[0].uuid_local).toBe('3');
        expect(mergeParcelasFromAnalyses()).toHaveLength(1);
    });
});
