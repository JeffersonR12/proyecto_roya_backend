import { BRAND_NAME } from '../lib/brand.js';

const STEPS = [
    {
        title: 'Fotografia la hoja bien',
        text: 'Luz de dia, hoja entera, 20-30 cm, fondo simple. Asi bajas los casos no_concluyente.',
    },
    {
        title: 'La IA corre en el celular',
        text: 'ONNX local: no necesitas internet para diagnosticar. FastAPI no es el camino critico.',
    },
    {
        title: 'Baja confianza no afirma Roya',
        text: 'Si la confianza es menor a 75% la clase pasa a no_concluyente. Confianza y severidad foliar son campos distintos.',
    },
];

export default function Onboarding({ onDone }) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-neutral/50 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal">Primer uso · {BRAND_NAME}</p>
                <h2 className="mt-2 text-2xl font-extrabold text-navy">Como trabajar en campo</h2>
                <ol className="mt-5 grid gap-4">
                    {STEPS.map((step, index) => (
                        <li key={step.title} className="flex gap-3">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal text-sm font-extrabold text-white">
                                {index + 1}
                            </span>
                            <div>
                                <p className="font-bold text-navy">{step.title}</p>
                                <p className="mt-1 text-sm leading-6 text-navy/60">{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
                <button type="button" onClick={onDone} className="mt-6 w-full rounded-full bg-teal py-3 font-extrabold text-white">
                    Entendido, ir a campo
                </button>
            </div>
        </div>
    );
}
