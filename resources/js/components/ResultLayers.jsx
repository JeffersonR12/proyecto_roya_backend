import { UMBRAL_CONFIANZA } from '../lib/inference.js';

export default function ResultLayers({ result, onClose }) {
    if (!result) {
        return null;
    }

    const afirma = result.clase !== 'no_concluyente';

    return (
        <div className="rounded-2xl border border-teal/20 bg-white p-5 text-navy shadow-xl">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal">Resultado en 3 capas</p>
                    <h3 className="mt-1 text-xl font-extrabold">{result.label}</h3>
                </div>
                {onClose ? (
                    <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-xs text-navy/50">
                        Cerrar
                    </button>
                ) : null}
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-sky p-3">
                    <dt className="text-[10px] font-bold uppercase text-navy/40">Clase</dt>
                    <dd className="mt-1 text-sm font-extrabold">{result.clase}</dd>
                </div>
                <div className="rounded-2xl bg-sky p-3">
                    <dt className="text-[10px] font-bold uppercase text-navy/40">Confianza</dt>
                    <dd className="mt-1 text-sm font-extrabold">{result.confianza}%</dd>
                </div>
                <div className="rounded-2xl bg-sky p-3">
                    <dt className="text-[10px] font-bold uppercase text-navy/40">Severidad</dt>
                    <dd className="mt-1 text-sm font-extrabold">{result.severidad == null ? 'N/D' : `${result.severidad}%`}</dd>
                </div>
            </dl>
            {result.runtime === 'placeholder-uniform' ? (
                <p className="mt-4 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                    Sin pesos CNN. La foto no se analizo. Coloca public/models/modelo_roya.onnx (MobileNetV3-Small, 3
                    clases) y vuelve a escanear. Este no_concluyente no es un diagnostico de la hoja.
                </p>
            ) : !afirma ? (
                <p className="mt-4 rounded-2xl bg-gold/20 px-3 py-2 text-sm font-semibold">
                    Confianza {result.confianza}% (&lt; {UMBRAL_CONFIANZA}%). El sistema no afirma diagnostico.
                </p>
            ) : null}
            <p className="mt-3 text-sm leading-6 text-navy/70">{result.recommendation}</p>
            <p className="mt-2 text-[11px] text-navy/40">
                {result.modelo_version}
                {result.latency_ms != null ? ` · ${result.latency_ms} ms` : ''}
                {result.sync_status ? ` · sync ${result.sync_status}` : ''}
            </p>
        </div>
    );
}
