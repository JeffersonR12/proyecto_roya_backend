import { useState } from 'react';
import axios from 'axios';
import AuthAlert from '../components/AuthAlert.jsx';
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
        <AuthShell>
            <h1 className="intro-form-title">Recuperar acceso</h1>
            <p className="intro-form-copy">Si el correo existe, te enviaremos instrucciones. El mensaje es el mismo en ambos casos.</p>
            <AuthAlert alert={errors.email ? { type: 'error', message: firstError(errors, 'email') } : message ? { type: 'success', message } : null} />
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
                <button type="submit" disabled={submitting} className="intro-submit">
                    {submitting ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
            </form>
            <p className="intro-switch">
                <a href={urls.login}>Volver a iniciar sesion</a>
            </p>
        </AuthShell>
    );
}
