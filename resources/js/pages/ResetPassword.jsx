import { useState } from 'react';
import axios from 'axios';
import AuthAlert from '../components/AuthAlert.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { EyeGlyph, EyeOffGlyph, LockGlyph, UserGlyph } from '../components/Icons.jsx';
import { firstError } from '../components/Field.jsx';
import { alertFromAxiosError, validateResetPassword } from '../lib/authAlerts.js';

export default function ResetPassword({ urls, token, initialEmail = '' }) {
    const [form, setForm] = useState({ email: initialEmail, password: '', password_confirmation: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(token ? null : { type: 'error', message: 'El enlace no es válido. Solicita uno nuevo.' });
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const update = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setAlert(null);
        setErrors({});
    };

    const submit = async (event) => {
        event.preventDefault();
        setErrors({});

        const payload = { ...form, email: form.email.trim().toLowerCase(), token };
        const clientAlert = validateResetPassword(payload);

        if (clientAlert) {
            setAlert(clientAlert);
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.post(urls.reset, payload);
            setDone(true);
            setAlert({ type: 'success', message: response.data.message });
        } catch (error) {
            setErrors(error.response?.data?.errors ?? {});
            setAlert(alertFromAxiosError(error, 'No se pudo restablecer la contraseña.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell>
            <h1 className="intro-form-title">Nueva contraseña</h1>
            <p className="intro-form-copy">Elige una contraseña de al menos 8 caracteres para tu cuenta.</p>
            <AuthAlert alert={alert} />
            {done ? (
                <a href={urls.login} className="intro-submit">Iniciar sesión</a>
            ) : (
                <form onSubmit={submit} className="intro-form" noValidate>
                    <label className="intro-label" htmlFor="reset-email">
                        Correo electronico
                        <span className="intro-field">
                            <UserGlyph className="h-4 w-4" />
                            <input id="reset-email" type="text" inputMode="email" autoComplete="email" placeholder="usuario@gmail.com" value={form.email} onChange={(event) => update('email', event.target.value)} required aria-invalid={Boolean(firstError(errors, 'email'))} />
                        </span>
                    </label>

                    <label className="intro-label" htmlFor="reset-password">
                        Nueva contraseña
                        <span className="intro-field">
                            <LockGlyph className="h-4 w-4" />
                            <input
                                id="reset-password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Minimo 8 caracteres"
                                value={form.password}
                                onChange={(event) => update('password', event.target.value)}
                                required
                                aria-invalid={Boolean(firstError(errors, 'password'))}
                                aria-describedby={firstError(errors, 'password') ? 'reset-password-error' : undefined}
                            />
                            <button type="button" className="intro-icon-btn" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword}>
                                {showPassword ? <EyeOffGlyph /> : <EyeGlyph />}
                            </button>
                        </span>
                        {firstError(errors, 'password') ? <small id="reset-password-error">{firstError(errors, 'password')}</small> : null}
                    </label>

                    <label className="intro-label" htmlFor="reset-password-confirm">
                        Confirmar contraseña
                        <span className="intro-field">
                            <input
                                id="reset-password-confirm"
                                className="is-plain"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Confirmar contraseña"
                                value={form.password_confirmation}
                                onChange={(event) => update('password_confirmation', event.target.value)}
                                required
                            />
                        </span>
                    </label>

                    <button type="submit" disabled={submitting || !token} className="intro-submit">
                        {submitting ? 'Guardando...' : 'Guardar contraseña'}
                    </button>
                </form>
            )}
            <p className="intro-switch">
                <a href={urls.forgot}>Pedir un enlace nuevo</a> · <a href={urls.login}>Volver a iniciar sesion</a>
            </p>
        </AuthShell>
    );
}
