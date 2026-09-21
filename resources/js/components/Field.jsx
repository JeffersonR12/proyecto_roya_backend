export function firstError(errors, field) {
    const value = errors?.[field];

    if (Array.isArray(value)) {
        return value[0];
    }

    return value ?? '';
}

export default function Field({ id, label, error, children }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
                {label}
            </label>
            {children}
            {error ? <p className="mt-1.5 text-sm text-copper">{error}</p> : null}
        </div>
    );
}

export const inputClass =
    'w-full rounded-xl border border-moss/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-leaf focus:ring-2 focus:ring-leaf/20';
