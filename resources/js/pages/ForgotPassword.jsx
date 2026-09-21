import { useState } from 'react';
import axios from 'axios';
import AuthShell from '../components/AuthShell.jsx';
import { UserGlyph } from '../components/Icons.jsx';
import { firstError } from '../components/Field.jsx';
import { isGmailEmail } from '../lib/auth.js';

export default function ForgotPassword({ urls }) {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        setMessage('');

        const normalizedEmail = email.trim().toLowerCase();

        if (!isGmailEmail(normalizedEmail)) {
            setErrors({ email: ['El correo debe tener el formato usuario@gmail.com.'] });
            setSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(urls.forgot, { email: normalizedEmail });
            setMessage(response.data.message);
        } catch (error) {
            setErrors(error.response?.data?.errors ?? { email: ['No se pudo procesar la solicitud.'] });
        } finally {
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
                    <h1 className="mb-6 text-center text-3xl font-light tracking-wide">Recuperar acceso</h1>
                    <form onSubmit={submit} className="space-y-3.5" noValidate>
                        <input
                            type="text"
                            inputMode="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="auth-input px-4 py-3"
                            placeholder="usuario@gmail.com"
                            required
                        />
                        {firstError(errors, 'email') ? <p className="text-center text-xs text-red-100">{firstError(errors, 'email')}</p> : null}
                        {message ? <p className="text-center text-xs text-emerald-100">{message}</p> : null}
                        <button type="submit" disabled={submitting} className="auth-login-btn">
                            {submitting ? 'Enviando...' : 'Enviar'}
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
