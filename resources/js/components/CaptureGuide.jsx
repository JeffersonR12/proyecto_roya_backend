import { useState } from 'react';

const STEPS = [
    { id: 'luz', text: 'Luz natural, evita sombra fuerte y flash.' },
    { id: 'distancia', text: 'Hoja entera a 20–30 cm, nítida, sin dedos tapando.' },
    { id: 'una', text: 'Una hoja por foto. Fondo simple (suelo o cartón).' },
    { id: 'umbral', text: 'Si sale no_concluyente, repite. No interpretes eso como Roya.' },
];

export default function CaptureGuide() {
    const [done, setDone] = useState({});

    const toggle = (id) => {
        setDone((current) => ({ ...current, [id]: !current[id] }));
    };

    return (
        <aside className="rounded-[1.75rem] border border-teal/20 bg-white p-5">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal">Guía de captura</p>
            <h2 className="mt-1 text-lg font-extrabold text-navy">Para bajar no_concluyente</h2>
            <ul className="mt-4 grid gap-2">
                {STEPS.map((step) => (
                    <li key={step.id}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl px-1 py-1.5 hover:bg-sky/70">
                            <input
                                type="checkbox"
                                checked={Boolean(done[step.id])}
                                onChange={() => toggle(step.id)}
                                className="mt-1 h-4 w-4 accent-teal"
                            />
                            <span className={`text-sm leading-6 ${done[step.id] ? 'text-navy/40 line-through' : 'text-navy/70'}`}>
                                {step.text}
                            </span>
                        </label>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
