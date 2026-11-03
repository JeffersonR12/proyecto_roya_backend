import { useMemo } from 'react';
import CaptureGuide from '../components/CaptureGuide.jsx';
import { ChevronGlyph } from '../components/Icons.jsx';
import { tiempoRelativo } from '../lib/alertas.js';
import { hallazgoCampo, toneDeClase } from '../lib/fieldFlow.js';

const RECENT_ROWS = 4;

function findingText(copy, finding) {
    if (finding.tipo === 'roya') {
        return copy.finding.roya(finding.n, finding.lote || copy.alerts.noLote);
    }
    if (finding.tipo === 'repetir') {
        return copy.finding.repetir(finding.n);
    }
    return copy.finding[finding.tipo];
}

export default function CampoPage({
    copy,
    lang,
    firstName,
    stats,
    analyses,
    pendingCount,
    staff,
    scanner,
    onOpenStat,
    onOpenHistory,
    onReview,
    onProtocol,
}) {
    const finding = useMemo(() => hallazgoCampo(analyses), [analyses]);
    const recent = useMemo(
        () => [...analyses].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, RECENT_ROWS),
        [analyses],
    );

    const action =
        finding.tipo === 'roya'
            ? staff
                ? { label: copy.alerts.actionReview, run: onReview }
                : { label: copy.whatToDo, run: onProtocol }
            : null;

    const kpis = [
        { id: 'all', label: copy.statTotal, value: stats.total },
        { id: 'roya_amarilla', label: copy.statRoya, value: stats.critical, tone: stats.critical > 0 ? 'roya' : '' },
        { id: 'no_concluyente', label: copy.statRepeat, value: stats.inconclusive },
    ];

    return (
        <div className="campo">
            <header className="campo-head">
                <div className="min-w-0">
                    <h1 className="campo-title">{firstName ? copy.hello(firstName) : copy.helloSub}</h1>
                    <p className={`campo-finding is-${finding.tipo}`}>{findingText(copy, finding)}</p>
                </div>
                {action ? (
                    <button type="button" className="campo-finding-action" onClick={action.run}>
                        {action.label}
                        <ChevronGlyph />
                    </button>
                ) : null}
            </header>

            <div className="campo-grid">
                <div className="campo-main">{scanner}</div>

                <aside className="campo-side">
                    <section className="campo-panel" aria-labelledby="campo-summary-title">
                        <div className="campo-panel-head">
                            <h2 id="campo-summary-title" className="campo-panel-title">
                                {copy.summaryTitle}
                            </h2>
                            <span className={`campo-sync ${pendingCount > 0 ? 'is-pending' : ''}`}>
                                {pendingCount > 0 ? copy.sync.pending(pendingCount) : copy.sync.all}
                            </span>
                        </div>
                        <div className="campo-kpis">
                            {kpis.map((kpi) => (
                                <button key={kpi.id} type="button" className="campo-kpi" onClick={() => onOpenStat(kpi.id)}>
                                    <span className="campo-kpi-label">{kpi.label}</span>
                                    <span className={`campo-kpi-value ${kpi.tone ? `is-${kpi.tone}` : ''}`}>{kpi.value}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="campo-panel" aria-labelledby="campo-recent-title">
                        <div className="campo-panel-head">
                            <h2 id="campo-recent-title" className="campo-panel-title">
                                {copy.recentTitle}
                            </h2>
                            {recent.length > 0 ? (
                                <button type="button" className="campo-link" onClick={onOpenHistory}>
                                    {copy.viewAll}
                                </button>
                            ) : null}
                        </div>
                        {recent.length === 0 ? (
                            <p className="campo-empty">{copy.recentEmpty}</p>
                        ) : (
                            <ul className="campo-recent">
                                {recent.map((row) => {
                                    const tone = toneDeClase(row.clase);
                                    return (
                                        <li key={row.uuid_local}>
                                            <button type="button" onClick={onOpenHistory}>
                                                {row.image_base64 ? (
                                                    <img src={row.image_base64} alt="" className="campo-recent-thumb" />
                                                ) : (
                                                    <span className="campo-recent-thumb" aria-hidden="true" />
                                                )}
                                                <span className="campo-recent-text">
                                                    <strong>{row.location || copy.alerts.noLote}</strong>
                                                    <small>{tiempoRelativo(row.created_at, { lang })}</small>
                                                </span>
                                                <span className={`campo-pill is-${tone}`}>{copy.short[tone]}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <CaptureGuide lang={lang} />
                </aside>
            </div>
        </div>
    );
}
