import { useState } from 'react';
import axios from 'axios';
import AuthAlert from '../components/AuthAlert.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { EyeGlyph, EyeOffGlyph, LockGlyph, UserGlyph } from '../components/Icons.jsx';
import { firstError } from '../components/Field.jsx';
import { alertFromAxiosError, validateRegister } from '../lib/authAlerts.js';
import { formatPeruvianPhoneInput, toE164Peru } from '../lib/auth.js';

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
            ...form,
            email: form.email.trim().toLowerCase(),
            phone: toE164Peru(form.phone),
        };

        const clientAlert = validateRegister(payload);

        if (clientAlert) {
            setAlert(clientAlert);
            setSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(urls.register, payload);
            setAlert({ type: 'success', message: response.data.message || 'Cuenta creada correctamente.' });
            window.location.href = response.data.redirect ?? urls.home;
        } catch (error) {
            const payloadErrors = error.response?.data?.errors;
            setErrors(payloadErrors ?? { email: ['No se pudo crear la cuenta.'] });
            setAlert(alertFromAxiosError(error, 'No se pudo crear la cuenta.'));
            setSubmitting(false);
        }
    };

    return (
        <AuthShell>
            <h1 className="intro-form-title">Crear acceso de campo</h1>
            <p className="intro-form-copy">
                Registra tu cuenta Gmail, celular peruano +51 y rol operativo para inspeccionar lotes de trigo.
            </p>
            <AuthAlert alert={alert} />
            <form onSubmit={submit} className="intro-form" noValidate>
                <label className="intro-label" htmlFor="register-name">
                    Nombre completo
                    <span className="intro-field">
                        <input id="register-name" className="is-plain" autoComplete="name" placeholder="Nombre completo" value={form.name} onChange={(event) => update('name', event.target.value)} required aria-invalid={Boolean(firstError(errors, 'name'))} aria-describedby={firstError(errors, 'name') ? 'register-name-error' : undefined} />
                    </span>
                    {firstError(errors, 'name') ? <small id="register-name-error">{firstError(errors, 'name')}</small> : null}
                </label>

                <label className="intro-label" htmlFor="register-email">
                    Correo electronico
                    <span className="intro-field">
                        <UserGlyph className="h-4 w-4" />
                        <input id="register-email" type="text" inputMode="email" autoComplete="email" placeholder="usuario@gmail.com" value={form.email} onChange={(event) => update('email', event.target.value)} required aria-invalid={Boolean(firstError(errors, 'email'))} aria-describedby={firstError(errors, 'email') ? 'register-email-error' : undefined} />
                    </span>
                    {firstError(errors, 'email') ? <small id="register-email-error">{firstError(errors, 'email')}</small> : null}
                </label>

                <label className="intro-label" htmlFor="register-phone">
                    Celular peruano
                    <span className="intro-field">
                        <span className="intro-prefix">+51</span>
                        <input
                            id="register-phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            maxLength={9}
                            placeholder="987654321"
                            value={form.phone}
                            onChange={(event) => update('phone', formatPeruvianPhoneInput(event.target.value))}
                            required
                            aria-invalid={Boolean(firstError(errors, 'phone'))}
                            aria-describedby={firstError(errors, 'phone') ? 'register-phone-error' : undefined}
                        />
                    </span>
                    {firstError(errors, 'phone') ? <small id="register-phone-error">{firstError(errors, 'phone')}</small> : null}
                </label>

                <label className="intro-label" htmlFor="register-org">
                    Finca o cooperativa
                    <span className="intro-field">
                        <input id="register-org" className="is-plain" autoComplete="organization" placeholder="Cooperativa El Roble" value={form.organization} onChange={(event) => update('organization', event.target.value)} />
                    </span>
                </label>

                <label className="intro-label" htmlFor="register-role">
                    Rol operativo
                    <span className="intro-field">
                        <select id="register-role" value={form.role} onChange={(event) => update('role', event.target.value)} aria-invalid={Boolean(firstError(errors, 'role'))}>
                            <option value="agricultor">Agricultor</option>
                            <option value="tecnico">Tecnico de campo</option>
                            <option value="administrador">Administrador</option>
                        </select>
                    </span>
                    {firstError(errors, 'role') ? <small>{firstError(errors, 'role')}</small> : null}
                </label>

                <label className="intro-label" htmlFor="register-password">
                    Contraseña
                    <span className="intro-field">
                        <LockGlyph className="h-4 w-4" />
                        <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Minimo 8 caracteres"
                            value={form.password}
                            onChange={(event) => update('password', event.target.value)}
                            required
                            aria-invalid={Boolean(firstError(errors, 'password'))}
                            aria-describedby={firstError(errors, 'password') ? 'register-password-error' : undefined}
                        />
                        <button type="button" className="intro-icon-btn" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword}>
                            {showPassword ? <EyeOffGlyph /> : <EyeGlyph />}
                        </button>
                    </span>
                    {firstError(errors, 'password') ? <small id="register-password-error">{firstError(errors, 'password')}</small> : null}
                </label>

                <label className="intro-label" htmlFor="register-password-confirm">
                    Confirmar contraseña
                    <span className="intro-field">
                        <input
                            id="register-password-confirm"
                            className="is-plain"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Confirmar contraseña"
                            value={form.password_confirmation}
                            onChange={(event) => update('password_confirmation', event.target.value)}
                            required
                            aria-invalid={Boolean(firstError(errors, 'password_confirmation'))}
                            aria-describedby={firstError(errors, 'password_confirmation') ? 'register-confirm-error' : undefined}
                        />
                    </span>
                    {firstError(errors, 'password_confirmation') ? <small id="register-confirm-error">{firstError(errors, 'password_confirmation')}</small> : null}
                </label>

                <label className="intro-check-row" htmlFor="register-terms">
                    <input id="register-terms" type="checkbox" checked={form.terms} onChange={(event) => update('terms', event.target.checked)} aria-invalid={Boolean(firstError(errors, 'terms'))} />
                    Acepto el uso de datos para inspecciones agricolas.
                </label>
                {firstError(errors, 'terms') ? <small className="intro-field-error" id="register-terms-error">{firstError(errors, 'terms')}</small> : null}

                <button type="submit" disabled={submitting} className="intro-submit">
                    {submitting ? 'Creando...' : 'Registrarme'}
                </button>
            </form>
            <p className="intro-switch">
                Ya tienes cuenta? <a href={urls.login}>Iniciar sesion</a>
            </p>
        </AuthShell>
    );
}
