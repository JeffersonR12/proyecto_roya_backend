import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import FieldLens from './FieldLens.jsx';
import { BRAND_NAME, BRAND_TAGLINE, LOGO_URL } from '../lib/brand.js';
import { UMBRAL_CONFIANZA } from '../lib/inference.js';

const FACTS = [
    { title: 'Diagnostica sin señal', text: 'La IA corre en el celular y la captura se envía al volver la conexión.' },
    {
        title: `Afirma roya desde ${UMBRAL_CONFIANZA} %`,
        text: 'Por debajo, el resultado queda como no concluyente y pide otra foto.',
    },
    { title: 'Un técnico valida', text: 'Antes de tratar, confirma, rechaza o pide una nueva muestra.' },
];

const ease = [0.22, 1, 0.36, 1];

const story = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};

const rise = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

function useOnline() {
    const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => {
            window.removeEventListener('online', on);
            window.removeEventListener('offline', off);
        };
    }, []);

    return online;
}

export default function AuthShell({ children }) {
    const reduceMotion = useReducedMotion();
    const online = useOnline();
    const start = reduceMotion ? false : 'hidden';

    return (
        <div className="auth">
            <a className="intro-skip" href="#auth-form">
                Ir al formulario
            </a>

            <aside className="auth-field">
                <header className="auth-brand">
                    <a href="/login">
                        <img src={LOGO_URL} alt="" />
                        <span>
                            <strong>{BRAND_NAME}</strong>
                            <small>{BRAND_TAGLINE}</small>
                        </span>
                    </a>
                    <output className={`auth-status ${online ? '' : 'is-offline'}`}>
                        <span className="auth-status-dot" aria-hidden="true" />
                        {online ? 'Diagnóstico local listo' : 'Sin señal: diagnóstico local'}
                    </output>
                </header>

                <FieldLens />

                <motion.div className="auth-story" variants={story} initial={start} animate="show">
                    <motion.p className="auth-statement" variants={rise}>
                        La roya amarilla avanza en franjas. Detéctala en la primera hoja.
                    </motion.p>
                    <motion.ul className="auth-facts" variants={rise}>
                        {FACTS.map((fact) => (
                            <li key={fact.title}>
                                <strong>{fact.title}</strong>
                                <span>{fact.text}</span>
                            </li>
                        ))}
                    </motion.ul>
                    <motion.p className="auth-credit" variants={rise}>
                        Foto:{' '}
                        <a href="https://commons.wikimedia.org/wiki/File:Dz._r%C5%ABsa_z.tritik%C4%81le_2015.jpg">
                            “Dz. rūsa z.tritikāle 2015”
                        </a>
                        , Brauna55, CC BY-SA 4.0, vía Wikimedia Commons.
                    </motion.p>
                </motion.div>
            </aside>

            <main className="auth-main">
                <header className="auth-bar">
                    <div className="intro-lang" role="group" aria-label="Idioma">
                        <button type="button" className="is-active" aria-pressed="true">
                            Español
                        </button>
                        <button type="button" disabled title="Próximamente" aria-disabled="true">
                            English
                        </button>
                    </div>
                    <a className="intro-help" href="mailto:soporte@riwiscan.pe">
                        Mesa de ayuda
                    </a>
                </header>
                <motion.div
                    className="auth-form-wrap"
                    id="auth-form"
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
