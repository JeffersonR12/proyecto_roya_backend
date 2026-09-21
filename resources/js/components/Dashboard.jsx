import { CalendarGlyph, DownloadGlyph } from './Icons.jsx';
import { getRiskLevel, getRiskMeta, percent } from '../lib/risk.js';

function buildBars(analyses) {
    const days = Array.from({ length: 14 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (13 - index));
        return date;
    });

    const counts = days.map((day) =>
        analyses.filter((analysis) => {
            const created = new Date(analysis.created_at);
            return !Number.isNaN(created.getTime()) && created.toDateString() === day.toDateString();
        }).length,
    );

    const max = Math.max(...counts, 1);
    const today = new Date().toDateString();

    return days.map((day, index) => ({
        label: String(day.getDate()),
        count: counts[index],
        height: Math.max(18, (counts[index] / max) * 100),
        isToday: day.toDateString() === today,
    }));
}

function rangeLabel() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 13);
    const format = (date) =>
        `${date.getDate()} ${date.toLocaleDateString('es', { month: 'short' })}`;
    return `${format(start)} - ${format(end)}`;
}

export default function Dashboard({ analyses, stats, onInspect }) {
    const bars = buildBars(analyses);
    const recent = analyses.slice(0, 3);
    const todayBar = bars.find((bar) => bar.isToday);
    const todayLabel = todayBar ? `${todayBar.count} hoy` : '0 hoy';

    const downloadReport = () => {
        const header = 'fecha,diagnostico,afectacion,riesgo,ubicacion,tecnico';
        const rows = analyses.map((analysis) => {
            const meta = getRiskMeta(getRiskLevel(analysis.confidence));
            return [
                analysis.created_at,
                analysis.disease_detected,
                percent(analysis.confidence),
                meta.label,
                analysis.location || 'Sin ubicacion',
                analysis.user?.name || 'Sin asignar',
            ].join(',');
        });
        const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'inspecciones-roya.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <section>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Mis inspecciones</h1>
                <button type="button" onClick={downloadReport} className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2.5 text-sm font-bold text-white">
                    <DownloadGlyph />
                    Descargar reporte
                </button>
            </div>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-navy/55">
                <p className="inline-flex items-center gap-2 font-medium">
                    Periodo:
                    <span className="inline-flex items-center gap-2 rounded-full bg-sky px-3 py-1 font-semibold text-navy">
                        <CalendarGlyph className="text-teal" />
                        {rangeLabel()}
                    </span>
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-gold" /> Hoy
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-teal/40" /> Historico
                    </span>
                </div>
            </div>

            <div className="relative mb-10 h-64 pt-12">
                <div className="flex h-full items-end gap-2 sm:gap-3">
                    {bars.map((bar) => (
                        <div key={bar.label} className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                            {bar.isToday ? (
                                <div className="absolute bottom-[calc(100%+0.35rem)] z-10 whitespace-nowrap rounded-2xl bg-white px-3 py-2 text-center shadow-lg shadow-teal/10">
                                    <p className="text-sm font-extrabold text-teal">{todayLabel}</p>
                                    <p className="text-[10px] text-navy/40">Total del dia</p>
                                </div>
                            ) : null}
                            <div
                                className={`w-full max-w-[2.1rem] rounded-t-xl ${bar.isToday ? 'bg-gold' : 'bg-teal/25'}`}
                                style={{ height: `${bar.height}%` }}
                            />
                            <span className="text-[10px] font-semibold text-navy/40">{bar.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_.75fr]">
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-extrabold text-navy">Alertas recientes</h2>
                        <a href="#history-title" className="text-sm font-semibold text-teal">Mostrar todo</a>
                    </div>
                    <div className="divide-y divide-sky">
                        {recent.length === 0 ? (
                            <p className="py-10 text-center text-sm text-navy/40">No hay alertas recientes.</p>
                        ) : (
                            recent.map((analysis) => {
                                const meta = getRiskMeta(getRiskLevel(analysis.confidence));

                                return (
                                    <article key={analysis.id} className="flex items-center gap-4 py-4">
                                        <img
                                            src={analysis.image_base64}
                                            alt=""
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-bold text-navy">{analysis.disease_detected}</p>
                                            <p className="text-xs text-navy/40">{analysis.location || 'Sin ubicacion'}</p>
                                        </div>
                                        <span className={`hidden text-sm font-bold sm:inline ${meta.textClass}`}>{meta.label}</span>
                                        <span className="font-extrabold text-navy">{percent(analysis.confidence, 0)}</span>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </section>

                <aside className="app-promo">
                    <p className="text-lg font-extrabold leading-6 text-navy">Alerta de roya</p>
                    <p className="mt-2 text-sm leading-6 text-navy/70">Crea una captura de ultimo minuto para proteger el lote.</p>
                    <button type="button" onClick={onInspect} className="mt-5 rounded-full bg-gold px-5 py-2 text-sm font-extrabold text-navy">
                        Crear
                    </button>
                </aside>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-sky/70 p-4">
                    <p className="text-xs font-semibold text-navy/45">Total</p>
                    <p className="mt-2 text-3xl font-extrabold text-navy">{stats.total}</p>
                </div>
                <div className="rounded-3xl bg-gold/20 p-4">
                    <p className="text-xs font-semibold text-navy/45">Criticos</p>
                    <p className="mt-2 text-3xl font-extrabold text-navy">{stats.critical}</p>
                </div>
                <div className="rounded-3xl bg-teal/10 p-4">
                    <p className="text-xs font-semibold text-navy/45">Sanos</p>
                    <p className="mt-2 text-3xl font-extrabold text-teal">{stats.healthy}</p>
                </div>
            </div>
        </section>
    );
}
