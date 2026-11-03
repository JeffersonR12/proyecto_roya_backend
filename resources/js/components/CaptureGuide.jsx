import { copyFor, TIP_IDS } from '../lib/fieldFlow.js';
import { HandGlyph, LeafGlyph, RulerGlyph, SunGlyph } from './Icons.jsx';

const TIP_GLYPHS = {
    luz: SunGlyph,
    distancia: RulerGlyph,
    una: LeafGlyph,
    dedos: HandGlyph,
};

export function TipIcon({ id, className = 'h-5 w-5' }) {
    const Glyph = TIP_GLYPHS[id] || LeafGlyph;
    return <Glyph className={className} />;
}

export default function CaptureGuide({ lang = 'es', highlight = null }) {
    const copy = copyFor(lang);

    return (
        <section className="campo-panel" aria-labelledby="campo-tips-title">
            <h2 id="campo-tips-title" className="campo-panel-title">
                {copy.tipsTitle}
            </h2>
            <ul className="campo-tips">
                {TIP_IDS.map((id) => (
                    <li key={id} className={highlight === id ? 'is-on' : ''}>
                        <TipIcon id={id} />
                        {copy.tips[id]}
                    </li>
                ))}
            </ul>
        </section>
    );
}
