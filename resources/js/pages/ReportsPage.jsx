import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import {
    ORIGENES,
    REPORTS_API,
    buildParams,
    claseChartData,
    filenameFromDisposition,
    formatNumero,
    formatPct,
    serieChartData,
    validarRango,
} from '../lib/reportes.js';

// Paleta categórica validada (dataviz: slots 1-2, contraste >= 3:1 y separación CVD sobre #fff).
const SERIE = { total: '#2a78d6', roya: '#eb6834' };
const INK = { primary: '#0b0b0b', secondary: '#52514e', grid: '#e4e2dc' };
const AXIS_TICK = { fill: INK.secondary, fontSize: 12 };

// El texto de la leyenda va en tinta neutra; el color de la serie solo en el marcador.
function legendLabel(valor) {
    return <span style={{ color: INK.secondary }}>{valor}</span>;
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-lg">
            <p className="font-bold text-navy">{label}</p>
            {payload.map((item) => (
                <p key={item.dataKey} className="flex items-center gap-2 text-navy/80">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} aria-hidden="true" />
                    {item.name}: <strong className="text-navy">{item.value}</strong>
                </p>
            ))}
        </div>
    );
}

function Kpi({ label, value, detail }) {
    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <p className="text-sm font-semibold text-navy/60">{label}</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-navy">{value}</p>
            {detail ? <p className="mt-1 text-sm text-navy/60">{detail}</p> : null}
        </div>
    );
}

export default function ReportsPage() {
    const [filtros, setFiltros] = useState({ desde: '', hasta: '', origen: 'campo' });
    const [data, setData] = useState(null);
    const [estado, setEstado] = useState('cargando');
    const [error, setError] = useState('');
    const [exportando, setExportando] = useState(false);
    const errorRango = validarRango(filtros.desde, filtros.hasta);

    const cargar = useCallback(async () => {
        if (errorRango) {
            return;
        }
        setEstado('cargando');
        setError('');
        try {
            const response = await axios.get(`${REPORTS_API}/summary`, { params: buildParams(filtros) });
            setData(response.data.data);
            setEstado('listo');
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo cargar el reporte. Revisa tu conexión.');
            setEstado('error');
        }
    }, [filtros, errorRango]);

    useEffect(() => {
        void cargar();
    }, [cargar]);

    const exportar = async () => {
        setExportando(true);
        try {
            const response = await axios.get(`${REPORTS_API}/export`, { params: buildParams(filtros), responseType: 'blob' });
            const url = URL.createObjectURL(response.data);
            const enlace = document.createElement('a');
            enlace.href = url;
            enlace.download = filenameFromDisposition(response.headers['content-disposition']);
            enlace.click();
            URL.revokeObjectURL(url);
        } catch {
            setError('No se pudo exportar el CSV.');
        } finally {
            setExportando(false);
        }
    };

    const actualizar = (campo) => (event) => setFiltros((actual) => ({ ...actual, [campo]: event.target.value }));
    const ind = data?.indicadores;
    const barras = claseChartData(ind?.por_clase);
    const serie = serieChartData(data?.serie_mensual);
    const sinDatos = estado === 'listo' && !ind?.total_diagnosticos;

    return (
        <div>
            <PageHeader mode="reportes" kicker="Vigilancia de Roya Amarilla" title="Reportes">
                <p className="mt-2 max-w-3xl text-navy/65">
                    Indicadores calculados en vivo sobre los diagnósticos registrados en la base de datos, según tu tenant y tu rol.
                </p>
            </PageHeader>

            <form
                className="mb-5 flex flex-wrap items-end gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                aria-label="Filtros del reporte"
                onSubmit={(event) => event.preventDefault()}
            >
                <label className="grid gap-1 text-sm font-semibold text-navy/70" htmlFor="reporte-desde">
                    <span>Desde</span>
                    <input id="reporte-desde" type="date" value={filtros.desde} onChange={actualizar('desde')} className="rounded-xl border border-black/15 px-3 py-2 text-navy" />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-navy/70" htmlFor="reporte-hasta">
                    <span>Hasta</span>
                    <input id="reporte-hasta" type="date" value={filtros.hasta} onChange={actualizar('hasta')} className="rounded-xl border border-black/15 px-3 py-2 text-navy" aria-invalid={Boolean(errorRango)} />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-navy/70" htmlFor="reporte-origen">
                    <span>Origen de los datos</span>
                    <select id="reporte-origen" value={filtros.origen} onChange={actualizar('origen')} className="rounded-xl border border-black/15 px-3 py-2 text-navy">
                        {ORIGENES.map((origen) => (
                            <option key={origen.id} value={origen.id}>
                                {origen.label}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    type="button"
                    onClick={() => setFiltros({ desde: '', hasta: '', origen: filtros.origen })}
                    className="rounded-full px-4 py-2 text-sm font-bold text-teal hover:bg-teal/10"
                >
                    Limpiar fechas
                </button>
                <button
                    type="button"
                    onClick={exportar}
                    disabled={exportando || estado !== 'listo'}
                    className="ml-auto rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                    {exportando ? 'Exportando…' : 'Exportar CSV'}
                </button>
                {errorRango ? (
                    <p className="w-full text-sm font-semibold text-rose-700" role="alert">
                        {errorRango}
                    </p>
                ) : null}
            </form>

            {filtros.origen !== 'campo' ? (
                <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900" role="note">
                    Incluye datos sintéticos de demostración (DiagnosticoDemoSeeder, modelo «demo-seeder-v1»). No representan capturas de campo.
                </p>
            ) : null}

            {estado === 'error' || error ? (
                <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">
                    {error}
                </p>
            ) : null}

            <section className="grid gap-4 md:grid-cols-3" aria-label="Indicadores principales" aria-busy={estado === 'cargando'}>
                <Kpi label="Diagnósticos registrados" value={formatNumero(ind?.total_diagnosticos)} detail="Válidos en el período filtrado" />
                <Kpi
                    label="Incidencia de Roya Amarilla"
                    value={formatPct(ind?.porcentaje_roya)}
                    detail={ind ? `${ind.por_clase?.roya_amarilla ?? 0} casos de roya` : null}
                />
                <Kpi label="Confianza promedio del modelo" value={formatPct(ind?.confianza_promedio)} detail="Umbral de decisión: 75 %" />
            </section>

            {sinDatos ? (
                <p className="mt-5 rounded-3xl bg-white p-6 text-navy/70 shadow-sm ring-1 ring-black/5">
                    No hay diagnósticos válidos para estos filtros. Prueba otro rango de fechas u otro origen de datos.
                </p>
            ) : null}

            {estado === 'listo' && !sinDatos ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5" aria-labelledby="grafico-clases">
                        <h2 id="grafico-clases" className="text-lg font-extrabold text-navy">
                            Diagnósticos por clase
                        </h2>
                        <div className="mt-3 h-72" role="img" aria-label={barras.map((b) => `${b.etiqueta}: ${b.total}`).join(', ')}>
                            <ResponsiveContainer width="100%" height="100%">
                                {/* Barras horizontales: los nombres de clase se leen completos en el eje. */}
                                <BarChart data={barras} layout="vertical" margin={{ top: 8, right: 40, left: 8, bottom: 0 }} barCategoryGap="24%">
                                    <CartesianGrid horizontal={false} stroke={INK.grid} />
                                    <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="etiqueta" width={118} interval={0} tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: INK.grid }} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(42,120,214,0.08)' }} />
                                    <Bar dataKey="total" name="Diagnósticos" fill={SERIE.total} radius={[0, 4, 4, 0]} maxBarSize={40} isAnimationActive={false}>
                                        <LabelList dataKey="total" position="right" fill={INK.primary} fontSize={12} fontWeight={700} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5" aria-labelledby="grafico-evolucion">
                        <h2 id="grafico-evolucion" className="text-lg font-extrabold text-navy">
                            Evolución mensual
                        </h2>
                        <div className="mt-3 h-72" role="img" aria-label={serie.map((p) => `${p.etiqueta}: ${p.total} diagnósticos, ${p.roya_amarilla} con roya`).join('; ')}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={serie} margin={{ top: 16, right: 28, left: -12, bottom: 0 }}>
                                    <CartesianGrid vertical={false} stroke={INK.grid} />
                                    <XAxis dataKey="etiqueta" interval={0} tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: INK.grid }} />
                                    <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: INK.secondary, strokeDasharray: '3 3' }} />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                                        formatter={legendLabel}
                                    />
                                    <Line type="linear" dataKey="total" name="Diagnósticos" stroke={SERIE.total} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} isAnimationActive={false} />
                                    <Line type="linear" dataKey="roya_amarilla" name="Roya Amarilla" stroke={SERIE.roya} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <details className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 xl:col-span-2">
                        <summary className="cursor-pointer font-bold text-navy">Ver los datos en tabla</summary>
                        <table className="mt-3 w-full text-left text-sm text-navy">
                            <thead className="text-navy/60">
                                <tr>
                                    <th className="py-1">Mes</th>
                                    <th className="py-1">Diagnósticos</th>
                                    <th className="py-1">Roya Amarilla</th>
                                    <th className="py-1">Incidencia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serie.map((p) => (
                                    <tr key={p.mes} className="border-t border-black/5">
                                        <td className="py-1">{p.etiqueta}</td>
                                        <td className="py-1">{p.total}</td>
                                        <td className="py-1">{p.roya_amarilla}</td>
                                        <td className="py-1">{formatPct(p.porcentaje_roya)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </details>
                </div>
            ) : null}

            {data ? (
                <section className="mt-5 grid gap-3 text-sm text-navy/70 md:grid-cols-2" aria-label="Indicadores complementarios y calidad de datos">
                    <p className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5">
                        Severidad media de roya: <strong className="text-navy">{formatNumero(data.complementarios.severidad_promedio_roya, ' %')}</strong> · Validados por técnico:{' '}
                        <strong className="text-navy">{data.complementarios.hitl_validados}</strong> · Pendientes de revisión:{' '}
                        <strong className="text-navy">{data.complementarios.hitl_pendientes}</strong> · Mediana captura → nube:{' '}
                        <strong className="text-navy">{formatNumero(data.complementarios.latencia_sync_mediana_min, ' min')}</strong>
                    </p>
                    <p className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5">
                        Calidad de datos: <strong className="text-navy">{data.calidad_datos.descartados_sin_modelo}</strong> registros excluidos por haberse guardado sin
                        ejecutar el modelo (DEF-01) · <strong className="text-navy">{data.calidad_datos.fechas_inconsistentes}</strong> con fecha de sincronización
                        anterior a la captura.
                    </p>
                </section>
            ) : null}
        </div>
    );
}
