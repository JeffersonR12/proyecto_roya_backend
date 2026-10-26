import { useState } from 'react';
import axios from 'axios';
import AuthAlert from '../components/AuthAlert.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { EyeGlyph, EyeOffGlyph, LockGlyph, UserGlyph } from '../components/Icons.jsx';
import { firstError } from '../components/Field.jsx';
import { alertFromAxiosError, validateLogin } from '../lib/authAlerts.js';

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
    const [alert, setAlert] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const update = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setAlert(null);
        setErrors({});
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

        const clientAlert = validateLogin(payload);

        if (clientAlert) {
            setAlert(clientAlert);
            setErrors(clientAlert.message.includes('gmail.com') ? { email: [clientAlert.message] } : {});
            setSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(urls.login, payload);
            setAlert({ type: 'success', message: response.data.message || 'Sesion iniciada correctamente.' });
            window.location.href = response.data.redirect ?? urls.home;
        } catch (error) {
            const payloadErrors = error.response?.data?.errors;
            setErrors(payloadErrors ?? { credentials: ['Las credenciales no son validas.'] });
            setAlert(alertFromAxiosError(error, 'Las credenciales no son validas.'));
            setSubmitting(false);
        }
    };

    return (
        <AuthShell>
            <h1 className="intro-form-title">Bienvenido de nuevo</h1>
            <p className="intro-form-copy">
                Ingresa tus credenciales autorizadas para gestionar parcelas, diagnosticos de campo y protocolos
                fitosanitarios.
            </p>

            <AuthAlert alert={alert} />

            <form onSubmit={submit} className="intro-form" noValidate>
                <label className="intro-label" htmlFor="login-email">
                    Correo electronico
                    <span className="intro-field">
                        <UserGlyph className="h-4 w-4" />
                        <input
                            id="login-email"
                            type="text"
                            inputMode="email"
                            autoComplete="username"
                            value={form.email}
                            onChange={(event) => update('email', event.target.value)}
                            placeholder="usuario@gmail.com"
                            required
                            aria-invalid={Boolean(firstError(errors, 'email'))}
                            aria-describedby={firstError(errors, 'email') ? 'login-email-error' : undefined}
                        />
                    </span>
                    {firstError(errors, 'email') ? <small id="login-email-error">{firstError(errors, 'email')}</small> : null}
                </label>

                <div className="intro-label">
                    <span className="intro-label-row">
                        <label htmlFor="login-password">Contraseña</label>
                        <a href={urls.forgot}>Olvidaste tu contraseña?</a>
                    </span>
                    <span className="intro-field">
                        <LockGlyph className="h-4 w-4" />
                        <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={form.password}
                            onChange={(event) => update('password', event.target.value)}
                            placeholder="Contraseña"
                            required
                            aria-invalid={Boolean(firstError(errors, 'password'))}
                            aria-describedby={firstError(errors, 'password') ? 'login-password-error' : undefined}
                        />
                        <button
                            type="button"
                            className="intro-icon-btn"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            aria-pressed={showPassword}
                        >
                            {showPassword ? <EyeOffGlyph /> : <EyeGlyph />}
                        </button>
                    </span>
                    {firstError(errors, 'password') ? <small id="login-password-error">{firstError(errors, 'password')}</small> : null}
                </div>

                <label className="intro-check-row" htmlFor="login-remember">
                    <input
                        id="login-remember"
                        type="checkbox"
                        checked={form.remember_me}
                        onChange={(event) => update('remember_me', event.target.checked)}
                    />
                    Mantener sesion activa en este dispositivo
                </label>

                <button type="submit" disabled={submitting} className="intro-submit">
                    {submitting ? 'Entrando...' : 'Acceder a mis parcelas'}
                </button>
            </form>

            <div className="intro-demo">
                <button type="button" onClick={() => { setForm(DEMO_ACCOUNTS.admin); setAlert(null); setErrors({}); }}>
                    Usar admin
                </button>
                <button type="button" onClick={() => { setForm(DEMO_ACCOUNTS.tecnico); setAlert(null); setErrors({}); }}>
                    Usar tecnico
                </button>
            </div>

            <p className="intro-switch">
                Aun no proteges tus cultivos con <strong>RiwiScan</strong>?{' '}
                <a href={urls.register}>Solicita un acceso de campo</a>
            </p>
        </AuthShell>
    );
}
