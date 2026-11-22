import { isGmailEmail, isPeruvianMobile } from './auth.js';

export function firstAuthMessage(errors) {
    if (!errors || typeof errors !== 'object') {
        return '';
    }

    const order = ['credentials', 'codigo_invitacion', 'email', 'phone', 'password', 'name', 'password_confirmation', 'terms'];

    for (const key of order) {
        const value = errors[key];
        const message = Array.isArray(value) ? value[0] : value;

        if (message) {
            return String(message);
        }
    }

    const first = Object.values(errors)[0];

    return String(Array.isArray(first) ? first[0] : first || '');
}

export function alertFromAxiosError(error, fallback) {
    const status = error?.response?.status;
    const data = error?.response?.data ?? {};

    if (status === 429) {
        return {
            type: 'warning',
            message: data.message || firstAuthMessage(data.errors) || 'Demasiados intentos. Espera un momento e intentalo de nuevo.',
        };
    }

    if (status === 419) {
        return {
            type: 'error',
            message: 'La sesion expiro. Recarga la pagina e intentalo de nuevo.',
        };
    }

    return {
        type: 'error',
        message: firstAuthMessage(data.errors) || data.message || fallback,
    };
}

export function validateLogin({ email, password }) {
    if (!String(email || '').trim() || !String(password || '')) {
        return { type: 'warning', message: 'Completa el correo y la contraseña.' };
    }

    if (!isGmailEmail(email)) {
        return { type: 'error', message: 'El correo debe tener el formato usuario@gmail.com.' };
    }

    return null;
}

/** Igual que Tenant::normalizarCodigoInvitacion: sin espacios ni guiones, en mayusculas. */
export function normalizeInviteCode(value) {
    return String(value || '').replace(/[\s-]+/g, '').toUpperCase();
}

export function validateResetPassword({ email, password, password_confirmation: confirmation, token }) {
    if (!token) {
        return { type: 'error', message: 'El enlace no es válido. Solicita uno nuevo.' };
    }

    if (!isGmailEmail(email)) {
        return { type: 'error', message: 'El correo debe tener el formato usuario@gmail.com.' };
    }

    if (String(password || '').length < 8) {
        return { type: 'error', message: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    if (password !== confirmation) {
        return { type: 'error', message: 'Las contraseñas no coinciden.' };
    }

    return null;
}

export function validateRegister(form) {
    if (!String(form?.name || '').trim() || !String(form?.email || '').trim() || !String(form?.password || '')) {
        return { type: 'warning', message: 'Completa nombre, correo y contraseña.' };
    }

    if (!isGmailEmail(form.email)) {
        return { type: 'error', message: 'El correo debe tener el formato usuario@gmail.com.' };
    }

    if (!isPeruvianMobile(form.phone)) {
        return { type: 'error', message: 'Ingresa un celular peruano: +51 9 seguido de 8 digitos.' };
    }

    // Solo en formularios que lo piden: el codigo ya no es opcional en el registro.
    if ('codigo_invitacion' in (form ?? {}) && !normalizeInviteCode(form.codigo_invitacion)) {
        return { type: 'warning', message: 'Ingresa el código de tu cooperativa. Pídeselo a tu administrador.' };
    }

    if (String(form.password).length < 8) {
        return { type: 'error', message: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    if (form.password !== form.password_confirmation) {
        return { type: 'error', message: 'Las contraseñas no coinciden.' };
    }

    if (!form.terms) {
        return { type: 'warning', message: 'Debes aceptar los terminos de uso.' };
    }

    return null;
}
