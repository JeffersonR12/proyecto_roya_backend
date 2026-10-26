import { isGmailEmail, isPeruvianMobile } from './auth.js';

export function firstAuthMessage(errors) {
    if (!errors || typeof errors !== 'object') {
        return '';
    }

    const order = ['credentials', 'email', 'phone', 'password', 'name', 'password_confirmation', 'terms', 'role'];

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
