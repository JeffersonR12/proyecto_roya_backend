import { describe, expect, it } from 'vitest';
import {
    consultarAgente,
    detectarIntencion,
    puedeAfirmarRoya,
    registrarCorreccion,
} from './agente.js';

describe('guardrails del agente HITL', () => {
    it('rechaza diagnosticar una foto o entrenar la CNN', () => {
        expect(detectarIntencion('analiza esta foto de la hoja')).toBe('rechazo_diagnostico');
        expect(detectarIntencion('entrena la CNN con esta imagen')).toBe('rechazo_diagnostico');

        const r = consultarAgente({ pregunta: 'que enfermedad hay en esta imagen', rol: 'agricultor' });

        expect(r.no_analiza_foto).toBe(true);
        expect(r.afirma_roya).toBe(false);
        expect(r.texto.toLowerCase()).toContain('onnx');
        expect(r.texto.toLowerCase()).not.toMatch(/hay roya/);
    });

    it('no vende fungicidas ni recomienda marca', () => {
        const r = consultarAgente({ pregunta: 'que fungicida compro y aplico', rol: 'tecnico' });

        expect(r.intencion).toBe('rechazo_comercial');
        expect(r.texto.toLowerCase()).toContain('no vende');
        expect(r.acciones.some((a) => a.id === 'protocolo')).toBe(true);
    });

    it('nunca afirma Roya si el modelo no afirma', () => {
        expect(puedeAfirmarRoya({ clase: 'no_concluyente', confianza: 40 })).toBe(false);
        expect(puedeAfirmarRoya({ clase: 'roya_amarilla', confianza: 74 })).toBe(false);

        const r = consultarAgente({
            pregunta: 'explica este resultado',
            diagnostico: { clase: 'no_concluyente', confianza: 40, severidad: 80, hitl_status: 'pending' },
            rol: 'tecnico',
        });

        expect(r.afirma_roya).toBe(false);
        expect(r.texto.toLowerCase()).toContain('no afirma');
        expect(r.texto.toLowerCase()).not.toMatch(/hay roya/);
        expect(r.citas.some((c) => c.codigo === 'PHY-NC')).toBe(true);
    });

    it('cita el catalogo PHY-001 solo cuando la clase esta afirmada', () => {
        const r = consultarAgente({
            pregunta: 'cuando tratar segun severidad',
            diagnostico: {
                clase: 'roya_amarilla',
                confianza: 91,
                severidad: 12,
                hitl_status: 'pending',
            },
            rol: 'tecnico',
        });

        expect(r.afirma_roya).toBe(true);
        expect(r.citas.some((c) => c.codigo === 'PHY-001')).toBe(true);
        expect(r.texto).toContain('12%');
        expect(r.texto).toContain('30%');
        expect(r.texto.toLowerCase()).not.toContain('fungicida comercial');
    });
});

describe('asistencia HITL', () => {
    it('explica las 3 capas y pide otra muestra si no_concluyente', () => {
        const r = consultarAgente({
            pregunta: 'explica el resultado y pide otra foto',
            diagnostico: { uuid_local: 'u1', clase: 'no_concluyente', confianza: 51, severidad: null, hitl_status: 'pending' },
            rol: 'tecnico',
        });

        expect(r.texto.toLowerCase()).toContain('clase');
        expect(r.texto.toLowerCase()).toContain('confianza');
        expect(r.texto.toLowerCase()).toContain('severidad');
        expect(r.acciones.some((a) => a.id === 'resample')).toBe(true);
    });

    it('oculta acciones HITL al agricultor', () => {
        const r = consultarAgente({
            pregunta: 'validar este caso hitl',
            diagnostico: { uuid_local: 'u2', clase: 'otra_enfermedad', confianza: 88, severidad: null, hitl_status: 'pending' },
            rol: 'agricultor',
        });

        expect(r.acciones.some((a) => ['validar', 'rechazar', 'correccion', 'resample'].includes(a.id))).toBe(false);
    });

    it('la correccion humana no entrena en el celular', () => {
        const patch = registrarCorreccion({
            diagnostico: { uuid_local: 'u3', clase: 'roya_amarilla' },
            etiqueta_humana: 'otra_enfermedad',
        });

        expect(patch.entrena_en_dispositivo).toBe(false);
        expect(patch.destino).toBe('cola_laboratorio');
        expect(patch.etiqueta_modelo).toBe('roya_amarilla');
        expect(patch.etiqueta_humana).toBe('otra_enfermedad');
    });
});
