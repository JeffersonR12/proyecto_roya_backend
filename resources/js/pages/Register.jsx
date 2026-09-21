import { useState } from 'react';
import axios from 'axios';
import AuthShell from '../components/AuthShell.jsx';
import { EyeGlyph, EyeOffGlyph, LockGlyph, UserGlyph } from '../components/Icons.jsx';
import { firstError } from '../components/Field.jsx';
import { isGmailEmail } from '../lib/auth.js';

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    organization: '',
    role: 'tecnico',
    password: '',
    password_confirmation: '',
    terms: false,
};

export default function Register({ urls }) {
    const [form, setForm] = useState(emptyForm);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const update = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        const payload = {
            ...form,
            email: form.email.trim().toLowerCase(),
        };

        if (!isGmailEmail(payload.email)) {
            setErrors({ email: ['El correo debe tener el formato usuario@gmail.com.'] });
            setSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(urls.register, payload);
            window.location.href = response.data.redirect ?? urls.home;
        } catch (error) {
            setErrors(error.response?.data?.errors ?? { email: ['No se pudo crear la cuenta.'] });
            setSubmitting(false);
        }
    };

    return (
        <AuthShell>
            <div className="mx-auto flex flex-col items-center">
                <div className="hex-avatar-static">
                    <UserGlyph className="h-10 w-10" />
                </div>
                <div className="glass-panel">
                    <h1 className="mb-5 text-center text-3xl font-light tracking-wide">Crear cuenta</h1>
                    <form onSubmit={submit} className="space-y-3" noValidate>
                        <input className="auth-input px-4 py-3" placeholder="Nombre completo" value={form.name} onChange={(event) => update('name', event.target.value)} required />
                        {firstError(errors, 'name') ? <p className="text-xs text-red-100">{firstError(errors, 'name')}</p> : null}

                        <label className="relative block">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/80">
                                <UserGlyph className="h-5 w-5" />
                            </span>
                            <input type="text" inputMode="email" autoComplete="email" className="auth-input py-3 pl-12 pr-4" placeholder="usuario@gmail.com" value={form.email} onChange={(event) => update('email', event.target.value)} required />
                        </label>
                        {firstError(errors, 'email') ? <p className="text-xs text-red-100">{firstError(errors, 'email')}</p> : null}

                        <div className="grid gap-3 sm:grid-cols-2">
                            <input className="auth-input px-4 py-3" placeholder="Telefono" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
                            <input className="auth-input px-4 py-3" placeholder="Finca o cooperativa" value={form.organization} onChange={(event) => update('organization', event.target.value)} />
                        </div>

                        <select className="auth-input px-4 py-3" value={form.role} onChange={(event) => update('role', event.target.value)}>
                            <option value="tecnico">Tecnico de campo</option>
                            <option value="administrador">Administrador</option>
                        </select>

                        <label className="relative block">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/80">
                                <LockGlyph />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="auth-input py-3 pl-12 pr-12"
                                placeholder="Contraseña"
                                value={form.password}
                                onChange={(event) => update('password', event.target.value)}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-500" aria-label="Mostrar contraseña">
                                {showPassword ? <EyeOffGlyph /> : <EyeGlyph />}
                            </button>
                        </label>
                        {firstError(errors, 'password') ? <p className="text-xs text-red-100">{firstError(errors, 'password')}</p> : null}

                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="auth-input px-4 py-3"
                            placeholder="Confirmar contraseña"
                            value={form.password_confirmation}
                            onChange={(event) => update('password_confirmation', event.target.value)}
                            required
                        />

                        <label className="flex items-start gap-2 px-1 text-xs text-white/90">
                            <input type="checkbox" checked={form.terms} onChange={(event) => update('terms', event.target.checked)} className="mt-0.5 h-3.5 w-3.5" />
                            <span>Acepto el uso de datos para inspecciones agricolas.{firstError(errors, 'terms') ? <span className="block text-red-100">{firstError(errors, 'terms')}</span> : null}</span>
                        </label>

                        <button type="submit" disabled={submitting} className="auth-login-btn">
                            {submitting ? 'Creando...' : 'Registrarme'}
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-white/90">
                        Ya tienes cuenta?{' '}
                        <a href={urls.login} className="font-bold underline">
                            Iniciar sesion
                        </a>
                    </p>
                </div>
            </div>
        </AuthShell>
    );
}
