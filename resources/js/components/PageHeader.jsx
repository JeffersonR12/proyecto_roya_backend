import { MODE_LABELS } from '../lib/nav.js';

export default function PageHeader({ mode, kicker, title, children }) {
    return (
        <header className="mb-5">
            <p className="app-crumb">
                <span>RiwiScan</span>
                <span aria-hidden="true">/</span>
                <span>{MODE_LABELS[mode] || mode}</span>
            </p>
            {kicker ? <p className="text-sm font-semibold text-teal">{kicker}</p> : null}
            <h1 id={`${mode}-title`} className="mt-1 text-3xl font-extrabold text-navy sm:text-4xl">{title}</h1>
            {children}
        </header>
    );
}
