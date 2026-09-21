import { useState } from 'react';
import axios from 'axios';
import AuthShell from '../components/AuthShell.jsx';
import { EyeGlyph, EyeOffGlyph, LockGlyph, UserGlyph } from '../components/Icons.jsx';
import { firstError } from '../components/Field.jsx';
import { isGmailEmail } from '../lib/auth.js';

const DEMO_ACCOUNTS = {
    admin: { email: 'admin@gmail.com', password: 'password', remember_me: true },
    tecnico: { email: 'tecnico@gmail.com', password: 'password', remember_me: true },
};

export default function Login({ urls }) {
    const [form, setForm] = useState({
        email: '',
        password: '',
        remember_me: false,
    });
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
            email: form.email.trim().toLowerCase(),
            password: form.password,
            remember_me: Boolean(form.remember_me),
        };

        if (!isGmailEmail(payload.email)) {
            setErrors({ email: ['El correo debe tener el formato usuario@gmail.com.'] });
            setSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(urls.login, payload);
            window.location.href = response.data.redirect ?? urls.home;
        } catch (error) {
            const payload = error.response?.data?.errors;
            setErrors(payload ?? { credentials: ['Las credenciales no son validas.'] });
            setSubmitting(false);
        }
    };

    return (
        <AuthShell compact>
            <div className="hex-stage">
                <div className="hex-avatar">
                    <UserGlyph className="h-10 w-10" />
                </div>

                <div className="hex-glass">
                    <h1 className="mb-5 text-center text-3xl font-light tracking-wide text-white">Iniciar sesion</h1>

                    <form onSubmit={submit} className="space-y-3" noValidate>
                        <label className="relative block">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/80">
                                <UserGlyph className="h-5 w-5" />
                            </span>
                            <input
                                type="text"
                                inputMode="email"
                                autoComplete="username"
                                value={form.email}
                                onChange={(event) => update('email', event.target.value)}
                                className="auth-input py-3 pl-12 pr-4"
                                placeholder="usuario@gmail.com"
                                required
                            />
                        </label>
                        {firstError(errors, 'email') ? <p className="text-center text-xs text-red-100">{firstError(errors, 'email')}</p> : null}

                        <label className="relative block">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/80">
                                <LockGlyph />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={form.password}
                                onChange={(event) => update('password', event.target.value)}
                                className="auth-input py-3 pl-12 pr-12"
                                placeholder="Contraseña"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-500"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOffGlyph /> : <EyeGlyph />}
                            </button>
                        </label>
                        {firstError(errors, 'password') ? <p className="text-center text-xs text-red-100">{firstError(errors, 'password')}</p> : null}
                        {firstError(errors, 'credentials') ? <p className="text-center text-xs text-red-100">{firstError(errors, 'credentials')}</p> : null}

                        <button type="submit" disabled={submitting} className="auth-login-btn mt-1">
                            {submitting ? 'Entrando...' : 'Entrar'}
                        </button>

                        <div className="flex items-center justify-between gap-3 px-2 pt-2 text-xs text-white/95">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.remember_me}
                                    onChange={(event) => update('remember_me', event.target.checked)}
                                    className="h-3.5 w-3.5 rounded-sm border-white/40 bg-white/20 text-sky-700 focus:ring-white"
                                />
                                Recordarme
                            </label>
                            <a href={urls.forgot} className="hover:underline">
                                Olvidaste tu contraseña?
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-2">
                <button
                    type="button"
                    onClick={() => setForm(DEMO_ACCOUNTS.admin)}
                    className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/30"
                >
                    Usar admin
                </button>
                <button
                    type="button"
                    onClick={() => setForm(DEMO_ACCOUNTS.tecnico)}
                    className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/30"
                >
                    Usar tecnico
                </button>
            </div>
            <p className="relative z-10 mt-3 text-center text-sm text-white/90">
                No tienes cuenta?{' '}
                <a href={urls.register} className="font-bold underline decoration-white/50 underline-offset-4">
                    Crear acceso
                </a>
            </p>
        </AuthShell>
    );
}
