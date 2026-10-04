import { useState } from 'react';
import axios from 'axios';
import AuthShell from '../components/AuthShell.jsx';
import { EyeGlyph, EyeOffGlyph, LockGlyph, UserGlyph } from '../components/Icons.jsx';
import { firstError } from '../components/Field.jsx';

export default function ResetPassword({ urls, reset }) {
    const [form, setForm] = useState({
        email: reset?.email ?? '',
        password: '',
        password_confirmation: '',
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

        try {
            const response = await axios.post('/reset-password', {
                token: reset?.token,
                email: form.email.trim().toLowerCase(),
                password: form.password,
                password_confirmation: form.password_confirmation,
            });
            window.location.href = response.data.redirect ?? urls.login;
        } catch (error) {
            setErrors(error.response?.data?.errors ?? { email: ['No se pudo actualizar la contraseña.'] });
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
                    <h1 className="mb-5 text-center text-3xl font-light tracking-wide">Nueva contraseña</h1>
                    <form onSubmit={submit} className="space-y-3" noValidate>
                        <input
                            type="text"
                            inputMode="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(event) => update('email', event.target.value)}
                            className="auth-input px-4 py-3"
                            placeholder="usuario@gmail.com"
                            required
                        />
                        {firstError(errors, 'email') ? <p className="text-center text-xs text-red-100">{firstError(errors, 'email')}</p> : null}

                        <label className="relative block">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700/80">
                                <LockGlyph />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={form.password}
                                onChange={(event) => update('password', event.target.value)}
                                className="auth-input py-3 pl-12 pr-12"
                                placeholder="Nueva contraseña"
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
                        <p className="px-1 text-center text-xs text-white/75">Minimo 8 caracteres, con mayusculas, minusculas y un numero.</p>
                        {firstError(errors, 'password') ? <p className="text-center text-xs text-red-100">{firstError(errors, 'password')}</p> : null}

                        <input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={form.password_confirmation}
                            onChange={(event) => update('password_confirmation', event.target.value)}
                            className="auth-input px-4 py-3"
                            placeholder="Confirmar contraseña"
                            required
                        />

                        <button type="submit" disabled={submitting} className="auth-login-btn">
                            {submitting ? 'Guardando...' : 'Guardar contraseña'}
                        </button>
                        <p className="text-center text-xs text-white/90">
                            <a href={urls.login} className="hover:underline">
                                Volver a iniciar sesion
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </AuthShell>
    );
}
