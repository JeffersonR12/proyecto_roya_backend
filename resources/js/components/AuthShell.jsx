import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import IntroPanel from './IntroPanel.jsx';
import PaperWaves from './PaperWaves.jsx';

export default function AuthShell({ children }) {
    const reduceMotion = useReducedMotion();
    const [shift, setShift] = useState({ x: 0, y: 0 });

    const onMove = (event) => {
        if (reduceMotion) {
            return;
        }
        const box = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        setShift({ x: x * 22, y: y * 14 });
    };

    return (
        <div className="intro-shell">
            <a className="intro-skip" href="#intro-form">
                Ir al formulario
            </a>
            <div className="intro-stage" onMouseMove={onMove} onMouseLeave={() => setShift({ x: 0, y: 0 })}>
                <IntroPanel shift={shift} />
                <PaperWaves shift={shift} />
                <section className="intro-form-pane">
                    <header className="intro-form-bar">
                        <div className="intro-lang" role="group" aria-label="Idioma">
                            <button type="button" className="is-active" aria-pressed="true">
                                Español
                            </button>
                            <button type="button" disabled title="Proximamente" aria-disabled="true">
                                English
                            </button>
                        </div>
                        <a className="intro-help" href="mailto:soporte@riwiscan.pe">
                            Mesa de ayuda
                        </a>
                    </header>
                    <motion.div
                        className="intro-form-wrap"
                        id="intro-form"
                        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {children}
                    </motion.div>
                </section>
            </div>
        </div>
    );
}
