import { describe, expect, it } from 'vitest';
import {
    alertFromAxiosError,
    firstAuthMessage,
    normalizeInviteCode,
    validateLogin,
    validateRegister,
    validateResetPassword,
} from './authAlerts.js';

describe('codigo de cooperativa y restablecimiento', () => {
    const registro = {
        name: 'Ana',
        email: 'ana@gmail.com',
        phone: '987654321',
        password: 'password1',
        password_confirmation: 'password1',
        terms: true,
    };

    it('normaliza el codigo como el servidor', () => {
        expect(normalizeInviteCode(' k7m2q - x9pra ')).toBe('K7M2QX9PRA');
    });

    it('exige el codigo de cooperativa en el registro', () => {
        const alert = validateRegister({ ...registro, codigo_invitacion: '  ' });

        expect(alert.type).toBe('warning');
        expect(alert.message).toContain('código de tu cooperativa');
    });

    it('acepta el registro con codigo', () => {
        expect(validateRegister({ ...registro, codigo_invitacion: 'K7M2QX9PRA' })).toBeNull();
    });

    it('prioriza el error del codigo sobre los demas', () => {
        expect(firstAuthMessage({ email: ['x'], codigo_invitacion: ['Código no válido'] })).toBe('Código no válido');
    });

    it('valida el formulario de nueva contraseña', () => {
        const base = { token: 't', email: 'ana@gmail.com', password: 'password1', password_confirmation: 'password1' };

        expect(validateResetPassword(base)).toBeNull();
        expect(validateResetPassword({ ...base, token: '' }).message).toContain('enlace');
        expect(validateResetPassword({ ...base, password: 'corta', password_confirmation: 'corta' }).message).toContain('8 caracteres');
        expect(validateResetPassword({ ...base, password_confirmation: 'otra' }).message).toBe('Las contraseñas no coinciden.');
    });
});

describe('alertas de autenticacion', () => {
    it('prioriza el error generico de credenciales', () => {
        expect(
            firstAuthMessage({
                email: ['El correo es obligatorio.'],
                credentials: ['Las credenciales no son validas.'],
            }),
        ).toBe('Las credenciales no son validas.');
    });

    it('convierte 429 en alerta de espera', () => {
        const alert = alertFromAxiosError({
            response: {
                status: 429,
                data: { message: 'Demasiados intentos. Espera un momento e intentalo de nuevo.' },
            },
        });

        expect(alert.type).toBe('warning');
        expect(alert.message).toContain('Demasiados intentos');
    });

    it('exige Gmail en login', () => {
        expect(validateLogin({ email: 'usuario@hotmail.com', password: 'password' }).message).toContain(
            'usuario@gmail.com',
        );
    });

    it('avisa si el login esta incompleto', () => {
        expect(validateLogin({ email: '', password: '' }).type).toBe('warning');
    });

    it('rechaza registro con contraseñas distintas', () => {
        const alert = validateRegister({
            name: 'Ana',
            email: 'ana@gmail.com',
            phone: '987654321',
            password: 'password1',
            password_confirmation: 'password2',
            terms: true,
        });

        expect(alert.message).toBe('Las contraseñas no coinciden.');
    });

    it('exige aceptar terminos en registro', () => {
        const alert = validateRegister({
            name: 'Ana',
            email: 'ana@gmail.com',
            phone: '+51987654321',
            password: 'password1',
            password_confirmation: 'password1',
            terms: false,
        });

        expect(alert.type).toBe('warning');
        expect(alert.message).toContain('terminos');
    });

    it('exige celular peruano +51 9xxxxxxxx', () => {
        const alert = validateRegister({
            name: 'Ana',
            email: 'ana@gmail.com',
            phone: '123456789',
            password: 'password1',
            password_confirmation: 'password1',
            terms: true,
        });

        expect(alert.message).toContain('+51');
    });

    it('acepta celular nacional que empieza con 9', () => {
        expect(
            validateRegister({
                name: 'Ana',
                email: 'ana@gmail.com',
                phone: '987654321',
                password: 'password1',
                password_confirmation: 'password1',
                terms: true,
            }),
        ).toBeNull();
    });
});
