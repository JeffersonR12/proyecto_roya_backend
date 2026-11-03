import { describe, expect, it } from 'vitest';
import { COPY, consejoPara, hallazgoCampo, resultTone, seguridad, stepFor, TIP_IDS, toneDeClase } from './fieldFlow.js';

describe('hallazgo de la pantalla de campo', () => {
    const fila = (clase, extra = {}) => ({ clase, hitl_status: 'pending', location: 'Lote Norte', created_at: '2026-10-29T10:00:00Z', ...extra });

    it('sin revisiones invita a empezar', () => {
        expect(hallazgoCampo([])).toEqual({ tipo: 'vacio' });
    });

    it('la roya sin revisar manda y cuenta solo las hojas del lote que nombra', () => {
        const rows = [
            fila('roya_amarilla'),
            fila('roya_amarilla'),
            fila('roya_amarilla', { location: 'Lote Sur', created_at: '2026-10-28T10:00:00Z' }),
            fila('no_concluyente'),
        ];
        expect(hallazgoCampo(rows)).toEqual({ tipo: 'roya', lote: 'Lote Norte', n: 2 });
    });

    it('la roya ya validada no es urgente; pasan las fotos por repetir', () => {
        const rows = [fila('roya_amarilla', { hitl_status: 'validated' }), fila('no_concluyente'), fila('no_concluyente')];
        expect(hallazgoCampo(rows)).toEqual({ tipo: 'repetir', n: 2 });
    });

    it('distingue roya ya revisada de un campo limpio', () => {
        expect(hallazgoCampo([fila('roya_amarilla', { hitl_status: 'validated' })]).tipo).toBe('revisada');
        expect(hallazgoCampo([fila('sana', { hitl_status: 'not_required' })]).tipo).toBe('limpio');
    });

    it('traduce la clase guardada a su tono', () => {
        expect(toneDeClase('roya_amarilla')).toBe('roya');
        expect(toneDeClase('no_concluyente')).toBe('repetir');
        expect(toneDeClase(undefined)).toBe('repetir');
    });
});

describe('stepper de campo', () => {
    it('empieza en elegir lote', () => {
        expect(stepFor({ loteDecidido: false, hasImage: false, hasResult: false })).toBe(1);
    });

    it('salta a la foto si ya hay lote', () => {
        expect(stepFor({ loteDecidido: true, hasImage: false, hasResult: false })).toBe(2);
    });

    it('muestra resultado cuando existe', () => {
        expect(stepFor({ loteDecidido: true, hasImage: true, hasResult: true })).toBe(3);
    });
});

describe('semáforo del resultado', () => {
    it('verde para hoja sana', () => {
        expect(resultTone({ clase: 'sana', confianza: 95 })).toBe('sana');
    });

    it('rojo para roya amarilla', () => {
        expect(resultTone({ clase: 'roya_amarilla', confianza: 88 })).toBe('roya');
    });

    it('gris para no concluyente', () => {
        expect(resultTone({ clase: 'no_concluyente', confianza: 40 })).toBe('repetir');
    });

    it('gris cuando no hubo análisis real, aunque diga sana', () => {
        expect(resultTone({ clase: 'sana', confianza: 99, runtime: 'placeholder-uniform' })).toBe('repetir');
    });

    it('ámbar para otra enfermedad', () => {
        expect(resultTone({ clase: 'otra_enfermedad', confianza: 80 })).toBe('otra');
    });
});

describe('textos para el agricultor', () => {
    it('traduce la confianza a palabras', () => {
        expect(seguridad(95)).toBe('alto');
        expect(seguridad(80)).toBe('medio');
        expect(seguridad(50)).toBe('bajo');
    });

    it('rota los consejos de captura', () => {
        expect(consejoPara(0)).toBe(TIP_IDS[0]);
        expect(consejoPara(TIP_IDS.length + 1)).toBe(TIP_IDS[1]);
    });

    it('no usa jerga técnica en ningún idioma', () => {
        const prohibido = /cnn|onnx|indexeddb|edge|inferencia|inference|uuid|no_concluyente|hitl/i;
        for (const lang of Object.keys(COPY)) {
            const plano =
                JSON.stringify(COPY[lang]) +
                COPY[lang].hello('Ana') +
                COPY[lang].finding.roya(2, 'Lote Norte') +
                COPY[lang].finding.repetir(3);
            expect(plano).not.toMatch(prohibido);
        }
    });

    it('español e inglés tienen las mismas claves', () => {
        expect(Object.keys(COPY.en).sort()).toEqual(Object.keys(COPY.es).sort());
        expect(Object.keys(COPY.en.results).sort()).toEqual(Object.keys(COPY.es.results).sort());
    });
});
