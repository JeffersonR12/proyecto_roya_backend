import { describe, expect, it } from 'vitest';
import {
    buildParams,
    claseChartData,
    filenameFromDisposition,
    formatNumero,
    formatPct,
    mesLabel,
    serieChartData,
    validarRango,
} from './reportes.js';

describe('filtros del reporte', () => {
    it('envía solo las fechas con valor y siempre el origen', () => {
        expect(buildParams()).toEqual({ origen: 'campo' });
        expect(buildParams({ desde: '2026-06-01', hasta: '', origen: 'demo' })).toEqual({ origen: 'demo', desde: '2026-06-01' });
    });

    it('rechaza un rango invertido', () => {
        expect(validarRango('2026-11-10', '2026-11-01')).toMatch('no puede ser anterior');
        expect(validarRango('2026-11-01', '2026-11-10')).toBe('');
        expect(validarRango('', '2026-11-10')).toBe('');
    });
});

describe('datos para los gráficos', () => {
    it('convierte el conteo por clase a barras con etiqueta legible', () => {
        expect(claseChartData({ sana: 3, roya_amarilla: '2', otra_enfermedad: 0, no_concluyente: 1 })).toEqual([
            { clase: 'sana', etiqueta: 'Sana', total: 3 },
            { clase: 'roya_amarilla', etiqueta: 'Roya Amarilla', total: 2 },
            { clase: 'otra_enfermedad', etiqueta: 'Otra enfermedad', total: 0 },
            { clase: 'no_concluyente', etiqueta: 'No concluyente', total: 1 },
        ]);
        expect(claseChartData()).toEqual([]);
    });

    it('etiqueta los meses en español', () => {
        expect(mesLabel('2026-06')).toBe('jun 2026');
        expect(mesLabel('2026-11')).toBe('nov 2026');
        expect(mesLabel('sin-fecha')).toBe('sin-fecha');
        expect(serieChartData([{ mes: '2026-06', total: 5 }])).toEqual([{ mes: '2026-06', total: 5, etiqueta: 'jun 2026' }]);
    });
});

describe('formatos', () => {
    it('muestra un guion cuando no hay datos (sin dividir entre cero)', () => {
        expect(formatPct(null)).toBe('—');
        // es-PE (CLDR) usa punto decimal.
        expect(formatPct(37.5)).toBe('37.5 %');
        expect(formatNumero(undefined)).toBe('—');
        expect(formatNumero(86.04, ' %')).toBe('86 %');
    });

    it('obtiene el nombre del CSV desde Content-Disposition', () => {
        expect(filenameFromDisposition('attachment; filename=reporte_diagnosticos_20261110_120000.csv')).toBe(
            'reporte_diagnosticos_20261110_120000.csv',
        );
        expect(filenameFromDisposition('attachment; filename="r.csv"')).toBe('r.csv');
        expect(filenameFromDisposition(null)).toBe('reporte_diagnosticos.csv');
    });
});
