import { useState } from 'react';
import axios from 'axios';
import AuthAlert from '../components/AuthAlert.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { UserGlyph } from '../components/Icons.jsx';
import { isGmailEmail } from '../lib/auth.js';
import { alertFromAxiosError } from '../lib/authAlerts.js';

// Destino del enlace del correo: /reset-password/{token}?email=...
export default function ResetPassword({ urls, reset }) {
    const [email, setEmail] = useState(reset?.email || '');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [alert, setAlert] = useState(
        reset?.token ? null : { type: 'error', message: 'El enlace no es valido. Solicita uno nuevo.' },
    );
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setAlert(null);

        const normalizedEmail = email.trim().toLowerCase();

        if (!isGmailEmail(normalizedEmail)) {
            setAlert({ type: 'error', message: 'El correo debe tener el formato usuario@gmail.com.' });
            return;
        }
        if (password.length < 8) {
            setAlert({ type: 'error', message: 'La contraseña debe tener al menos 8 caracteres.' });
            return;
        }
        if (password !== confirmation) {
            setAlert({ type: 'error', message: 'Las contraseñas no coinciden.' });
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.post(urls.reset, {
                token: reset?.token,
                email: normalizedEmail,
                password,
                password_confirmation: confirmation,
            });
            setDone(true);
            setAlert({ type: 'success', message: response.data.message });
            window.setTimeout(() => {
                window.location.href = response.data.redirect || urls.login;
            }, 1800);
        } catch (error) {
            const errors = error?.response?.data?.errors;
            setAlert(
                errors?.token
                    ? { type: 'error', message: errors.token[0] }
                    : alertFromAxiosError(error, 'No se pudo restablecer la contraseña.'),
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell>
            <h1 className="intro-form-title">Nueva contraseña</h1>
            <p className="intro-form-copy">Elige una contraseña de al menos 8 caracteres. El enlace solo funciona una vez.</p>
            <AuthAlert alert={alert} />
            <form onSubmit={submit} className="intro-form" noValidate>
                <label className="intro-label">
                    Correo electronico
                    <span className="intro-field">
                        <UserGlyph className="h-4 w-4" />
                        <input
                            type="text"
                            inputMode="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="usuario@gmail.com"
                            required
                        />
                    </span>
                </label>
                <label className="intro-label">
                    Nueva contraseña
                    <span className="intro-field">
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={8}
                            required
                        />
                    </span>
                </label>
                <label className="intro-label">
                    Confirmar contraseña
                    <span className="intro-field">
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={confirmation}
                            onChange={(event) => setConfirmation(event.target.value)}
                            minLength={8}
                            required
                        />
                    </span>
                </label>
                <button type="submit" disabled={submitting || done || !reset?.token} className="intro-submit">
                    {submitting ? 'Guardando...' : 'Guardar contraseña'}
                </button>
            </form>
            <p className="intro-switch">
                <a href={urls.forgot}>Solicitar otro enlace</a> · <a href={urls.login}>Iniciar sesion</a>
            </p>
        </AuthShell>
    );
}
